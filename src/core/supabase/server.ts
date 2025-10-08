import { cookies } from "next/headers";
import { createServerClient, type CookieOptions, type SupabaseClient } from "@supabase/ssr";

/**
 * Next 15: cookies() is async and MUST be awaited.
 * Return a Supabase client wired to server cookies for auth/session.
 */
export async function serverSupabase(): Promise<SupabaseClient> {
  const c = await cookies(); // <-- important in Next 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => c.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          c.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          // delete by expiring
          c.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );
}
