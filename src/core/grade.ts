// src/core/grade.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserGrade(): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // profiles.grade is SMALLINT (1..12)
  const { data, error } = await supabase
    .from("profiles")
    .select("grade")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return null;
  const g = data?.grade;
  return typeof g === "number" ? g : g ? Number(g) : null;
}

export async function upsertUserGrade(grade: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, grade }, { onConflict: "user_id" });
  if (error) throw error;
}
