// src/core/textbooks/index.ts
import { serverSupabaseRSC } from "@/core/supabase/rsc";

export type TextbookRow = {
  id: string;
  grade: number;
  subject: string;
  title: string;
  file_url: string | null; // e.g. "grade-12/amharic/et-am-amharic-g12-2023-v1.pdf"
};

export async function getMyGrade(): Promise<number> {
  const supabase = await serverSupabaseRSC();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("NOT_AUTHENTICATED");

  const { data, error } = await supabase
    .from("profiles")
    .select("grade")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.grade) throw new Error("NO_GRADE_IN_PROFILE");
  const g = Number(data.grade);
  if (!Number.isFinite(g)) throw new Error("INVALID_GRADE");
  return g;
}

export async function listTextbooksForGrade(grade: number): Promise<TextbookRow[]> {
  const supabase = await serverSupabaseRSC();
  const { data, error } = await supabase
    .from("textbooks")
    .select("id, grade, subject, title, file_url")
    .eq("grade", grade)
    .order("subject", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return (data || []) as TextbookRow[];
}

/**
 * Normalize any stored "file_url" to a bucket key relative to the bucket root.
 * Accepts:
 *  - "grade-12/physics/book.pdf"
 *  - "textbooks/grade-12/physics/book.pdf"
 *  - "/textbooks/grade-12/physics/book.pdf"
 */
export function toBucketKey(input: string): string {
  let s = input.trim();
  if (s.startsWith("/")) s = s.replace(/^\/+/, "");
  if (s.startsWith("textbooks/")) s = s.replace(/^textbooks\/+/, "");
  return s;
}
