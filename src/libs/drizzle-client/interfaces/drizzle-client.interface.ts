import * as schema from '@drizzle/main';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type DrizzleClient = NodePgDatabase<typeof schema>;
