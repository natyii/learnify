import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/ui/Brand";
import Doodle from "@/ui/DoodleSchool";
import AuthButtons from "@/ui/AuthButtons";
import { serverSupabase } from "@/core/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await serverSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) redirect("/sign-in?next=%2Fapp");

  return (
    <main className="relative min-h-[100svh]">
      <Doodle />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <nav className="flex items-center gap-3">
          <Link href="/library" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Library
          </Link>
          <Link href="/study" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Study
          </Link>
          <Link href="/homework" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Homework
          </Link>
          <Link href="/quiz" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Quizzes
          </Link>
          <Link href="/progress" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Progress
          </Link>
          <AuthButtons />
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-[var(--muted)]">Pick where you want to go.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/library" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05]">
            <h3 className="font-semibold">Library</h3>
            <p className="text-sm text-[var(--muted)]">Grade-aware textbooks with secure links.</p>
          </Link>
          <Link href="/study" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05]">
            <h3 className="font-semibold">Study</h3>
            <p className="text-sm text-[var(--muted)]">Grounded chat with page citations.</p>
          </Link>
          <Link href="/homework" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05]">
            <h3 className="font-semibold">Homework</h3>
            <p className="text-sm text-[var(--muted)]">Explain • Steps • Hints • Check.</p>
          </Link>
          <Link href="/quiz" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05]">
            <h3 className="font-semibold">Quizzes</h3>
            <p className="text-sm text-[var(--muted)]">Auto MCQs, scoring, attempt history.</p>
          </Link>
          <Link href="/progress" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05]">
            <h3 className="font-semibold">Progress</h3>
            <p className="text-sm text-[var(--muted)]">Minutes + homework logs charts.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
