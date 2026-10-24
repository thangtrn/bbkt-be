import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/main/migrations', // Đường dẫn tính từ thư mục root
  schema: './drizzle/main/models/**/*.model.ts', // Đường dẫn tính từ thư mục root
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  migrations: {
    schema: 'public',
  },
});
