// src/app/page.tsx
import Link from "next/link";

import Theme from "@/ui/Theme";
import Nebula from "@/ui/Nebula";
import ParallaxDoodles from "@/ui/ParallaxDoodles";

import { FeatureCard } from "@/ui/FeatureCard";
import { FAQItem } from "@/ui/FAQ";
import {
  BookOpenCheck,
  MessagesSquare,
  PencilRuler,
  GraduationCap,
  ChartBar,
  ShieldCheck,
} from "lucide-react";

export default function Page() {
  return (
    <Theme>
      <main className="relative min-h-[100svh]">
        {/* Background layers (ordered for depth): Nebula glow far, doodles closer */}
        <div className="pointer-events-none absolute inset-0 -z-20">
          <Nebula />
        </div>
        <ParallaxDoodles />

        {/* Header (glass, high-contrast, sticky) */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white/85 px-3 py-1 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[15px] font-semibold text-black/85">AI Tutor</span>
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <a
                href="#features"
                className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-sm text-black/80 shadow-sm hover:bg-white"
              >
                Features
              </a>
              <a
                href="#faq"
                className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-sm text-black/80 shadow-sm hover:bg-white"
              >
                FAQ
              </a>

              {/* Sign in: light pill for guaranteed contrast on any bg */}
              <Link
                href="/sign-in"
                className="rounded-full border border-black/15 bg-white/95 px-4 py-2 text-sm font-medium text-black/85 shadow hover:bg-white"
              >
                Sign in
              </Link>

              {/* Get started: elegant green glass gradient */}
              <Link
                href="/sign-up"
                className="rounded-full border border-emerald-500 bg-[linear-gradient(180deg,#82efbd,#3fe39f)] px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_22px_rgba(16,185,129,0.28)] hover:brightness-105"
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mx-auto max-w-3xl px-6 pb-12 pt-12 text-center">
          {/* Soft underlay to ensure readability over animated bg */}
          <div className="pointer-events-none absolute inset-x-0 top-4 -z-10 mx-auto h-[240px] max-w-3xl rounded-3xl border border-white/30 bg-white/65 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]" />

          <h1 className="mx-auto text-5xl font-semibold leading-tight text-black md:text-6xl">
            Grade-aware study you can trust.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-black/75">
            Library by grade, grounded Study Chat with page citations, homework help with steps,
            generated quizzes, and meaningful progress tracking.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="rounded-xl border border-emerald-500 bg-[linear-gradient(180deg,#82efbd,#3fe39f)] px-6 py-3 font-semibold text-black shadow-[0_12px_28px_rgba(16,185,129,0.28)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
            >
              Create free account
            </Link>

            {/* Secondary CTA: crisp white pill with clear outline */}
            <Link
              href="/sign-in"
              className="rounded-xl border border-black/20 bg-white/90 px-6 py-3 font-medium text-black/90 shadow hover:bg-white"
            >
              I already have an account
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-black/65">
            <li>• Works offline after first load</li>
            <li>• Contrast &amp; keyboard friendly</li>
            <li>• Mobile-first</li>
          </ul>
        </section>

        {/* Trust strip */}
        <section className="mx-auto max-w-6xl px-6 pb-14">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["99.95%", "Uptime last 90 days"],
              ["3–5", "sources per answer (avg.)"],
              ["A11y 95+", "Lighthouse score"],
            ].map(([stat, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/25 bg-white/50 p-4 text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              >
                <div className="text-2xl font-semibold text-black">{stat}</div>
                <div className="text-xs text-black/70">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<BookOpenCheck className="h-5 w-5" />} title="Library by grade" toneIndex={0}>
              Official textbooks; signed links keep storage private.
            </FeatureCard>
            <FeatureCard icon={<MessagesSquare className="h-5 w-5" />} title="Study Chat (grounded)" toneIndex={1}>
              3–5 textbook snippets per answer. “Sources: pNN…”
            </FeatureCard>
            <FeatureCard icon={<PencilRuler className="h-5 w-5" />} title="Homework help" toneIndex={2}>
              Explain • Steps • Hints • Check. Logged for review.
            </FeatureCard>
            <FeatureCard icon={<GraduationCap className="h-5 w-5" />} title="Quizzes" toneIndex={3}>
              Auto-generated MCQs, instant scoring, attempt history.
            </FeatureCard>
            <FeatureCard icon={<ChartBar className="h-5 w-5" />} title="Progress" toneIndex={4}>
              Study minutes + homework logs; accessible charts.
            </FeatureCard>
            <FeatureCard icon={<ShieldCheck className="h-5 w-5" />} title="Built for schools" toneIndex={1}>
              Grade-aware, high contrast, keyboardable; Groq now, OpenAI later.
            </FeatureCard>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-black">Frequently asked</h2>
          <div className="space-y-3 text-left">
            <FAQItem
              q="Works without internet?"
              a="After first load, the PWA shell and previously opened textbooks continue to work offline. Chat/search need connectivity."
            />
            <FAQItem
              q="Are answers reliable?"
              a="Yes. We fetch top textbook snippets via RPC and include page numbers with every answer. If sources are insufficient, we say so."
            />
            <FAQItem
              q="Supported grades?"
              a="Grades 1–12 for Library; all features are grade-aware. National exam prep (G6/G8/G12) is next."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/20 bg-white/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
            <div className="font-semibold text-black/85">AI Tutor</div>
            <p className="text-xs text-black/65">
              © {new Date().getFullYear()} AI Tutor. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </Theme>
  );
}
