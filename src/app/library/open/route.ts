// src/app/library/open/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/core/supabase/rsc";

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string; status?: number };

type Params =
  | { id: string; path?: undefined } // ?id=<uuid> (load from DB)
  | { id?: undefined; path: string }; // ?path=<grade-x/subject/file.pdf> (direct storage path)

type TextbookRow = {
  id: string;
  grade: number;
  subject: string;
  title: string;
  storage_path: string; // e.g. "grade-11/chemistry/et-en-chemistry-g11-2023-v1.pdf"
};

const BUCKET = "textbooks";

/** Build a public URL for a storage object. */
function publicUrlFor(path: string): Ok<string> | Err {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return { ok: false, error: "MISSING_SUPABASE_URL", status: 500 };

  // If caller passed a full URL already, just return it.
  if (/^https?:\/\//i.test(path)) return { ok: true, value: path };

  // Normalize "grade-12/..." style paths
  const clean = path.replace(/^\/+/, "");
  const url = `${base}/storage/v1/object/public/${BUCKET}/${clean}`;
  return { ok: true, value: url };
}

/**
 * GET /library/open?id=<textbook_id>
 *    or
 * GET /library/open?path=<grade-x/subject/file.pdf>
 *
 * Redirects the browser to the public PDF URL in the `textbooks` bucket.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? undefined;
  const path = url.searchParams.get("path") ?? undefined;

  // Validate query
  if (!id && !path) {
    return NextResponse.json(
      { error: "MISSING_PARAM", message: "Provide ?id=<uuid> or ?path=<storage_path>." },
      { status: 400 }
    );
  }

  // Resolve storage_path
  let storagePath: string | null = null;

  if (path) {
    storagePath = path;
  } else if (id) {
    const supabase = await getServerSupabase();

    const { data, error } = await supabase
      .from("textbooks")
      .select("id, grade, subject, title, storage_path")
      .eq("id", id)
      .single<TextbookRow>();

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: error.message },
        { status: 500 }
      );
    }

    if (!data?.storage_path) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Textbook or storage_path not found." },
        { status: 404 }
      );
    }

    storagePath = data.storage_path;
  }

  // Build public URL
  const built = publicUrlFor(storagePath!);
  if (!built.ok) {
    return NextResponse.json(
      { error: built.error },
      { status: built.status ?? 500 }
    );
  }

  // 302 redirect to the actual public PDF URL
  return NextResponse.redirect(built.value, 302);
}
