import { serverSupabase } from "./supabase/server";

export type Profile = { id: string; grade: string | null };

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, grade")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertProfile(userId: string, grade: string) {
  const supabase = await serverSupabase();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, grade }, { onConflict: "id" });
  if (error) throw error;
}
