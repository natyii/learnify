import { serverSupabase } from "./supabase/server";

export async function smoke() {
  const supabase = await serverSupabase();
  const ping = await supabase.from("profiles").select("id", { count: "exact", head: true });
  return { ok: !ping.error, profilesCountKnown: !!ping.count };
}
