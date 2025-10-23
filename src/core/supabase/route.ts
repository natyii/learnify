// src/core/supabase/route.ts
// Read/Write Supabase client for Route Handlers & Server Actions (Next 15).
// IMPORTANT: cookies() is async in Next 15 — we must await it here.

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function getRouteSupabase() {
  // <-- await is required by Next 15
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );
}
