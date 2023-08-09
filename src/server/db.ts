import { env } from "@/env.mjs";
import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";

export type DB = NeonHttpDatabase<Record<string, never>>;
export type SQL = NeonQueryFunction<false, false>;

const globalForDb = globalThis as unknown as {
  sql: NeonQueryFunction<false, false> | undefined;
  db: DB | undefined;
};

const sql = globalForDb.sql || neon(process.env.DATABASE_URL!);
const db = globalForDb.db || drizzle(sql);

if (env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
  globalForDb.db = db;
}

export { sql, db };
