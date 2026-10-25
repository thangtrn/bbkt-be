import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, jsonb, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { recordSchemaModel } from './record-schema.model';

export const recordDataModel = pgTable('record_data', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),

  // Khóa ngoại trỏ đến Model 1 để biết data này thuộc cấu trúc nào
  schemaId: bigint({ mode: 'number' })
    .notNull()
    .references(() => recordSchemaModel.id, { onDelete: 'cascade' }),

  dataValues: jsonb('data_values').notNull(), // Lưu object dữ liệu thực tế (json số 2 của bạn)

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type RecordDataModel = InferSelectModel<typeof recordDataModel>;
export type InsertRecordDataModel = InferInsertModel<typeof recordDataModel>;
