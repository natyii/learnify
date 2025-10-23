// src/app/api/textbooks/open/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_TEXTBOOKS ||
  process.env.SUPABASE_BUCKET ||
  "textbooks";

const PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL; // e.g. https://kpmopexxlfplzbmlikhn.supabase.co

type Row = { id: string; storage_path: string | null };

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }
    if (!PROJECT_URL) {
      return NextResponse.json(
        { error: "Missing SUPABASE URL in env (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)" },
        { status: 500 }
      );
    }

    const supabase = await serverSupabase();

    // Fetch only what we need
    const { data, error } = await supabase
      .from("textbooks")
      .select("id, storage_path")
      .eq("id", id)
      .limit(1)
      .maybeSingle<Row>();

    if (error) {
      return NextResponse.json(
        { error: "Query failed", details: error.message, id },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Textbook not found", id }, { status: 404 });
    }

    const sp = (data.storage_path || "").trim();
    if (!sp) {
      return NextResponse.json(
        { error: "Row has no storage_path. Set it to the object key inside the bucket (e.g. 'grade-12/economics/et-en-economics-g12-2023-v1.pdf').", id },
        { status: 409 }
      );
    }

    // If the row already stores a full URL, just redirect.
    if (/^https?:\/\//i.test(sp)) {
      return NextResponse.redirect(sp, 302);
    }

    // Redirect to the PUBLIC object URL (bucket is public)
    // NOTE: storage_path must be the key *after* /textbooks/
    const objectKey = sp.replace(/^\/+/, "");
    const publicUrl = `${PROJECT_URL.replace(/\/+$/,"")}/storage/v1/object/public/${BUCKET}/${objectKey}`;

    // Optional: lightweight sanity check for ".pdf"
    if (!objectKey.toLowerCase().endsWith(".pdf")) {
      // Still redirect; some files might be non-pdf in the future
      return NextResponse.redirect(publicUrl, 302);
    }

    return NextResponse.redirect(publicUrl, 302);
  } catch (e: any) {
    return NextResponse.json({ error: "Unhandled error", details: e?.message || String(e) }, { status: 500 });
  }
}
