import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/global/migrations', // Đường dẫn tính từ thư mục root
  schema: './drizzle/global/models/**/*.model.ts', // Đường dẫn tính từ thư mục root
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.GLOBAL_DATABASE_URL as string,
  },
  migrations: {
    schema: 'public',
  },
});
