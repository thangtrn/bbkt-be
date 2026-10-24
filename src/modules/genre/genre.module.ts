import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateGenreCommandHandler } from './application/commands/create-genre.command';
import { DeleteGenreCommandHandler } from './application/commands/delete-genre.command';
import { UpdateGenreCommandHandler } from './application/commands/update-genre.command';
import { FindGenreByIdQueryHandler } from './application/queries/find-genre-by-id.query';
import { FindGenresQueryHandler } from './application/queries/find-genres.query';
import { GENRE_REPOSITORY } from './genre.di-tokens';
import { GenreMapper } from './mappers/genre.mapper';
import { GenreController } from './presentation/controllers/genre.controller';
import { GenreRepository } from './repositories/genre.repository';

const httpControllers = [GenreController];

const messageControllers = [];

const commandHandlers: Provider[] = [
  CreateGenreCommandHandler,
  UpdateGenreCommandHandler,
  DeleteGenreCommandHandler,
];

const queryHandlers: Provider[] = [
  FindGenreByIdQueryHandler,
  FindGenresQueryHandler,
];

const domainServices = [];

const mappers: Provider[] = [GenreMapper];

const repositories: Provider[] = [
  {
    provide: GENRE_REPOSITORY,
    useClass: GenreRepository,
  },
];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
    ...domainServices,
    ...mappers,
  ],
})
export class GenreModule {}
