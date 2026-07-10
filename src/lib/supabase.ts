import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function camelize<T extends Record<string, unknown>>(obj: T): T;
export function camelize<T extends Record<string, unknown>>(obj: T[]): T[];
export function camelize<T extends Record<string, unknown>>(obj: T | T[]): T | T[] {
  const map = (o: Record<string, unknown>) => {
    const r: Record<string, unknown> = {};
    for (const k of Object.keys(o)) r[snakeToCamel(k)] = o[k];
    return r as T;
  };
  return Array.isArray(obj) ? obj.map(map) : map(obj as Record<string, unknown>);
}
