// src/core/textbooks.ts
import { serverSupabase } from "@/core/supabase/server";
import { toStorageKey } from "@/core/storage/keys";

export type TextbookRow = {
  id: string;
  grade: number;
  subject: string;
  title: string;
  file_url: string | null;
};

export type ProfileRow = {
  user_id: string;
  grade: string | null;
};

const BUCKET = process.env.SUPABASE_BUCKET || "textbooks";

/** Get current user and their profile grade (number). Throws if no user. */
export async function getCurrentUserAndGrade(): Promise<{ userId: string; grade: number }> {
  const supabase = await serverSupabase();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) throw new Error("AUTH_REQUIRED");

  const user = userRes.user;
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("user_id, grade")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (pErr) throw pErr;
  const gradeNum = Number((profile?.grade ?? "").toString().trim()) || NaN;
  if (!Number.isFinite(gradeNum)) throw new Error("NO_GRADE_IN_PROFILE");

  return { userId: user.id, grade: gradeNum };
}

/** Fetch textbooks by grade from DB. */
export async function getTextbooksByGrade(grade: number): Promise<TextbookRow[]> {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("textbooks")
    .select("id, grade, subject, title, file_url")
    .eq("grade", grade)
    .order("subject", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return (data || []) as TextbookRow[];
}

/** Distinct subjects for a grade (normalized to lower-case). */
export async function getSubjectsByGrade(grade: number): Promise<string[]> {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("textbooks")
    .select("subject")
    .eq("grade", grade);

  if (error) throw error;
  const set = new Set<string>();
  (data || []).forEach((r: any) => {
    if (r?.subject) set.add(String(r.subject).toLowerCase());
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
