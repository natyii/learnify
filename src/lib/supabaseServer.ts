// src/lib/supabaseServer.ts
import { getServerSupabase } from "@/core/supabase/server";

/** Old code imports { createClient } from "@/lib/supabaseServer" */
export function createClient() {
  return getServerSupabase();
}

/** Some files import { server } from "@/lib/supabaseServer" */
export const server = getServerSupabase;

/** Some files import { getAuthUser } from "@/lib/supabaseServer" */
export async function getAuthUser() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
