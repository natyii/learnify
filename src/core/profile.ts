import { serverSupabase } from "./supabase/server";

export type Profile = { id: string; grade: string | null };

/**
 * NOTE:
 * We read `user_id` from DB and alias it to `id` so the rest of the app remains simple.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id:id, grade") // alias user_id -> id
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function upsertProfile(userId: string, grade: string) {
  const supabase = await serverSupabase();
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, grade }, { onConflict: "user_id" });
  if (error) throw error;
}
