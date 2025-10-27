// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";

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
  BookOpen,
  Users,
  ClipboardCheck,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

// Force runtime render on every request (needed for live Supabase stats)
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------
   getLandingStats()
------------------------------------------------------------------- */
async function getLandingStats() {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "https";
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
    const origin = `${proto}://${host}`;

    const url = `${origin}/api/health/site-counts?simple=1`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return { textbooks: 0, attempts: 0, users: 0, ok: false as const };
    }

    const data = await res.json();
    return {
      textbooks: Number(data?.textbooks ?? 0),
      attempts: Number(data?.attempts ?? 0),
      users: Number(data?.users ?? 0),
      ok: true as const,
    };
  } catch {
    return { textbooks: 0, attempts: 0, users: 0, ok: false as const };
  }
}

/* -------------------- Rolling number animation -------------------- */
function RollingNumber({ value }: { value: number }) {
  const digits = value.toString().split("");
  return (
    <div className="flex items-end gap-0.5 text-3xl font-bold tracking-tight md:text-4xl">
      {digits.map((d, i) =>
        /\d/.test(d) ? <Digit key={i} n={Number(d)} /> : <span key={i}>{d}</span>
      )}
    </div>
  );
}

function Digit({ n }: { n: number }) {
  return (
    <span
      className="relative inline-block h-[1.1em] w-[0.66em] overflow-hidden rounded-sm bg-gradient-to-b from-[#F1F0FF] to-white text-center text-[#1F235A]"
      style={{ lineHeight: "1.1em" } as React.CSSProperties}
    >
      <span
        className="absolute left-0 top-0 inline-flex flex-col will-change-transform"
        style={
          {
            // @ts-ignore
            ["--digit"]: n,
            animation: "rollToDigit 650ms cubic-bezier(.22,1,.36,1) forwards",
          } as React.CSSProperties
        }
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
          <span key={v} style={{ height: "1.1em" }}>
            {v}
          </span>
        ))}
      </span>
    </span>
  );
}

