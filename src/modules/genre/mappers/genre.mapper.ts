import { Injectable } from '@nestjs/common';
import { GenreModel } from '@drizzle/main';
import { Mapper } from '@/core/ddd';
import { GenreEntity } from '../domain/genre.entity';

@Injectable()
export class GenreMapper implements Mapper<GenreEntity, GenreModel> {
  toDomain(record: GenreModel): GenreEntity {
    return GenreEntity.create(record);
  }

  toPersistence(entity: GenreEntity): GenreModel {
    return entity.getProps();
  }
}
