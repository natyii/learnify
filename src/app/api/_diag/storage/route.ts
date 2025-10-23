import { NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_TEXTBOOKS ||
  process.env.SUPABASE_BUCKET || "textbooks";

// use a key you KNOW exists exactly as shown here
const KNOWN_KEY = "grade-12/amharic/et-am-amharic-g12-2023-v1.pdf";

export async function GET() {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(KNOWN_KEY, 3600);

  if (error || !data?.signedUrl) {
    return NextResponse.json({
      ok: false,
      envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      bucket: BUCKET,
      key: KNOWN_KEY,
      error: error?.message || "Object not found",
    }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    bucket: BUCKET,
    key: KNOWN_KEY,
    signedUrl: data.signedUrl,
  });
}
