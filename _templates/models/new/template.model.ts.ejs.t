---
to: drizzle/main/models/<%= h.changeCase.param(name) %>.model.ts
---

import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const <%= h.changeCase.camel(name) %>Model = pgTable('<%= h.changeCase.snake(prefix) %>_<%= h.changeCase.snake(name) %>', {
  id: uuid('id').primaryKey().notNull(),

  createdBy: varchar('created_by').notNull(),
  updatedBy: varchar('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type <%= h.changeCase.pascal(name) %>Model = InferSelectModel<typeof <%= h.changeCase.camel(name) %>Model>;
export type Insert<%= h.changeCase.pascal(name) %>Model = InferInsertModel<typeof <%= h.changeCase.camel(name) %>Model>;
