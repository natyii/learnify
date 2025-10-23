// src/lib/ai/textbook.ts
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * List the most likely book for a subject/grade — optional helper if you need it elsewhere.
 */
export async function findPreferredBook(
  supabase: SupabaseClient,
  subject: string | null,
  grade: number | null
) {
  let q = supabase
    .from("textbooks")
    .select("id, title, subject, grade, published");

  if (grade != null && Number.isFinite(grade)) q = q.eq("grade", grade as number);
  if (subject) q = q.ilike("subject", subject);

  // ONLY published textbooks
  q = q.eq("published", true); // <-- fixed: removed stray quote

  const { data, error } = await q.order("grade", { ascending: true }).limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

type FindContextArgs = {
  supabase: SupabaseClient;
  subject?: string | null;
  grade?: number | null;
  bookId?: string | null;
  page?: number | null;
  q?: string | null; // optional topic
  maxSnippets?: number;
};

/**
 * Pulls grounded context from textbook_pages.
 * Priority:
 *  1) Exact page for the chosen book (if page provided).
 *  2) If no page hit: no snippets here (your /api/study/search already finds topic pages client-side).
 */
export async function findContext({
  supabase,
  subject = null,
  grade = null,
  bookId = null,
  page = null,
  q = null,
  maxSnippets = 1,
}: FindContextArgs): Promise<{
  citations: Array<{ bookId: string; page: number }>;
  snippets: Array<{ bookId: string; page: number; excerpt: string }>;
}> {
  const citations: Array<{ bookId: string; page: number }> = [];
  const snippets: Array<{ bookId: string; page: number; excerpt: string }> = [];

  // If we have an exact page target, fetch that row.
  if (bookId && page && Number.isFinite(page)) {
    let qp = supabase
      .from("textbook_pages")
      .select("textbook_id, page_number, content, subject, grade")
      .eq("textbook_id", bookId)
      .eq("page_number", page)
      .limit(1);

    if (subject) qp = qp.ilike("subject", subject);
    if (grade != null && Number.isFinite(grade)) qp = qp.eq("grade", grade as number);

    const { data, error } = await qp;
    if (!error && data && data.length > 0) {
      const row = data[0];
      const excerpt = (row.content || "").toString().slice(0, 1200); // keep it short
      citations.push({ bookId, page });
      snippets.push({ bookId, page, excerpt });
      return { citations, snippets };
    }
  }

  // OPTIONAL: if you want a tiny fallback when user typed a topic but no page,
  // you could do a super-light ilike search here. For now we leave it empty:
  // your client already calls /api/study/search and shows citations.

  return { citations, snippets };
}
