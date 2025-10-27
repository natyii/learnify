// src/app/app/page.tsx
import Link from "next/link";
import Theme from "@/ui/Theme";
import { setGradeAction } from "./set-grade";
import Image from "next/image";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[]>>;
};

export default async function AppPage({ searchParams }: PageProps) {
  const sp = (await searchParams) || {};
  const needs =
    (Array.isArray(sp.needsGrade) ? sp.needsGrade[0] : sp.needsGrade) === "1";

  return (
    <Theme>
      <main className="relative min-h-[100svh]">
        {/* Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(#f7f4ee,#f2efe7)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(59,130,246,0.10),transparent_60%),radial-gradient(900px_500px_at_5%_30%,rgba(16,185,129,0.10),transparent_55%)]"
        />

        {/* Header — same compact height, logo slightly larger */}
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/70 backdrop-blur-xl overflow-visible">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5 h-[60px] relative">
            {/* Logo enlarged slightly more */}
            <Link href="/" className="flex items-center -translate-y-[2px]">
              <Image
                src="/brand/logo-text.png"
                alt="AI Tutor — Ethiopia"
                width={640}
                height={180}
                priority
                className="h-[132px] w-auto select-none object-contain"
                sizes="(max-width: 640px) 320px, 640px"
              />
            </Link>

            {/* Sign out button */}
            <form action="/sign-out" method="post">
              <button
                className="rounded-full border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(67,51,137,0.30)] hover:brightness-110 transition"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-10">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              <span className="bg-gradient-to-b from-[#1E3A8A] to-[#06B6D4] bg-clip-text text-transparent">
                Welcome back.
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-slate-600">
              Pick up where you left off — study with page citations, get
              step-by-step homework help, take quizzes, or review your progress.
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Study", blurb: "Subject chat grounded in textbook pages.", href: "/study" },
              { title: "Homework", blurb: "Explain • Steps • Hints • Check.", href: "/homework" },
              { title: "Library", blurb: "Grade-specific textbooks.", href: "/library" },
              { title: "Quizzes", blurb: "Auto MCQs, scoring, attempt history.", href: "/quiz" },
              { title: "Progress", blurb: "Scores, attempts & trends.", href: "/progress" },
            ].map((c) => (
              <Link
                key={c.title}
                href={c.href}
                prefetch
                className="group rounded-2xl border border-black/10 bg-white/75 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-xl transition hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                  <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-slate-700">
                    Open
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{c.blurb}</p>
                <div className="mt-4 h-[2px] w-0 bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
        </section>

        {/* Grade modal */}
        {needs && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <form
              action={setGradeAction}
              className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 text-slate-900 shadow-2xl"
            >
              <h2 className="mb-2 text-xl font-semibold">Choose your grade</h2>
              <p className="mb-4 text-sm text-slate-600">
                We’ll personalize your library and study tools.
              </p>

              <label htmlFor="grade" className="sr-only">
                Choose your grade
              </label>
              <select
                id="grade"
                name="grade"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Select grade…
                </option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <div className="mt-5 flex justify-end gap-3">
                <Link
                  href="/app"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="rounded-lg border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-4 py-2 font-medium text-white shadow-[0_8px_22px_rgba(67,51,137,0.30)] hover:brightness-110"
                >
                  Save &amp; continue
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </Theme>
  );
}
