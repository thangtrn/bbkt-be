import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { InferUpdateModel } from '@/core/types';
import { recordSchemaModel } from './record-schema.model';

export const recordDataModel = pgTable('record_data', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Khóa ngoại trỏ đến Model 1 để biết data này thuộc cấu trúc nào
  schemaId: uuid('schema_id')
    .notNull()
    .references(() => recordSchemaModel.id, { onDelete: 'cascade' }),

  dataValues: jsonb('data_values')
    .$type<Record<string, unknown> | Record<string, unknown>[]>()
    .notNull(), // Lưu object dữ liệu thực tế (json số 2 của bạn)

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type RecordDataModel = InferSelectModel<typeof recordDataModel>;
export type InsertRecordDataModel = InferInsertModel<typeof recordDataModel>;
export type UpdateRecordDataModel = InferUpdateModel<typeof recordDataModel>;
