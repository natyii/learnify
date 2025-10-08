// src/app/onboarding/grade/page.tsx
import { serverSupabase } from "@/core/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/app";
  const err = typeof sp.error === "string" ? decodeURIComponent(sp.error) : "";

  async function save(fd: FormData) {
    "use server";
    const grade = Number(fd.get("grade"));
    const n = String(fd.get("next") || "/app");
    if (!Number.isFinite(grade) || grade < 1 || grade > 12) {
      redirect(`/onboarding/grade?next=${encodeURIComponent(n)}&error=${encodeURIComponent("Select a grade 1–12.")}`);
    }

    const supabase = await serverSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/sign-in?next=${encodeURIComponent("/onboarding/grade")}`);

    // Upsert profile
    const { error } = await supabase.from("profiles").upsert(
      { user_id: user.id, grade: String(grade) },
      { onConflict: "user_id" }
    );

    if (error) {
      redirect(`/onboarding/grade?next=${encodeURIComponent(n)}&error=${encodeURIComponent(error.message)}`);
    }
    redirect(n);
  }

  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <form action={save} className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-xl font-semibold">Choose your grade</h1>

        {err ? <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">{err}</div> : null}

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Grade (1–12)</span>
          <select name="grade" defaultValue="" required className="w-full rounded-md border border-white/10 bg-black/30 p-2 focus:ring-2 focus:ring-emerald-300/40">
            <option value="" disabled>Select grade</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <input type="hidden" name="next" value={next} />
        <button className="w-full rounded-md bg-emerald-400 py-2 font-medium text-slate-900 hover:bg-emerald-300">
          Continue
        </button>
      </form>
    </main>
  );
}
