import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause =
      e instanceof Error && e.cause
        ? e.cause instanceof Error
          ? e.cause.message.substring(0, 200)
          : String(e.cause).substring(0, 200)
        : undefined;
    const stack = e instanceof Error ? e.stack : "";
    return Response.json(
      { ok: false, error: msg, cause, stack: stack?.split("\n")[1]?.trim() },
      { status: 500 }
    );
  }
}
