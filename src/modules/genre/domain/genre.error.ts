import { ConflictException, NotFoundException } from '@nestjs/common';

export class GenreNotFoundError extends NotFoundException {
  constructor() {
    super({
      message: 'Genre not found',
      errorCode: 'GENRE.NOT_FOUND',
    });
  }
}

export class GenreAlreadyExistsError extends ConflictException {
  constructor() {
    super({
      message: 'Genre already exists',
      errorCode: 'GENRE.ALREADY_EXISTS',
    });
  }
}
