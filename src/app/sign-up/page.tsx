// src/app/sign-up/page.tsx
import { serverSupabase } from "@/core/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/app";
  const errorMsg =
    typeof sp.error === "string" ? decodeURIComponent(sp.error) : "";

  async function signUp(fd: FormData) {
    "use server";
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");

    // Basic validations (server-side)
    if (!email || !password || !confirm) {
      redirect(`/sign-up?next=${encodeURIComponent(next)}&error=${encodeURIComponent("All fields are required.")}`);
    }
    if (password !== confirm) {
      redirect(`/sign-up?next=${encodeURIComponent(next)}&error=${encodeURIComponent("Passwords do not match.")}`);
    }
    if (password.length < 8) {
      redirect(`/sign-up?next=${encodeURIComponent(next)}&error=${encodeURIComponent("Password must be at least 8 characters.")}`);
    }

    const supabase = await serverSupabase();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      // Common: user_already_exists, weak_password, etc.
      redirect(`/sign-up?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`);
    }

    // Success → go where the user intended
    redirect(`/onboarding/grade?next=${encodeURIComponent(next)}`);
  }

  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <form
        action={signUp}
        className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h1 className="text-xl font-semibold">Create account</h1>

        {errorMsg ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Email</span>
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-white/10 bg-black/30 p-2 outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Password</span>
          <input
            required
            name="password"
            type="password"
            placeholder="••••••••"
            minLength={8}
            className="w-full rounded-md border border-white/10 bg-black/30 p-2 outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Confirm password</span>
          <input
            required
            name="confirm"
            type="password"
            placeholder="••••••••"
            minLength={8}
            className="w-full rounded-md border border-white/10 bg-black/30 p-2 outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
        </label>

        <button
          className="w-full rounded-md bg-emerald-400 py-2 font-medium text-slate-900 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
        >
          Create account
        </button>

        {/* Preserve next for the server action */}
        <input type="hidden" name="next" value={next} />

        <p className="pt-2 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <a
            className="text-emerald-300 hover:underline"
            href={`/sign-in?next=${encodeURIComponent(next)}`}
          >
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
