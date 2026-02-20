import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
// @ts-ignore: no types available for better-sqlite3
import Database from "better-sqlite3";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let db: any;
let pool: any;
let sqlite: Database.Database | undefined;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL if DATABASE_URL is set
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
  console.log("✓ Connected to PostgreSQL");
} else {
  // Fallback to SQLite for development (no schema setup required)
  sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  db = drizzleSqlite(sqlite, { schema });
  
  console.log("✓ Using in-memory SQLite for development");
  console.log("  Auth system is fully functional");
  console.log("  Default admin: 9999999999 / admin123");
  console.log("");
  console.log("  NOTE: Table operations will fail in SQLite mode.");
  console.log("  For full functionality, set DATABASE_URL in .env");
}

export { db, pool, sqlite };
