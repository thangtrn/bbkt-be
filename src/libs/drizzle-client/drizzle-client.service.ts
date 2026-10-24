import { Inject, Injectable } from '@nestjs/common';
import * as schema from '@drizzle/main';
import { drizzle } from 'drizzle-orm/node-postgres';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import { DRIZZLE_CLIENT_MODULE_OPTIONS } from './drizzle-client.module-definition';
import { DrizzleClient, DrizzleClientOptions } from './interfaces';

@Injectable()
export class DrizzleClientService {
  private readonly _client: DrizzleClient;

  constructor(
    @Inject(DRIZZLE_CLIENT_MODULE_OPTIONS)
    private readonly options: DrizzleClientOptions,
  ) {
    const rawClient = drizzle({
      client: new Pool({
        connectionString: options.databaseUrl,
      }),
      schema,
    });

    // Proxy: intercept insert / update / delete
    this._client = new Proxy(rawClient, {
      get: (originalClient, methodName, receiver) => {
        if (['insert', 'update', 'delete'].includes(methodName as string)) {
          return (table: AnyPgTable, ...queryArgs: any[]) => {
            const action = (methodName as string).toUpperCase();
            const queryBuilder = (originalClient as any)[methodName](
              table,
              ...queryArgs,
            );

            const tableName =
              (table as any).tableName ??
              (table as any)[Symbol.for('drizzle:Name')];

            console.log(`[Drizzle][${action}] on table ${tableName}`);

            return new Proxy(queryBuilder, {
              get(target, prop, receiver) {
                if (prop === 'then') {
                  // để drizzle query hoạt động như Promise thực
                  return Reflect.get(target, prop, receiver);
                }
                return Reflect.get(target, prop, receiver);
              },
            });
          };
        }

        return Reflect.get(originalClient, methodName, receiver);
      },
    });
  }

  get client(): DrizzleClient {
    return this._client;
  }
}
