import { Injectable } from '@nestjs/common';
import { genreModel, GenreModel } from '@drizzle/main';
import { DrizzleClientRepository } from '@/core/repositories/drizzle-client.repository';
import { DrizzleClientService } from '@/libs/drizzle-client/drizzle-client.service';
import { GenreEntity } from '../domain/genre.entity';
import { GenreMapper } from '../mappers/genre.mapper';
import { GenreRepositoryPort } from './genre.repository.port';

@Injectable()
export class GenreRepository
  extends DrizzleClientRepository<GenreEntity, GenreModel>
  implements GenreRepositoryPort
{
  protected model = genreModel;

  constructor(
    protected drizzleClientService: DrizzleClientService,
    protected mapper: GenreMapper,
  ) {
    super(drizzleClientService, mapper);
  }
}
