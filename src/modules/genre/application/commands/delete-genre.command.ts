import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenreEntity } from '../../domain/genre.entity';
import { GenreNotFoundError } from '../../domain/genre.error';
import { GENRE_REPOSITORY } from '../../genre.di-tokens';
import { GenreRepositoryPort } from '../../repositories/genre.repository.port';

export class DeleteGenreCommand extends Command<GenreEntity> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteGenreCommand)
export class DeleteGenreCommandHandler
  implements ICommandHandler<DeleteGenreCommand>
{
  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepo: GenreRepositoryPort,
  ) {}

  async execute(command: DeleteGenreCommand): Promise<GenreEntity> {
    const genreEntity = await this.genreRepo.delete(command.id);

    if (!genreEntity) {
      throw new GenreNotFoundError();
    }

    return genreEntity;
  }
}
