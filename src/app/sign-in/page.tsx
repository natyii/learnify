// src/app/sign-in/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import Theme from "@/ui/Theme";
import Nebula from "@/ui/Nebula";
import { serverSupabaseAction } from "@/core/supabase/action";
import Image from "next/image";

// ----- Server Action -----
async function signInAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/app");

  if (!email || !password) {
    redirect("/sign-in?error=Enter%20email%20and%20password");
  }

  const supabase = await serverSupabaseAction();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "Invalid email or password"
        : error.message;
    redirect(`/sign-in?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

// Next 15: searchParams is a Promise. Await it.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const errorMsg = sp?.error;
  const next = sp?.next || "/app";

  return (
    <Theme>
      <main className="relative min-h-[100svh]">
        <div className="pointer-events-none absolute inset-0 -z-20">
          <Nebula />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/brand/logo-wide.png"
                alt="AI Tutor logo"
                width={140}
                height={36}
                priority
                className="h-9 w-auto select-none"
                sizes="(max-width: 640px) 120px, 140px"
              />
            </Link>
            <nav className="flex items-center gap-2">
              {/* 🔒 Fixed: text now pure white, enforced via inline style */}
              <Link
                href="/sign-up"
                className="rounded-full border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-4 py-2 text-sm font-semibold shadow-[0_8px_22px_rgba(67,51,137,0.35)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#615BDB]/50"
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
              >
                Create account
              </Link>
            </nav>
          </div>
        </header>

        {/* Scoped dark-text + autofill fixes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #signin-form input,
              #signin-form select,
              #signin-form textarea {
                color: #0b1020 !important;
                -webkit-text-fill-color: #0b1020 !important;
                caret-color: #0b1020 !important;
                opacity: 1 !important;
                mix-blend-mode: normal !important;
                text-shadow: none !important;
                background-color: #ffffff !important;
              }
              #signin-form input::placeholder {
                color: #6b7280 !important;
              }
              #signin-form input:-webkit-autofill,
              #signin-form input:-webkit-autofill:hover,
              #signin-form input:-webkit-autofill:focus,
              #signin-form input:-webkit-autofill:active,
              #signin-form select:-webkit-autofill,
              #signin-form select:-webkit-autofill:hover,
              #signin-form select:-webkit-autofill:focus,
              #signin-form select:-webkit-autofill:active,
              #signin-form textarea:-webkit-autofill,
              #signin-form textarea:-webkit-autofill:hover,
              #signin-form textarea:-webkit-autofill:focus,
              #signin-form textarea:-webkit-autofill:active,
              #signin-form input:-internal-autofill-selected {
                -webkit-text-fill-color: #0b1020 !important;
                caret-color: #0b1020 !important;
                box-shadow: 0 0 0 1000px #ffffff inset !important;
                transition: background-color 9999s ease-in-out 0s !important;
              }
            `,
          }}
        />

        {/* Sign-in card */}
        <section className="relative mx-auto max-w-md px-6 py-16">
          <div className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <h1 className="text-2xl font-semibold text-black">Welcome back</h1>
            <p className="mt-1 text-sm text-black/70">Sign in to continue your study session.</p>

            {errorMsg && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <form id="signin-form" action={signInAction} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label className="mb-1 block text-sm text-black/80">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 shadow-inner outline-none focus:ring-2 focus:ring-[#615BDB]/40"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-black/80">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 shadow-inner outline-none focus:ring-2 focus:ring-[#615BDB]/40"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-4 py-2 font-semibold text-white shadow-[0_12px_28px_rgba(67,51,137,0.35)] hover:brightness-110"
              >
                Sign in
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-black/70">
              Don’t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-[#433389] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </main>
    </Theme>
  );
}
