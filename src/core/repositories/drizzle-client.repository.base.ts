import { eq } from 'drizzle-orm';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { count } from 'drizzle-orm/sql';
import { DrizzleClientService } from '@/libs/drizzle-client/drizzle-client.service';
import { DrizzleClient } from '@/libs/drizzle-client/interfaces';
import { Paginated } from '../ddd';
import { ObjectLiteral, RequireFields } from '../types';
import {
  PaginatedQueryParams,
  QueryParams,
  Repository,
} from './drizzle-client.repository.port';

export abstract class DrizzleClientRepository<TDbModel extends ObjectLiteral>
  implements Repository<TDbModel>
{
  protected abstract model: AnyPgTable;

  constructor(protected readonly drizzleClientService: DrizzleClientService) {}

  protected get _client(): DrizzleClient {
    return this.drizzleClientService.client;
  }

  async insert(entity: TDbModel): Promise<TDbModel> {
    const result = await this._client.insert(this.model).values(entity);

    return result[0];
  }

  async update(id: string, props: ObjectLiteral): Promise<TDbModel | null> {
    const result = await this._client
      .update(this.model)
      .set(props)
      .where(eq((this.model as any).id, id))
      .returning();

    return result[0] ? (result[0] as TDbModel) : null;
  }

  async delete(id: string): Promise<TDbModel | null> {
    const result = await this._client
      .delete(this.model)
      .where(eq((this.model as any).id, id))
      .returning();

    return result[0] ? (result[0] as TDbModel) : null;
  }

  async findOne(
    params: RequireFields<QueryParams, 'where'>,
  ): Promise<TDbModel | null> {
    const { where, orderBy = () => [] } = params;
    const result = (await this._client
      .select()
      .from(this.model)
      .where(where)
      .orderBy(orderBy)) as TDbModel[];

    return result[0] ? (result[0] as TDbModel) : null;
  }

  async findOneById(id: string): Promise<TDbModel | null> {
    const result = (await this._client
      .select()
      .from(this.model)
      .where(eq((this.model as any).id, id))) as TDbModel[];

    return result[0] ? (result[0] as TDbModel) : null;
  }

  async findAll(params: Partial<QueryParams>): Promise<TDbModel[]> {
    const { where, orderBy = () => [] } = params;
    const results = await this._client
      .select()
      .from(this.model)
      .where(where)
      .orderBy(orderBy);

    return results as TDbModel[];
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
  ): Promise<Paginated<TDbModel>> {
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

    return new Paginated<TDbModel>({
      total: total[0].count,
      limit,
      page: Math.floor(offset / limit) + 1,
      data: results as TDbModel[],
    });
  }
}
