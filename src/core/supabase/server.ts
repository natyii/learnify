// src/core/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getServerSupabase() {
  // Next.js 15: cookies() is async — await it
  const jar = await cookies();

  return createServerClient(URL, KEY, {
    cookies: {
      // RSC-safe: read-only
      get(name: string) {
        return jar.get(name)?.value;
      },
      set(_name: string, _value: string, _opts: CookieOptions) {
        // no-op in RSC pages to avoid "Cookies can only be modified..." errors
      },
      remove(_name: string, _opts: CookieOptions) {
        // no-op in RSC pages
      },
    },
  });
}

// Alias kept for existing imports
export const serverSupabase = getServerSupabase;
