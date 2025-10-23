// src/core/grounding/pages.ts
// Server-only helpers to resolve the SAME textbook + pages that Study uses.
// IMPORTANT: We accept a Supabase client from the caller (no new clients here).

import type { SupabaseClient } from "@supabase/supabase-js";

// Returned by the grounding fetch for the quiz generator
export type GroundPage = {
  id: string;            // keep as string (safe for uuid or bigint)
  page_number: number;
  text_content: string | null;
};

/**
 * getActiveTextbookId
 * Resolves the textbook to use for a given grade + subject.
 * - Uses case-insensitive match on subject
 * - Picks latest by created_at (adjust if you mark "active" in your study flow)
 * - Returns the primary key as a string (uuid-safe)
 */
export async function getActiveTextbookId(
  supabase: SupabaseClient,
  grade: number,
  subject: string
): Promise<string | null> {
  const subj = subject.trim();

  const { data, error } = await supabase
    .from("textbooks")
    .select("id")
    .eq("grade", grade)
    .ilike("subject", subj) // case-insensitive equality
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getActiveTextbookId error:", error.message);
    throw new Error(error.message);
  }

  if (!data?.id) return null;
  return String(data.id);
}

/**
 * getPagesForRanges
 * Fetches pages (including text_content) for inclusive page ranges.
 * - Uses SAME authenticated client (RLS-safe).
 * - De-duplicates overlapping ranges.
 * - Returns in ascending page_number order.
 * - Page id is returned as string (uuid/bigint-safe).
 */
export async function getPagesForRanges(
  supabase: SupabaseClient,
  textbookId: string,
  ranges: Array<{ start: number; end: number }>
): Promise<GroundPage[]> {
  if (!textbookId) return [];

  // Normalize ranges defensively
  const norm = ranges
    .map(r => {
      const a = Math.max(1, r.start | 0);
      const b = Math.max(1, r.end | 0);
      return { start: Math.min(a, b), end: Math.max(a, b) };
    })
    .filter(r => Number.isFinite(r.start) && Number.isFinite(r.end) && r.end >= r.start);

  if (norm.length === 0) return [];

  // Expand to explicit page numbers (keeps SQL and RLS simple)
  const pageSet = new Set<number>();
  for (const r of norm) {
    for (let p = r.start; p <= r.end; p++) pageSet.add(p);
  }
  const pageNums = Array.from(pageSet).sort((a, b) => a - b);

  const { data, error } = await supabase
    .from("textbook_pages")
    .select("id, page_number, text_content")
    .eq("textbook_id", textbookId)
    .in("page_number", pageNums)
    .order("page_number", { ascending: true });

  if (error) {
    console.error("getPagesForRanges error:", error.message);
    throw new Error(error.message);
  }

  return (data ?? []).map(row => ({
    id: String(row.id),
    page_number: row.page_number as number,
    text_content: row.text_content ?? null,
  }));
}
