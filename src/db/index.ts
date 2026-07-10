import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const SUPABASE_REF = "db.vpkqgypucpocxlxybsdq.supabase.co";
const SUPABASE_IPV6 = "2600:1f11:a1d:9201:7b00:3056:f801:76a6";

const isSupabase = databaseUrl.includes(SUPABASE_REF);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool(
    isSupabase
      ? {
          host: SUPABASE_IPV6,
          port: 5432,
          user: "postgres",
          password: "Mud@r202650",
          database: "postgres",
          ssl: { rejectUnauthorized: false },
        }
      : {
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
        }
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
