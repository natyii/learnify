import { redirect } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/ui/Brand";
import Doodle from "@/ui/DoodleSchool";
import AuthButtons from "@/ui/AuthButtons";
import { getCurrentUserAndGrade } from "@/core/textbooks";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  let grade: number;
  try {
    const ctx = await getCurrentUserAndGrade();
    grade = ctx.grade;
  } catch {
    redirect(`/sign-in?next=${encodeURIComponent(`/study/${subject}`)}`);
  }

  const nice = subject.replace(/-/g, " ");

  return (
    <main className="relative min-h-[100svh]">
      <Doodle />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <nav className="flex items-center gap-3">
          <Link href="/study" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            All subjects
          </Link>
          <Link href="/library" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">
            Library
          </Link>
          <AuthButtons />
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="text-2xl font-semibold capitalize">{nice}</h1>
        <p className="mt-1 text-[var(--muted)]">Grade {grade} • Study Chat (coming next)</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[var(--muted)]">
            Chat UI will be here. It will call <code>search_textbook_pages()</code> to fetch 3–5 best snippets and ground
            answers. We’ll also add quick actions: <em>Notes</em>, <em>Insights</em>, <em>Summary</em>, <em>Amharic</em>.
          </p>
          <div className="mt-4">
            <Link href="/study" className="text-emerald-400 hover:underline">
              ← Back to subjects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
