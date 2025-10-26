// src/app/api/health/site-counts/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("[site-counts] Missing Supabase env vars", {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SERVICE_KEY,
  });
}

const supabase = SUPABASE_URL && SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

async function countTable(name: string): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(name)
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error(`[site-counts] Error counting ${name}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function GET(req: Request) {
  try {
    const [textbooks, attempts, users] = await Promise.all([
      countTable("textbooks"),
      countTable("quiz_attempts"),
      countTable("profiles"),
    ]);

    const { searchParams } = new URL(req.url);
    const simple = searchParams.get("simple") === "1";

    return NextResponse.json(
      simple
        ? { textbooks, attempts, users }
        : { ok: true, textbooks, attempts, users },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[site-counts] Fatal error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
