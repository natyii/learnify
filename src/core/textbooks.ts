import { serverSupabase } from "./supabase/server";

export type AnyBook = Record<string, any>;

export async function getTextbooksByGrade(grade: number) {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("textbooks")
    .select("*")
    .eq("grade", grade);
  if (error) throw error;
  const rows = (data ?? []) as AnyBook[];

  const pick = (r: AnyBook, keys: string[]) => {
    for (const k of keys) {
      const v = r[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
    }
    return null;
  };

  return rows.map((r) => {
    const subject = pick(r, ["subject","subj","category"]) || "";
    const title   = pick(r, ["title","name","book_title"]) || "";

    // Paths we can sign (relative path or full Supabase URL)
    const storagePath =
      pick(r, ["file_url","file_path","path","storage_path","storagePath","filePath","pdf_path","pdf"]) ||
      (r.url && !/^https?:\/\//i.test(String(r.url)) ? String(r.url) : null);

    // Absolute HTTP(s) URL (if already public; we’ll open directly)
    const httpUrl = (() => {
      const candidate = pick(r, ["url","http_url","public_url"]);
      return candidate && /^https?:\/\//i.test(candidate) ? candidate : null;
    })();

    return {
      id: pick(r, ["id","uuid"]) ?? `${subject}-${title}`,
      subject,
      title,
      storagePath,
      httpUrl,
    };
  }).sort((a,b)=>
    (a.subject||"").localeCompare(b.subject||"") ||
    (a.title||"").localeCompare(b.title||"")
  );
}

// Parse either a bucket-relative path OR a full Supabase object URL.
// Returns { bucket, key } to sign.
function resolveBucketAndKey(input: string, envBucket: string) {
  let bucket = envBucket;
  let key = input.replace(/^\/+/, "");

  // Full Supabase object URL?
  // e.g. https://<proj>.supabase.co/storage/v1/object/public/textbooks/grade-12/math/foo.pdf
  const m = key.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/i);
  if (m) {
    bucket = m[1];
    key = m[2];
    return { bucket, key };
  }

  // If user mistakenly stored "bucket/path", strip the bucket prefix
  const bucketPrefix = `${bucket}/`;
  if (key.startsWith(bucketPrefix)) key = key.slice(bucketPrefix.length);

  return { bucket, key };
}

export async function signedPdfUrl(inputPath: string, expiresSec = 3600) {
  const supabase = await serverSupabase();
  const { bucket, key } = resolveBucketAndKey(String(inputPath), process.env.SUPABASE_BUCKET!);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(key, expiresSec);

  if (error) throw error;
  return data.signedUrl;
}

export type Snippet = { page_number: number; content: string; };
export async function searchTextbookPages(grade: number, subject: string, query: string, limit = 5) {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.rpc("search_textbook_pages", {
    p_grade: grade, p_subject: subject, p_query: query, p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as Snippet[];
}
