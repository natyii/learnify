// src/lib/supabaseServer.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * App Router (Next 15): cookies() is async. We await it once here,
 * then pass a sync adapter to Supabase using the resolved cookie store.
 */
export async function server(): Promise<SupabaseClient> {
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => store.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        store.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        store.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

export async function getAuthUser(): Promise<User | null> {
  const supabase = await server();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
