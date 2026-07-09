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
    const stack = e instanceof Error ? e.stack : "";
    const cause =
      e instanceof Error && e.cause
        ? e.cause instanceof Error
          ? e.cause.message
          : String(e.cause)
        : undefined;
    return Response.json(
      {
        ok: false,
        error: msg,
        cause,
        stack: stack?.split("\n").slice(0, 3).join("\\n"),
        envSet: !!process.env.DATABASE_URL,
      },
      { status: 500 }
    );
  }
}
