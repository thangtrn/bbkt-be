import { Repository } from '@/core/repositories/drizzle-client.repository.port';
import { GenreEntity } from '../domain/genre.entity';

export interface GenreRepositoryPort extends Repository<GenreEntity> {}
