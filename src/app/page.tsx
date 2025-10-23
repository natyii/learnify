// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";

import Theme from "@/ui/Theme";
import Nebula from "@/ui/Nebula";
import ParallaxDoodles from "@/ui/ParallaxDoodles";

import { FeatureCard } from "@/ui/FeatureCard";
import { FAQItem } from "@/ui/FAQ";
import StatsStrip from "@/ui/StatsStrip";
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
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 -z-20">
          <Nebula />
        </div>
        <ParallaxDoodles />

        {/* Define the gentlePulse keyframes without styled-jsx */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes gentlePulse {
                0%,100% { transform: scale(1); opacity: 1; }
                50%      { transform: scale(1.03); opacity: 0.95; }
              }
            `,
          }}
        />
        {/* Hard override ONLY the hero "I already have an account" link */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #hero-existing-account {
                border: 1px solid rgba(97,91,219,0.40) !important; /* #615BDB/40 */
                background: transparent !important;
                color: #433389 !important;
                opacity: 1 !important;
                text-decoration: none !important;
              }
              #hero-existing-account:hover {
                background: rgba(97,91,219,0.10) !important; /* #615BDB/10 */
              }
              #hero-existing-account:focus-visible {
                outline: 2px solid rgba(97,91,219,0.40) !important;
                outline-offset: 2px !important;
              }
            `,
          }}
        />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            {/* Replaced the text+dot badge with the logo only */}
            <Link href="/" className="flex items-center">
              <Image
                src="/brand/logo-wide.png" // put your PNG here (≥512px wide recommended)
                alt="AI Tutor logo"
                width={140}
                height={36}
                priority
                className="h-9 w-auto select-none"
                sizes="(max-width: 640px) 120px, 140px"
              />
            </Link>

            <nav className="flex items-center gap-2">
              {/* Outline buttons */}
              <a
                href="#features"
                className="rounded-full border border-[#615BDB]/40 bg-transparent px-3 py-2 text-sm text-[#433389] shadow-sm hover:bg-[#615BDB]/10 hover:text-[#433389]"
              >
                Features
              </a>
              <a
                href="#faq"
                className="rounded-full border border-[#615BDB]/40 bg-transparent px-3 py-2 text-sm text-[#433389] shadow-sm hover:bg-[#615BDB]/10 hover:text-[#433389]"
              >
                FAQ
              </a>

              {/* Secondary button */}
              <Link
                href="/sign-in"
                className="rounded-full border border-[#615BDB]/30 bg-[#615BDB]/10 px-4 py-2 text-sm font-medium text-[#433389] shadow-sm hover:bg-[#615BDB]/20 focus:outline-none focus:ring-2 focus:ring-[#615BDB]/40"
              >
                Sign in
              </Link>

              {/* Primary gradient button – keep text pure white */}
              <Link
                href="/sign-up"
                className="rounded-full border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-4 py-2 text-sm font-semibold text-white hover:text-white shadow-[0_8px_22px_rgba(67,51,137,0.35)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#615BDB]/50"
                style={{ color: "#ffffff" }}
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mx-auto max-w-3xl px-6 pb-12 pt-12 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-6 -z-10 mx-auto h-[260px] max-w-3xl rounded-3xl border border-white/30 bg-white/65 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]" />

          <h1
            className={[
              "mx-auto max-w-[22ch] text-5xl md:text-6xl font-semibold leading-tight",
              "text-transparent bg-clip-text",
              "bg-[linear-gradient(180deg,#0e172a_0%,#1c3356_25%,#3aa6ff_58%,#74ffd6_100%)]",
              "drop-shadow-[0_8px_26px_rgba(80,200,255,0.35)]",
            ].join(" ")}
          >
            Smarter study, grounded in your textbook.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-black/75">
            Grade-aware library, grounded Study Chat with page citations,
            homework help with steps, generated quizzes, and meaningful progress
            tracking.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {/* Primary gradient button */}
            <Link
              href="/sign-up"
              className="rounded-xl border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-6 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(67,51,137,0.35)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#615BDB]/50"
            >
              Create free account
            </Link>

            {/* Hero secondary (now fully visible, bold outline style) */}
            <Link
              id="hero-existing-account"
              href="/sign-in"
              className="rounded-xl px-6 py-3 font-semibold no-underline shadow-sm"
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

        {/* Live stats (server) */}
        <StatsStrip />

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpenCheck className="h-5 w-5" />}
              title="Library by grade"
              toneIndex={0}
            >
              Official textbooks; signed links keep storage private.
            </FeatureCard>
            <FeatureCard
              icon={<MessagesSquare className="h-5 w-5" />}
              title="Study Chat (grounded)"
              toneIndex={1}
            >
              3–5 textbook snippets per answer. “Sources: pNN…”
            </FeatureCard>
            <FeatureCard
              icon={<PencilRuler className="h-5 w-5" />}
              title="Homework help"
              toneIndex={2}
            >
              Explain • Steps • Hints • Check. Logged for review.
            </FeatureCard>
            <FeatureCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Quizzes"
              toneIndex={3}
            >
              Auto-generated MCQs, instant scoring, attempt history.
            </FeatureCard>
            <FeatureCard
              icon={<ChartBar className="h-5 w-5" />}
              title="Progress"
              toneIndex={4}
            >
              Study minutes + homework logs; accessible charts.
            </FeatureCard>
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Built for schools"
              toneIndex={1}
            >
              Grade-aware, high contrast, keyboardable; Groq now, OpenAI later.
            </FeatureCard>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-black">
            Frequently asked
          </h2>
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
