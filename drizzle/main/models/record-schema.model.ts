import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const recordSchemaModel = pgTable('record_schema', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),

  name: varchar('name').notNull(),
  fieldsDefinition: jsonb('fields_definition').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type RecordSchemaModel = InferSelectModel<typeof recordSchemaModel>;
export type InsertRecordSchemaModel = InferInsertModel<
  typeof recordSchemaModel
>;
