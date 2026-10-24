import { SQL } from 'drizzle-orm';
import { Paginated } from '../ddd/paginated.base';
import { ObjectLiteral, RequireFields } from '../types';

export type OrderBy = () => SQL[];

export type QueryParams = {
  where?: SQL;
  orderBy?: OrderBy;
};

export type PaginatedQueryParams = QueryParams & {
  offset: number;
  limit: number;
};

export interface Repository<Entity> {
  insert(entity: Entity): Promise<Entity>;
  update(id: string, props: ObjectLiteral): Promise<Entity | null>;
  delete(id: string): Promise<Entity | null>;

  findOne(params: RequireFields<QueryParams, 'where'>): Promise<Entity | null>;
  findOneById(id: string): Promise<Entity | null>;
  findAll(params: QueryParams): Promise<Entity[]>;
  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Entity>>;
}
