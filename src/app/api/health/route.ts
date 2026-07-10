import { Pool } from "pg";

export const dynamic = "force-dynamic";

const urls = [
  "postgresql://postgres:Mud@r202650@db.vpkqgypucpocxlxybsdq.supabase.co:5432/postgres",
  "postgresql://postgres:Mud@r202650@vpkqgypucpocxlxybsdq.supabase.co:5432/postgres",
  "postgresql://postgres.vpkqgypucpocxlxybsdq:Mud@r202650@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  "postgresql://postgres:Mud@r202650@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
];

export async function GET() {
  const results: Record<string, string> = {};
  for (const url of urls) {
    const label = url.substring(0, 60) + "...";
    try {
      const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      const r = await pool.query("SELECT 1");
      results[label] = "OK: " + JSON.stringify(r.rows);
      await pool.end();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message.substring(0, 100) : String(e);
      results[label] = "FAIL: " + msg;
    }
  }
  return Response.json({
    envSet: !!process.env.DATABASE_URL,
    tests: results,
  });
}
