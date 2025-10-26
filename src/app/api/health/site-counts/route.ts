// src/app/api/health/site-counts/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic (no caching at the edge)
export const dynamic = "force-dynamic";
// Ensure Node runtime (supabase-js uses Node APIs)
export const runtime = "nodejs";

/**
 * ENV required on Vercel (Project → Settings → Environment Variables):
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY  (server-only; NEVER expose to the client)
 *
 * If you prefer using the anon key + RLS that allows COUNT, set:
 * - SUPABASE_ANON_KEY
 * and change client below to use that instead of service role.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||          // fallback names, if you used a different var
  process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL) {
  console.error("[site-counts] Missing SUPABASE_URL");
}
if (!SERVICE_KEY) {
  console.error("[site-counts] Missing SUPABASE_SERVICE_ROLE_KEY");
}

// Server-side client (service role so COUNT works regardless of RLS)
const supabase = SUPABASE_URL && SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

// Helper: exact COUNT with head:true (no rows returned)
async function countTable(table: string): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function GET(req: Request) {
  try {
    // Adjust table names here to match your database schema
    const [textbooks, attempts, users] = await Promise.all([
      countTable("textbooks"),       // e.g. public.textbooks
      countTable("quiz_attempts"),   // e.g. public.quiz_attempts
      countTable("profiles"),        // or "users" if that’s your table
    ]);

    const { searchParams } = new URL(req.url);
    const simple = searchParams.get("simple") === "1";

    const payload = { textbooks, attempts, users };
    return NextResponse.json(simple ? payload : { ok: true, ...payload }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[site-counts] error:", err);
    return NextResponse.json(
      { ok: false, error: "count_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
