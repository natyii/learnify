// src/core/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Next 15-compatible server client that works with async cookies().
 */
export function getServerSupabase() {
  const store = cookies(); // Promise<ReadonlyRequestCookies> in Next 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await store).get(name)?.value,
        getAll: async () =>
          (await store).getAll().map((c) => ({ name: c.name, value: c.value })),
        set: async (name: string, value: string, options?: any) =>
          (await store).set({ name, value, ...(options || {}) }),
        remove: async (name: string, options?: any) =>
          (await store).set({
            name,
            value: "",
            ...(options || {}),
            expires: new Date(0),
          }),
      },
    }
  );
}
