import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const recordSchemaModel = pgTable('record_schema', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: varchar('name').notNull(),
  fieldsDefinition: jsonb('fields_definition')
    .$type<Record<string, unknown>>()
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
