/**
 * Convert any of these inputs into a valid Supabase Storage key for the `textbooks` bucket:
 * - "textbooks/grade-12/amharic/file.pdf"           (bucket prefixed)
 * - "/textbooks/grade-12/amharic/file.pdf"          (leading slash)
 * - "grade-12/amharic/file.pdf"                      (already correct)
 * - Full public/signed URLs that contain ".../object/<scope>/textbooks/<key>"
 */
export function toStorageKey(input: string): string {
  let s = (input || "").trim();

  // If it's a full Supabase storage URL, extract after /textbooks/
  const idx = s.indexOf("/textbooks/");
  if (idx !== -1) {
    s = s.slice(idx + "/textbooks/".length);
  }

  // Remove leading slash(es)
  if (s.startsWith("/")) s = s.replace(/^\/+/, "");

  // If still includes "textbooks/" prefix (e.g., "textbooks/grade-..."), strip it
  if (s.startsWith("textbooks/")) s = s.replace(/^textbooks\/+/, "");

  return s;
}
