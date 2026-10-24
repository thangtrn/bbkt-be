import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { genreModel } from '@drizzle/main';
import { eq } from 'drizzle-orm';
import { CommandProps } from '@/core/dtos';
import { GenreEntity } from '../../domain/genre.entity';
import { GenreAlreadyExistsError } from '../../domain/genre.error';
import { GENRE_REPOSITORY } from '../../genre.di-tokens';
import { GenreRepositoryPort } from '../../repositories/genre.repository.port';

export class CreateGenreCommand extends Command<GenreEntity> {
  readonly description: string;
  readonly slug: string;
  readonly name: string;
  readonly createdBy: string;
  readonly updatedBy: string;

  constructor(props: CommandProps<CreateGenreCommand>) {
    super();
    Object.assign(this, props);
  }
}

@CommandHandler(CreateGenreCommand)
export class CreateGenreCommandHandler
  implements ICommandHandler<CreateGenreCommand>
{
  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepo: GenreRepositoryPort,
  ) {}

  async execute(command: CreateGenreCommand): Promise<GenreEntity> {
    const existingGenre = await this.genreRepo.findOne({
      where: eq(genreModel.slug, command.slug),
    });

    if (existingGenre) {
      throw new GenreAlreadyExistsError();
    }

    const genreEntity = GenreEntity.create(command);

    return await this.genreRepo.insert(genreEntity);
  }
}
