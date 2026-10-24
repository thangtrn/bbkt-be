import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const genreModel = pgTable('bs_genre', {
  id: uuid('id').primaryKey().notNull(),

  slug: varchar('slug').notNull().unique(),
  name: varchar('title').notNull(),
  description: varchar('description').notNull(),

  createdBy: varchar('created_by').notNull(),
  updatedBy: varchar('updated_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type GenreModel = InferSelectModel<typeof genreModel>;
export type InsertGenreModel = InferInsertModel<typeof genreModel>;
