// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function supabaseServer() {
  const cookieStore = await cookies();
  const hdrs = await headers();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* no-op on Edge runtimes that block set */
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            /* no-op */
          }
        },
      },
      headers: {
        get(name: string) {
          return hdrs.get(name) ?? undefined;
        },
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sb = await supabaseServer();

  // 1) Exchange code for a session (Supabase sets cookies)
  const code = url.searchParams.get("code");
  if (code) {
    await sb.auth.exchangeCodeForSession(code);
  }

  // 2) Current user
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.redirect(new URL("/sign-in", req.url));

  // 3) Optional grade passed during sign-up flow
  const raw = url.searchParams.get("grade") ?? req.headers.get("x-user-grade");
  const parsed = raw ? Number.parseInt(String(raw), 10) : null;
  const grade =
    parsed && Number.isFinite(parsed) && parsed >= 1 && parsed <= 12
      ? parsed
      : null;

  // 4) Ensure profile row exists (grade can be null; UI can ask later)
  await sb.from("profiles").upsert(
    { user_id: user.id, grade },
    { onConflict: "user_id" }
  );

  return NextResponse.redirect(new URL("/app", req.url));
}
