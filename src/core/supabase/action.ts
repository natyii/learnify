// src/core/supabase/action.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Use this ONLY from Server Actions or Route Handlers.
 * It reads/writes auth cookies correctly for Next.js 15 (async cookies()).
 */
export async function serverSupabaseAction() {
  // Next 15: cookies() is async – must be awaited before use
  const jar = await cookies();

  return createServerClient(URL, KEY, {
    cookies: {
      // Supabase expects sync functions, but we've already awaited the jar above.
      get(name: string) {
        return jar.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Allowed here because this helper is only used in Server Actions/Routes
        jar.set({ name, value, ...options });
      },
      remove(name: string, _options: CookieOptions) {
        // Delete via Next's cookie API
        jar.delete(name);
      },
    },
  });
}
