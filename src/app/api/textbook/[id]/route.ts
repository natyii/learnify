// src/app/api/textbooks/open/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

// Prefer NEXT_PUBLIC var, fall back to server-side var.
const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_TEXTBOOKS ||
  process.env.SUPABASE_BUCKET;

function normalizeKey(raw: string) {
  // 1) strip leading slashes
  // 2) strip accidental "textbooks/" (bucket name) prefix
  let k = String(raw).replace(/^\/+/, "");
  k = k.replace(/^textbooks\//, "");
  return k;
}

export async function GET(req: NextRequest) {
  try {
    if (!BUCKET) {
      return NextResponse.json(
        {
          error:
            "Missing bucket env. Set NEXT_PUBLIC_SUPABASE_BUCKET_TEXTBOOKS or SUPABASE_BUCKET.",
        },
        { status: 500 }
      );
    }

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const supabase = await serverSupabase();

    // Fetch at most one row. Avoid `.single()` to tolerate accidental duplicates.
    const { data, error } = await supabase
      .from("textbooks")
      .select("id, storage_path")
      .eq("id", id)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: "Query failed", details: error.message, id },
        { status: 500 }
      );
    }

    const book = (data && data[0]) as { id: string; storage_path: string | null } | undefined;
    if (!book) {
      return NextResponse.json({ error: "Textbook not found", id }, { status: 404 });
    }

    if (!book.storage_path) {
      return NextResponse.json(
        {
          error:
            "storage_path missing. Set storage_path to the object key inside the bucket (e.g., 'amharic/et-am-amharic-g12-2023-v1.pdf').",
          id,
          bucket: BUCKET,
        },
        { status: 400 }
      );
    }

    const key = normalizeKey(book.storage_path);

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(key, 60 * 60);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        {
          error:
            "Object not found at storage_path (or cannot sign). Fix the row to match the real object name.",
          id,
          bucket: BUCKET,
          storage_path: book.storage_path,
          normalized_key: key,
          details: signErr?.message,
        },
        { status: 404 }
      );
    }

    // Success → redirect to the signed PDF URL
    return NextResponse.redirect(signed.signedUrl, 302);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
