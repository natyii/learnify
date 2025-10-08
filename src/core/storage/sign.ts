import { serverSupabase } from "@/core/supabase/server";
import { toStorageKey } from "./keys";

const BUCKET = process.env.SUPABASE_BUCKET || "textbooks";

/** Return a signed URL for a storage key (relative to bucket). Throws with a clear message. */
export async function signTextbookUrl(input: string, { expiresIn = 60 * 10 } = {}) {
  const key = toStorageKey(input);
  if (!key) throw new Error("No storage key provided");

  const supabase = await serverSupabase();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn, { download: false });

  if (error) {
    // Normalize most common error
    if (error.message?.toLowerCase().includes("not found")) {
      throw new Error(`Object not found in bucket '${BUCKET}': ${key}`);
    }
    throw error;
  }

  // Force inline render (works for PDF in most browsers)
  const u = new URL(data.signedUrl);
  u.searchParams.set("download", "false");
  return u.toString();
}
