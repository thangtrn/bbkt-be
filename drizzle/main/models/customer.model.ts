import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const customerModel = pgTable('bs_customer', {
  id: uuid('id').primaryKey().notNull(),

  customerCode: varchar('customer_code', { length: 100 }).unique().notNull(),
  customerName: varchar('customer_name').notNull(),
  customerTypeCode: varchar('customer_type_code', { length: 100 }),
  companyName: varchar('company_name'),
  customerType: varchar('customer_type', { length: 50 }).notNull(),
  address: varchar('address'),
  taxCode: varchar('tax_code', { length: 50 }).notNull(),
  email: text('email').array().default([]).notNull(),
  phone: text('phone').array().default([]).notNull(),
  isActive: boolean('is_active').default(false),

  creditLimit: integer('credit_limit').default(0).notNull(),
  creditBalance: decimal('credit_balance', { precision: 10, scale: 2 })
    .default('10.00')
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type CustomerModel = InferSelectModel<typeof customerModel>;
export type InsertCustomerModel = InferInsertModel<typeof customerModel>;
