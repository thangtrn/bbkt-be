import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GenreEntity } from '../../domain/genre.entity';
import { GenreAlreadyExistsError } from '../../domain/genre.error';
import { GENRE_REPOSITORY } from '../../genre.di-tokens';
import { GenreRepositoryPort } from '../../repositories/genre.repository.port';

export class FindGenreByIdQuery extends Query<GenreEntity> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(FindGenreByIdQuery)
export class FindGenreByIdQueryHandler
  implements IQueryHandler<FindGenreByIdQuery>
{
  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepo: GenreRepositoryPort,
  ) {}

  async execute(command: FindGenreByIdQuery): Promise<GenreEntity> {
    const genreEntity = await this.genreRepo.findOneById(command.id);

    if (!genreEntity) {
      throw new GenreAlreadyExistsError();
    }

    return genreEntity;
  }
}
