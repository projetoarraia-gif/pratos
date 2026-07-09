import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      envSet: !!process.env.DATABASE_URL,
      envPrefix: process.env.DATABASE_URL?.substring(0, 20),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json(
      { ok: false, error: msg, envSet: !!process.env.DATABASE_URL },
      { status: 500 }
    );
  }
}
