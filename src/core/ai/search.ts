// src/core/ai/search.ts
import { serverSupabaseRSC } from "@/core/supabase/rsc";

export type PageHit = {
  textbook_id: string;
  grade: number;
  subject: string;
  page_number: number;
  content: string;
};

export async function searchTextbookPages(opts: {
  grade: number;
  subject: string;
  query: string;
  limit?: number;
}): Promise<PageHit[]> {
  const supabase = await serverSupabaseRSC();
  const { data, error } = await supabase.rpc("search_textbook_pages", {
    p_grade: opts.grade,
    p_subject: opts.subject,
    p_query: opts.query,
    p_limit: opts.limit ?? 5,
  });

  if (error) throw error;
  return (data || []) as PageHit[];
}

/** Format snippet list into compact Markdown context for prompts */
export function hitsToContextMd(hits: PageHit[]): string {
  return hits
    .map(
      (h) =>
        `**p${h.page_number}** — ${h.subject}:\n${h.content.trim().slice(0, 1200)}`
    )
    .join("\n\n---\n\n");
}

/** Produce "Sources: pNN, pMM…" footer */
export function sourcesFooter(hits: PageHit[]): string {
  const pages = Array.from(new Set(hits.map((h) => h.page_number))).sort((a, b) => a - b);
  return `Sources: ${pages.map((p) => `p${p}`).join(", ")}`;
}
