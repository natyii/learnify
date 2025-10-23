import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id")!;
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("textbooks")
    .select("id, title, subject, grade, storage_path")
    .eq("id", id)
    .limit(1);

  return NextResponse.json({
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    rowCount: data?.length ?? 0,
    row: data?.[0] ?? null,
    dbError: error?.message ?? null,
  });
}
