import { Brand } from "@/ui/Brand";
import { FeatureCard } from "@/ui/FeatureCard";
import { FAQItem } from "@/ui/FAQ";
import Doodle from "@/ui/Doodle";
import { BookOpenCheck, MessagesSquare, PencilRuler, GraduationCap, ChartBar, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <main className="relative min-h-[100svh]">
      <Doodle />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <nav className="flex items-center gap-3">
          <a href="#features" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">Features</a>
          <a href="#faq" className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-white">FAQ</a>
          <Link href="/sign-in" className="rounded-md px-4 py-2 text-sm bg-white/10 border border-white/15 hover:bg-white/15">Sign in</Link>
          <Link href="/sign-up" className="rounded-md px-4 py-2 text-sm bg-[linear-gradient(90deg,#67e8f9, #93c5fd, #a78bfa)] text-black font-medium hover:brightness-110">Get started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center">
        <h1 className="mx-auto bg-[linear-gradient(90deg,#a5f3fc,#bfdbfe,#ddd6fe)] bg-clip-text text-5xl font-semibold text-transparent md:text-6xl">
          Grade-aware study you can trust.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] text-[var(--muted)]">
          Library by grade, grounded Study Chat with page citations, homework help with steps, generated quizzes, and meaningful progress tracking.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up" className="rounded-xl px-6 py-3 font-medium text-black bg-[linear-gradient(90deg,#34d399,#67e8f9,#93c5fd)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/40">
            Create free account
          </Link>
          <Link href="/sign-in" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40">
            I already have an account
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--muted)]">
          <li>• Works offline after first load</li>
          <li>• Contrast & keyboard friendly</li>
          <li>• Mobile-first</li>
        </ul>
      </section>

      {/* Features (super transparent to showcase doodle) */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={<BookOpenCheck className="h-5 w-5" />} title="Library by grade">
            Official textbooks; signed links keep storage private.
          </FeatureCard>
          <FeatureCard icon={<MessagesSquare className="h-5 w-5" />} title="Study Chat (grounded)">
            3–5 textbook snippets per answer. “Sources: pNN…”
          </FeatureCard>
          <FeatureCard icon={<PencilRuler className="h-5 w-5" />} title="Homework help">
            Explain • Steps • Hints • Check. Logged for review.
          </FeatureCard>
          <FeatureCard icon={<GraduationCap className="h-5 w-5" />} title="Quizzes">
            Auto-generated MCQs, instant scoring, attempt history.
          </FeatureCard>
          <FeatureCard icon={<ChartBar className="h-5 w-5" />} title="Progress">
            Study minutes + homework logs; accessible charts.
          </FeatureCard>
          <FeatureCard icon={<ShieldCheck className="h-5 w-5" />} title="Built for schools">
            Grade-aware, high contrast, keyboardable; Groq now, OpenAI later.
          </FeatureCard>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Frequently asked</h2>
        <div className="space-y-3 text-left">
          <FAQItem q="Works without internet?" a="After first load, the PWA shell and previously opened textbooks continue to work offline. Chat/search need connectivity." />
          <FAQItem q="Are answers reliable?" a="Yes. We fetch top textbook snippets via RPC and include page numbers with every answer. If sources are insufficient, we say so." />
          <FAQItem q="Supported grades?" a="Grades 1–12 for Library; all features are grade-aware. National exam prep (G6/G8/G12) is next." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <Brand />
          <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} AI Tutor. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
