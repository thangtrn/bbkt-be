import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommandProps } from '@/core/dtos';
import { GenreEntity } from '../../domain/genre.entity';
import { GenreNotFoundError } from '../../domain/genre.error';
import { UpdateGenreProps } from '../../domain/genre.type';
import { GENRE_REPOSITORY } from '../../genre.di-tokens';
import { GenreRepositoryPort } from '../../repositories/genre.repository.port';

export class UpdateGenreCommand extends Command<GenreEntity> {
  public readonly id: string;
  public readonly name?: string | undefined;
  public readonly slug?: string | undefined;
  public readonly description?: string | undefined;
  public readonly updatedBy: string;
  constructor(props: CommandProps<UpdateGenreCommand>) {
    super();
    Object.assign(this, props);
  }
}

@CommandHandler(UpdateGenreCommand)
export class UpdateGenreCommandHandler
  implements ICommandHandler<UpdateGenreCommand>
{
  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepo: GenreRepositoryPort,
  ) {}

  async execute(command: UpdateGenreCommand): Promise<GenreEntity> {
    const { id, ...props } = command;
    const genreEntity = await this.genreRepo.update(id, props);

    if (!genreEntity) {
      throw new GenreNotFoundError();
    }

    return genreEntity;
  }
}
