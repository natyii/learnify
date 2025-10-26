import { getServerSupabase } from "@/core/supabase/server";

export async function createClient() {
    return await getServerSupabase();
}

// 👇 alias expected by existing imports
export const server = getServerSupabase;

export async function getAuthUser() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
