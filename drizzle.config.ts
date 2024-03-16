import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

if (!process.env.DB_URL) {
  console.error("DB_URL note defined. DB not setup.", process.env.DB_URL);
  process.exit(0);
}

export default defineConfig({
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_URL,
  },
  verbose: true,
  strict: true,
});
