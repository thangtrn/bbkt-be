import { eq, getTableName } from 'drizzle-orm';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { count, SQL } from 'drizzle-orm/sql';
import { DrizzleClientService } from '@/libs/drizzle-client/drizzle-client.service';
import { DrizzleClient } from '@/libs/drizzle-client/interfaces';
import { BaseEntity, Mapper, Paginated } from '../ddd';
import { ObjectLiteral, RequireFields } from '../types';
import {
  PaginatedQueryParams,
  QueryParams,
  Repository,
} from './drizzle-client.repository.port';

export abstract class DrizzleClientRepository<
  TEntity extends BaseEntity<any>,
  TDbModel extends ObjectLiteral,
> implements Repository<TEntity>
{
  protected abstract model: AnyPgTable;

  constructor(
    protected readonly drizzleClientService: DrizzleClientService,
    protected readonly mapper: Mapper<TEntity, TDbModel>,
  ) {}

  protected get _client(): DrizzleClient {
    return this.drizzleClientService.client;
  }

  async insert(entity: TEntity): Promise<TEntity> {
    const record = this.mapper.toPersistence(entity);

    await this._client.insert(this.model).values(record);

    return entity;
  }

  async update(id: string, props: ObjectLiteral): Promise<TEntity | null> {
    const result = await this._client
      .update(this.model)
      .set(props)
      .where(eq((this.model as any).id, id))
      .returning();

    return result[0] ? this.mapper.toDomain(result[0] as TDbModel) : null;
  }

  async delete(id: string): Promise<TEntity | null> {
    const result = await this._client
      .delete(this.model)
      .where(eq((this.model as any).id, id))
      .returning();

    return result[0] ? this.mapper.toDomain(result[0] as TDbModel) : null;
  }

  async findOne(
    params: RequireFields<QueryParams, 'where'>,
  ): Promise<TEntity | null> {
    const { where, orderBy = () => [] } = params;
    const result = (await this._client
      .select()
      .from(this.model)
      .where(where)
      .orderBy(orderBy)) as TDbModel[];

    return result[0] ? this.mapper.toDomain(result[0]) : null;
  }

  async findOneById(id: string): Promise<TEntity | null> {
    const result = (await this._client
      .select()
      .from(this.model)
      .where(eq((this.model as any).id, id))) as TDbModel[];

    return result[0] ? this.mapper.toDomain(result[0]) : null;
  }

  async findAll(params: Partial<QueryParams>): Promise<TEntity[]> {
    const { where, orderBy = () => [] } = params;
    const results = await this._client
      .select()
      .from(this.model)
      .where(where)
      .orderBy(orderBy);

    return results.map((result) => this.mapper.toDomain(result as TDbModel));
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
  ): Promise<Paginated<TEntity>> {
    const { where, orderBy = () => [], limit, offset } = params;
    const [results, total = [{ count: 0 }]] = await Promise.all([
      this._client
        .select()
        .from(this.model)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      this._client.select({ count: count() }).from(this.model).where(where),
    ]);

    return new Paginated<TEntity>({
      total: total[0].count,
      limit,
      page: Math.floor(offset / limit) + 1,
      data: results.map((result) => this.mapper.toDomain(result as TDbModel)),
    });
  }
}
