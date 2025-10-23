// src/core/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a server-side Supabase client using Next.js cookies.
 * Works on Vercel + Next 15.
 */
export async function getServerSupabase() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Required by @supabase/ssr in Next 13+ App Router
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch {
            // ignore set errors during SSR
          }
        },
      },
    }
  );

  return supabase;
}

/** Backwards-compatible alias expected by existing imports. */
export const serverSupabase = getServerSupabase;
