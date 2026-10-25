import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { InferUpdateModel } from '@/core/types';

export const recordSchemaModel = pgTable('record_schema', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: varchar('name').notNull(),
  code: varchar('code', { length: 50 }).notNull(), // phân loại record schema

  fieldsDefinition: jsonb('fields_definition')
    .$type<Record<string, unknown> | Record<string, unknown>[]>()
    .notNull(),

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
export type UpdateRecordSchemaModel = InferUpdateModel<
  typeof recordSchemaModel
>;
