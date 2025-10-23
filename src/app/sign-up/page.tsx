// src/app/sign-up/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import NotebookPaper from "../../ui/NotebookPaper";
import Image from "next/image";

/**
 * Server action
 */
async function signUpAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const gradeInput = String(formData.get("grade") || "").trim();

  const grade = Number.parseInt(gradeInput, 10);
  const gradeValid = Number.isFinite(grade) && grade >= 1 && grade <= 12;

  if (!email || !password || !confirm || !gradeValid) {
    redirect("/sign-up?error=Missing+or+invalid+fields");
  }
  if (password !== confirm) {
    redirect("/sign-up?error=Passwords+do+not+match");
  }

  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const c = await cookies();

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      get: (name: string) => c.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) =>
        c.set({ name, value, ...(options || {}) }),
      remove: (name: string, options: CookieOptions) =>
        c.set({ name, value: "", ...(options || {}), expires: new Date(0) }),
    },
  });

  const { data: sign, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { grade } },
  });
  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);

  const uid = sign.user?.id;
  if (!uid) redirect("/sign-up?error=No+user+returned");

  try {
    await supabase
      .from("profiles")
      .upsert({ user_id: uid, grade }, { onConflict: "user_id" });
  } catch {}

  redirect("/app");
}

export default function SignUpPage() {
  return (
    <NotebookPaper>
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Scoped override for THIS form only */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #signup-form input,
              #signup-form select,
              #signup-form textarea {
                color: #0b1020 !important;             /* dark text */
                -webkit-text-fill-color: #0b1020 !important;
                caret-color: #0b1020 !important;
                opacity: 1 !important;                 /* kill faded text */
                mix-blend-mode: normal !important;     /* avoid blending */
                text-shadow: none !important;          /* avoid glow/fade */
                background-color: #ffffff !important;  /* keep white bg */
              }
              #signup-form input::placeholder {
                color: #6b7280 !important;             /* zinc-400 */
              }

              /* Chrome/Safari autofill */
              #signup-form input:-webkit-autofill,
              #signup-form input:-webkit-autofill:hover,
              #signup-form input:-webkit-autofill:focus,
              #signup-form input:-webkit-autofill:active,
              #signup-form select:-webkit-autofill,
              #signup-form select:-webkit-autofill:hover,
              #signup-form select:-webkit-autofill:focus,
              #signup-form select:-webkit-autofill:active,
              #signup-form textarea:-webkit-autofill {
                -webkit-text-fill-color: #0b1020 !important;
                caret-color: #0b1020 !important;
                box-shadow: 0 0 0 1000px #ffffff inset !important;
                transition: background-color 9999s ease-in-out 0s !important;
              }

              /* Chromium internal flag sometimes used for passwords */
              #signup-form input:-internal-autofill-selected {
                -webkit-text-fill-color: #0b1020 !important;
                box-shadow: 0 0 0 1000px #ffffff inset !important;
              }
            `,
          }}
        />

        {/* top nav row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/brand/logo-wide.png"
              alt="AI Tutor logo"
              width={120}
              height={30}
              priority
              className="h-7 w-auto select-none"
            />
          </div>

          <Link
            href="/sign-in"
            className="rounded-full border border-[#615BDB]/40 bg-transparent px-3 py-1 text-sm font-medium text-[#433389] hover:bg-[#615BDB]/10"
          >
            Sign in
          </Link>
        </div>

        {/* centered auth card */}
        <section className="mx-auto max-w-md">
          <div className="rounded-[24px] border border-zinc-200/70 bg-white/85 backdrop-blur shadow-xl">
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-semibold text-zinc-900">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Sign up to continue your study session.
              </p>

              <form id="signup-form" action={signUpAction} className="mt-6 space-y-4">
                {/* Email */}
                <label className="block text-sm font-medium text-zinc-800">
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none shadow-[0_1px_0_rgba(0,0,0,0.03)] focus:ring-2 focus:ring-[#615BDB]/40"
                  />
                </label>

                {/* Password */}
                <label className="block text-sm font-medium text-zinc-800">
                  Password
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none shadow-[0_1px_0_rgba(0,0,0,0.03)] focus:ring-2 focus:ring-[#615BDB]/40"
                  />
                </label>

                {/* Confirm */}
                <label className="block text-sm font-medium text-zinc-800">
                  Confirm password
                  <input
                    type="password"
                    name="confirm"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none shadow-[0_1px_0_rgba(0,0,0,0.03)] focus:ring-2 focus:ring-[#615BDB]/40"
                  />
                </label>

                {/* Grade */}
                <label className="block text-sm font-medium text-zinc-800">
                  Your grade
                  <select
                    name="grade"
                    required
                    defaultValue=""
                    className="mt-2 w-full appearance-none rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none shadow-[0_1px_0_rgba(0,0,0,0.03)] focus:ring-2 focus:ring-[#615BDB]/40"
                  >
                    <option value="" disabled>
                      Select grade
                    </option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-4 py-2.5 text-white font-semibold shadow-[0_8px_30px_rgba(67,51,137,0.35)] hover:brightness-110"
                >
                  Sign up
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-zinc-600">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#433389] font-medium hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </NotebookPaper>
  );
}
