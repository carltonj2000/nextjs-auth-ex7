import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool);

export default db;
