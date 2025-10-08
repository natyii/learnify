// src/app/sign-in/page.tsx
import { serverSupabase } from "@/core/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/app";
  const errorMsg = typeof sp.error === "string" ? decodeURIComponent(sp.error) : "";

  async function signIn(fd: FormData) {
    "use server";
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const n = String(fd.get("next") || "/app");

    if (!email || !password) {
      redirect(`/sign-in?next=${encodeURIComponent(n)}&error=${encodeURIComponent("Email and password are required.")}`);
    }

    const supabase = await serverSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Show friendly error message, don't 500
      redirect(`/sign-in?next=${encodeURIComponent(n)}&error=${encodeURIComponent(error.message)}`);
    }

    redirect(n);
  }

  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <form action={signIn} className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>

        {errorMsg ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">{errorMsg}</div>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Email</span>
          <input name="email" type="email" required className="w-full rounded-md border border-white/10 bg-black/30 p-2 focus:ring-2 focus:ring-emerald-300/40" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Password</span>
          <input name="password" type="password" required className="w-full rounded-md border border-white/10 bg-black/30 p-2 focus:ring-2 focus:ring-emerald-300/40" />
        </label>

        <input type="hidden" name="next" value={next} />

        <button className="w-full rounded-md bg-emerald-400 py-2 font-medium text-slate-900 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/40">
          Sign in
        </button>

        <p className="pt-2 text-center text-sm text-[var(--muted)]">
          New here? <a className="text-emerald-300 hover:underline" href={`/sign-up?next=${encodeURIComponent(next)}`}>Create account</a>
        </p>
      </form>
    </main>
  );
}
