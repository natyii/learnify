import { redirect } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/ui/Brand";
import Doodle from "@/ui/DoodleSchool";
import { getCurrentUserAndGrade, getSubjectsByGrade } from "@/core/textbooks";
import { BookOpen } from "lucide-react";
import AuthButtons from "@/ui/AuthButtons";

export const dynamic = "force-dynamic";

export default async function Page() {
  let grade: number;
  try {
    const ctx = await getCurrentUserAndGrade();
    grade = ctx.grade;
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg === "NO_GRADE_IN_PROFILE") {
      redirect("/onboarding/grade?next=%2Fstudy");
    }
    redirect("/sign-in?next=%2Fstudy");
  }

  const subjects = await getSubjectsByGrade(grade);

  return (
    <main className="relative min-h-[100svh]">
      <Doodle />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <nav className="flex items-center gap-3">
          <Link href="/app" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Home
          </Link>
          <Link href="/library" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Library
          </Link>
          <AuthButtons />
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <h1 className="text-2xl font-semibold">Study</h1>
        <p className="mt-1 text-[var(--muted)]">Grade {grade} subjects</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {subjects.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[var(--muted)]">
              No subjects found for grade {grade}. Confirm your <code>textbooks</code> rows exist for this grade.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <Link
                key={s}
                href={`/study/${encodeURIComponent(s)}`}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold capitalize">{s.replace(/-/g, " ")}</h3>
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Start studying</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Open the chat for <span className="capitalize">{s.replace(/-/g, " ")}</span>. Answers will be grounded to your textbooks.
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
