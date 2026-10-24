import * as path from 'path';
import { config } from 'dotenv';

// Initializing dotenv
const envPath: string = path.resolve(
  process.cwd(), // root folder
  process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
);
console.log('🚀 Load env path: ', envPath);
config({ path: envPath });
