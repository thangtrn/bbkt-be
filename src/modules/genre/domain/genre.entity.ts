import { v7 as uuidv7 } from 'uuid';
import { BaseEntity } from '@/core/ddd/entity.base';
import { CreateGenreProps, GenreProps } from './genre.type';

export class GenreEntity extends BaseEntity<GenreProps> {
  constructor(props: GenreProps) {
    super(props);
  }

  static create(props: CreateGenreProps): GenreEntity {
    return new GenreEntity({
      ...props,
      id: uuidv7(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
