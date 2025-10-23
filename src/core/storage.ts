// src/core/storage.ts
/**
 * Build a public Supabase Storage URL from a storage path like:
 *   textbooks/grade-11/chemistry/file.pdf
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL in your .env
 */
export function publicUrlFromStoragePath(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  const clean = storagePath.replace(/^\/+/, ""); // no leading slash
  return `${base}/storage/v1/object/public/${clean}`;
}
