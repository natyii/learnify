// src/app/api/textbook-url/route.ts
import { NextResponse } from "next/server";

/**
 * Accepts keys like:
 *  - textbooks/grade-12/amharic/file.pdf
 *  - /grade-12/amharic/file.pdf
 *  - grade-12/amharic/file.pdf
 *  - amharic/grade-12/file.pdf
 * and redirects to the first existing public URL in your Supabase bucket.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = (searchParams.get("key") || "").trim();
  if (!input) {
    return NextResponse.json({ error: "missing key" }, { status: 400 });
  }

  // 1) Normalize: strip leading slashes and any leading "textbooks/" segments
  let key = input.replace(/^\/+/, "");
  key = key.replace(/^(?:textbooks\/)+/i, ""); // remove one or more leading "textbooks/"

  // Now `key` should look like "grade-12/amharic/file.pdf" or "amharic/grade-12/file.pdf"
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const mk = (k: string) =>
    `${base}/storage/v1/object/public/textbooks/${k
      .split("/") // encode each segment safely
      .map(encodeURIComponent)
      .join("/")}`;

  // 2) Generate candidates: raw, swapped order, and a couple of safe variants
  const candidates: string[] = [];
  candidates.push(mk(key));

  // If key looks like "subject/grade-X/..."
  const mSG = key.match(/^([a-z0-9_-]+)\/(grade-\d+)(\/.+)$/i);
  if (mSG) candidates.push(mk(`${mSG[2]}/${mSG[1]}${mSG[3]}`));

  // If key looks like "grade-X/subject/..."
  const mGS = key.match(/^(grade-\d+)\/([a-z0-9_-]+)(\/.+)$/i);
  if (mGS) candidates.push(mk(`${mGS[2]}/${mGS[1]}${mGS[3]}`));

  // Also try the original input unchanged (in case someone already sent a full URL path)
  if (/^https?:\/\//i.test(input)) candidates.unshift(input);
  else {
    // If the raw input already started with "textbooks/", try it once literally too.
    if (/^textbooks\//i.test(input.replace(/^\/+/, ""))) {
      const literal = input.replace(/^\/+/, "").replace(/^textbooks\//i, "");
      candidates.push(mk(literal));
    }
  }

  // 3) Probe with HEAD; redirect to the first that exists
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return NextResponse.redirect(url, 302);
    } catch {
      // ignore and try next
    }
  }

  return NextResponse.json(
    { error: "not_found", tried: candidates },
    { status: 404 }
  );
}
