import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Paginated } from '@/core/ddd';
import { GeneratedFindOptions } from '@/libs/query-builder/filter.interface';
import { GenreEntity } from '../../domain/genre.entity';
import { GENRE_REPOSITORY } from '../../genre.di-tokens';
import { GenreRepositoryPort } from '../../repositories/genre.repository.port';

export class FindGenresQuery extends Query<Paginated<GenreEntity>> {
  constructor(public readonly params: GeneratedFindOptions) {
    super();
  }
}

@QueryHandler(FindGenresQuery)
export class FindGenresQueryHandler implements IQueryHandler<FindGenresQuery> {
  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepo: GenreRepositoryPort,
  ) {}

  async execute(command: FindGenresQuery): Promise<Paginated<GenreEntity>> {
    const genreEntity = await this.genreRepo.findAllPaginated(command.params);

    return genreEntity;
  }
}
