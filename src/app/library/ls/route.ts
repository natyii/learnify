import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const bucket = process.env.SUPABASE_BUCKET!;
    const { searchParams } = new URL(req.url);
    let prefix = searchParams.get("prefix") || "";
    prefix = prefix.replace(/^\/+/, "");
    if (prefix.startsWith(bucket + "/")) prefix = prefix.slice(bucket.length + 1);

    const supabase = await serverSupabase();
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 200,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bucket, prefix, entries: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
