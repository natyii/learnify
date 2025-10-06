import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function serverSupabase(): Promise<SupabaseClient> {
  const c = await cookies();
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
          c.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );
}

export async function adminSupabase(): Promise<SupabaseClient> {
  const _ = await cookies(); // keep API parity; we don't use cookie storage here
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get() { return undefined; }, set() {}, remove() {} } }
  );
}
