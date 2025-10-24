// src/core/supabase/rsc.ts
// Next.js 15+ (Turbopack): cookies() is ASYNC in RSC.
// We read cookies safely (no writes) and return a server Supabase client.

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function getServerSupabase() {
  // MUST await in Next 15
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read-only cookie access in RSC
        get: (name: string) => cookieStore.get(name)?.value,
        // No-ops to avoid "Cookies can only be modified..." errors in RSC
        set: (_name: string, _value: string, _opts: CookieOptions) => {},
        remove: (_name: string, _opts: CookieOptions) => {},
      },
    }
  );

  return supabase;
}

// Back-compat alias expected by existing imports
export async function serverSupabaseRSC() {
  return getServerSupabase();
}
