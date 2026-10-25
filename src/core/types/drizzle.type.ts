import { InferInsertModel } from 'drizzle-orm';

export type InferUpdateModel<T extends { $inferInsert: object }> = Partial<
  Omit<T['$inferInsert'], 'id'>
>;
