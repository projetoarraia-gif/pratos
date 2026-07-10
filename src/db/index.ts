import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Resolve Supabase IPv6 hostname at runtime
const SUPABASE_HOST = "db.vpkqgypucpocxlxybsdq.supabase.co";
const SUPABASE_IPV6 = "2600:1f11:a1d:9201:7b00:3056:f801:76a6";

if (databaseUrl.includes(SUPABASE_HOST)) {
  databaseUrl = databaseUrl.replace(SUPABASE_HOST, `[${SUPABASE_IPV6}]`);
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