const StatCard = ({
  icon,
  label,
  value,
  gradient = "from-[#06B6D4] to-[#433389]",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient?: string;
}) => (
  <div className="group rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:bg-white">
    <div className="mb-3 flex items-center gap-2">
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b ${gradient} text-white shadow-[0_8px_20px_rgba(67,51,137,.28)]`}
        style={{ animation: "gentlePulse 2.5s ease-in-out infinite" as any }}
      >
        {icon}
      </div>
      <div className="text-[13px] font-medium text-[#433389]">{label}</div>
    </div>
    <RollingNumber value={value} />
  </div>
);

export default async function Page() {
  const stats = await getLandingStats();

  return (
    <Theme>
      <main className="relative min-h-[100svh]">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-20">
          <Nebula />
        </div>
        <ParallaxDoodles />

        {/* Keyframes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes gentlePulse {
                0%,100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.03); opacity: 0.97; }
              }
              @keyframes rollToDigit {
                from { transform: translateY(0); }
                to { transform: translateY(calc(-1.1em * var(--digit))); }
              }
            `,
          }}
        />

        {/* Header — same height/blur; logo on the left */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-xl">
          <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 h-[72px]">
            {/* Logo (slightly smaller than previous) */}
            <Link href="/" className="flex items-center -my-8">
              <Image
                src="/brand/logo-text.png"
                alt="AI Tutor — Ethiopia"
                width={1200}
                height={300}
                priority
                className="h-[210px] w-auto object-contain select-none"
              />
            </Link>

            {/* Nav on the right (unchanged) */}
            <nav className="relative flex items-center gap-3">
              <a
                href="#features"
                className="rounded-full border border-[#615BDB]/40 px-3 py-2 text-sm text-[#433389] hover:bg-[#615BDB]/10"
              >
                Features
              </a>
              <a
                href="#faq"
                className="rounded-full border border-[#615BDB]/40 px-3 py-2 text-sm text-[#433389] hover:bg-[#615BDB]/10"
              >
                FAQ
              </a>
              <Link
                href="/sign-in"
                className="rounded-full border border-[#615BDB]/30 bg-[#615BDB]/10 px-4 py-2 text-sm font-medium text-[#433389] hover:bg-[#615BDB]/20"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(67,51,137,0.35)] hover:brightness-110"
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mx-auto max-w-3xl px-6 pb-12 pt-6 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-3 -z-10 mx-auto h-[260px] max-w-3xl rounded-3xl border border-white/30 bg-white/65 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.18)]" />
          <h1 className="mx-auto max-w-[22ch] text-5xl md:text-6xl font-semibold leading-tight text-transparent bg-clip-text bg-[linear-gradient(180deg,#0e172a_0%,#1c3356_25%,#3aa6ff_58%,#74ffd6_100%)] drop-shadow-[0_8px_26px_rgba(80,200,255,0.35)]">
            Smarter study, grounded in your textbook.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-black/75">
            Grade-aware library, grounded Study Chat with page citations,
            homework help with steps, generated quizzes, and meaningful progress tracking.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="rounded-xl border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-6 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(67,51,137,0.35)] hover:brightness-110"
            >
              Create free account
            </Link>
            <Link
              id="hero-existing-account"
              href="/sign-in"
              className="rounded-xl px-6 py-3 font-semibold no-underline shadow-sm border border-[#615BDB]/40 text-[#433389] hover:bg-[#615BDB]/10"
            >
              I already have an account
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-black/65">
            <li>• Works offline after first load</li>
            <li>• Contrast & keyboard friendly</li>
            <li>• Mobile-first</li>
          </ul>
        </section>

        {/* Live Stats */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-3 text-center text-sm font-medium text-[#433389]">Live usage</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={<BookOpen className="h-5 w-5" />} label="Textbooks in library" value={stats.textbooks} gradient="from-[#06B6D4] to-[#433389]" />
            <StatCard icon={<ClipboardCheck className="h-5 w-5" />} label="Quizzes taken" value={stats.attempts} gradient="from-[#433389] to-[#06B6D4]" />
            <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={stats.users} gradient="from-[#615BDB] to-[#433389]" />
          </div>
          {!stats.ok && (
            <p className="mt-2 text-center text-xs text-amber-700">
              Stats unavailable.
            </p>
          )}
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
            <FAQItem q="Works without internet?" a="After first load, the PWA shell and previously opened textbooks continue to work offline. Chat/search need connectivity." />
            <FAQItem q="Are answers reliable?" a="Yes. We fetch top textbook snippets via RPC and include page numbers with every answer. If sources are insufficient, we say so." />
            <FAQItem q="Supported grades?" a="Grades 1–12 for Library; all features are grade-aware. National exam prep (G6/G8/G12) is next." />
          </div>
        </section>

        {/* Footer — glossy gradient with contact + social + icon-only mark */}
        <footer className="mt-4">
          <div className="relative overflow-hidden">
            <div className="bg-gradient-to-r from-[#615BDB] via-[#8B5CF6] to-[#06B6D4]">
              <div className="mx-auto max-w-6xl px-6 py-10 text-white">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="text-lg font-semibold">Get in touch</h3>
                    <p className="mt-2 text-white/80">
                      We’re here for parents and students across Ethiopia.
                    </p>
                    <div className="mt-4 space-y-2">
                      <a href="tel:+251912345678" className="flex items-center gap-2 hover:opacity-90">
                        <Phone className="size-4" />
                        <span>+251 91 234 5678</span>
                      </a>
                      <a href="mailto:hello@aitutor.et" className="flex items-center gap-2 hover:opacity-90">
                        <Mail className="size-4" />
                        <span>hello@aitutor.et</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Follow us</h3>
                    <div className="mt-4 flex items-center gap-3">
                      <Link href="https://facebook.com/yourpage" className="rounded-md p-2 hover:bg-white/10">
                        <Facebook className="size-5" />
                      </Link>
                      <Link href="https://x.com/yourpage" className="rounded-md p-2 hover:bg-white/10">
                        <Twitter className="size-5" />
                      </Link>
                      <Link href="https://instagram.com/yourpage" className="rounded-md p-2 hover:bg-white/10">
                        <Instagram className="size-5" />
                      </Link>
                      <Link href="https://youtube.com/@yourpage" className="rounded-md p-2 hover:bg-white/10">
                        <Youtube className="size-5" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                      <Image
                        src="/brand/logo-icon.png"
                        alt="AI Tutor icon"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">AI Tutor Ethiopia</div>
                      <div className="text-white/80">Made for Grades 1–12</div>
                      <div className="mt-2 text-sm text-white/70">
                        Addis Ababa • Amharic & English
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/20 pt-6 text-sm text-white/70 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                  <div>© {new Date().getFullYear()} AI Tutor Ethiopia. All rights reserved.</div>
                  <div className="flex items-center gap-3">
                    <Link href="/privacy" className="hover:opacity-90">
                      Privacy
                    </Link>
                    <span className="opacity-60">•</span>
                    <Link href="/terms" className="hover:opacity-90">
                      Terms
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </Theme>
  );
}
