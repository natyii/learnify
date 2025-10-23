// src/lib/supabase/server.ts
import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Always return a real SupabaseClient.
// Next 15: cookies() MUST be awaited in the same async context.
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  // minimal cookie shim (we only read; Next handles writing via headers)
  const cookieShim = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(_name: string, _value: string, _options?: CookieOptions) {
      // no-op; let Supabase set-cookies flow through headers
    },
    remove(_name: string, _options?: CookieOptions) {
      // no-op
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieShim,
      headers: await headers(), // safe to await here
    }
  );
}
