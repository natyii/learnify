// src/lib/supabaseServer.ts
// Shim to keep older imports working in API routes.
// It forwards to our Next 15-safe helper.

import { getServerSupabase } from "@/core/supabase/server";

export function createClient() {
  return getServerSupabase();
}

// Optional helper other files might use
export async function getAuthUser() {
  const supabase = getServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
