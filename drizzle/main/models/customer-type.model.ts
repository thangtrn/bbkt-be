import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const customerTypeModel = pgTable('bs_customer_type', {
  id: uuid('id').primaryKey().notNull(),

  customerTypeCode: varchar('customer_type_code', { length: 100 })
    .unique()
    .notNull(),
  customerTypeName: varchar('customer_type_name').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type CustomerTypeModel = InferSelectModel<typeof customerTypeModel>;
export type InsertCustomerTypeModel = InferInsertModel<
  typeof customerTypeModel
>;
