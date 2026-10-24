import { GenreModel, InsertGenreModel } from '@drizzle/main';
import { CreateEntityProps, UpdateEntityProps } from '@/core/ddd';

export type GenreProps = GenreModel;

export type CreateGenreProps = CreateEntityProps<InsertGenreModel>;

export type UpdateGenreProps = UpdateEntityProps<InsertGenreModel>;
