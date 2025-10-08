import { NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const prefix = String(url.searchParams.get("prefix") || "");
  const bucket = process.env.SUPABASE_BUCKET || "textbooks";

  const supabase = await serverSupabase();
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  return NextResponse.json({
    bucket,
    prefix,
    entries: data || [],
    error: error ? { message: error.message, name: error.name } : null,
  });
}
