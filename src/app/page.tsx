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
  ChevronDown,
} from "lucide-react";

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

        {/* Keyframes + local CSS */}
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

              /* Spotlight Carousel (3 slides, 6s each = 18s loop) */
              @keyframes slideFade {
                0%   { opacity: 0; transform: translateY(8px); }
                8%   { opacity: 1; transform: translateY(0); }
                28%  { opacity: 1; transform: translateY(0); }
                33%  { opacity: 0; transform: translateY(-4px); }
                100% { opacity: 0; transform: translateY(-4px); }
              }
              .hero-carousel { position: relative; isolation: isolate; }
              .hero-carousel .slide {
                position: absolute; inset: 0;
                opacity: 0;
                will-change: opacity, transform;
                animation: slideFade 18s ease-in-out infinite;
              }
              .hero-carousel .slide.slide-1 { animation-delay: 0s; }
              .hero-carousel .slide.slide-2 { animation-delay: 6s; }
              .hero-carousel .slide.slide-3 { animation-delay: 12s; }
              .hero-carousel:hover .slide,
              .hero-carousel:focus-within .slide { animation-play-state: paused; }

              .hero-accent {
                background-image: linear-gradient(90deg,#3aa6ff,#74ffd6,#3aa6ff);
                background-size: 200% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                filter: drop-shadow(0 8px 26px rgba(80,200,255,0.35));
                animation: accentSweep 1800ms ease-in-out infinite;
                animation-delay: 300ms;
              }
              @keyframes accentSweep {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }

              .hero-size-guard { min-height: 210px; }

              @keyframes fadeInSoft { from { opacity: 0 } to { opacity: 1 } }
              .scroll-cue { animation: fadeInSoft .8s .2s ease-out both; }

              .nav-glow:focus-visible {
                outline: none;
                box-shadow: 0 0 0 3px rgba(97,91,219,0.5);
                transition: box-shadow .2s ease;
              }

              /* ===== Footer gradient motion (violet/blue -> black) ===== */
              @keyframes panGradients {
                0%   { background-position: 5% 60%, 85% 35%, 50% 50%; }
                50%  { background-position: 20% 40%, 70% 55%, 50% 50%; }
                100% { background-position: 35% 25%, 55% 70%, 50% 50%; }
              }
              .footer-wrap { position: relative; overflow: hidden; background: #000; color: #fff; isolation: isolate; }
              .footer-sheen {
                position: absolute; inset: 0; z-index: -1;
                background:
                  radial-gradient(70% 90% at 10% 70%, rgba(97,91,219,0.80) 0%, rgba(97,91,219,0.12) 48%, transparent 75%),
                  radial-gradient(75% 95% at 85% 30%, rgba(67,51,137,0.70) 0%, rgba(67,51,137,0.10) 52%, transparent 78%),
                  linear-gradient(180deg, #0b0f19 0%, #0a0e1a 55%, #000000 100%);
                background-repeat: no-repeat;
                background-size: 180% 180%, 180% 180%, 100% 100%;
                animation: panGradients 28s ease-in-out infinite alternate;
                filter: saturate(1.05);
              }
              .footer-wrap .content { position: relative; }

              /* ===== Hero glossy card ===== */
              .hero-card {
                position: relative;
                border-radius: 28px;
                background: rgba(255,255,255,0.68);
                backdrop-filter: saturate(150%) blur(18px);
                -webkit-backdrop-filter: saturate(150%) blur(18px);
                border: 1px solid rgba(255,255,255,0.35);
                box-shadow:
                  0 30px 80px rgba(0,0,0,0.18),
                  inset 0 1px 0 rgba(255,255,255,0.55);
              }
              .hero-card::before {
                content:"";
                position:absolute; inset: -1px;
                border-radius: 30px;
                pointer-events:none;
                background:
                  linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0) 40%),
                  linear-gradient(90deg, rgba(97,91,219,0.18), rgba(6,182,212,0.0));
                mask: linear-gradient(#000,#000) content-box, linear-gradient(#000,#000);
                -webkit-mask: linear-gradient(#000,#000) content-box, linear-gradient(#000,#000);
                padding: 1px;
              }

              @media (prefers-reduced-motion: reduce) {
                .hero-carousel .slide { animation: none !important; opacity: 0; transform: none; }
                .hero-carousel .slide.slide-1 { opacity: 1; }
                .hero-accent { animation: none !important; }
                .footer-sheen { animation: none !important; }
              }
            `,
          }}
        />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-xl">
          <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 h-[72px]">
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

            <nav className="relative flex items-center gap-3">
              <a
                href="#features"
                className="nav-glow rounded-full border border-[#615BDB]/40 px-3 py-2 text-sm text-[#433389] hover:bg-[#615BDB]/10"
              >
                Features
              </a>
              <a
                href="#faq"
                className="nav-glow rounded-full border border-[#615BDB]/40 px-3 py-2 text-sm text-[#433389] hover:bg-[#615BDB]/10"
              >
                FAQ
              </a>
              <Link
                href="/sign-in"
                className="nav-glow rounded-full border border-[#615BDB]/30 bg-[#615BDB]/10 px-4 py-2 text-sm font-medium text-[#433389] hover:bg-[#615BDB]/20"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="nav-glow rounded-full border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(67,51,137,0.35)] hover:brightness-110"
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero — wrapped in glossy card */}
        <section className="relative mx-auto max-w-3xl px-6 pb-12 pt-6 text-center">
          <div className="hero-card mx-auto max-w-3xl px-6 py-8 md:px-10 md:py-10">
            <div className="hero-carousel hero-size-guard">
              {/* Slide 1 */}
              <div className="slide slide-1">
                <h1 className="mx-auto max-w-[22ch] text-5xl md:text-6xl font-semibold leading-tight text-[#0e172a]">
                  Smarter study, grounded in <span className="hero-accent">your textbook</span>.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-[15px] text-black/75">
                  Grade-aware library, grounded Study Chat with page citations, homework help with steps,
                  generated quizzes, and meaningful progress tracking.
                </p>
              </div>

              {/* Slide 2 */}
              <div className="slide slide-2">
                <h1 className="mx-auto max-w-[22ch] text-5xl md:text-6xl font-semibold leading-tight text-[#0e172a]">
                  Learn faster, one <span className="hero-accent">verified</span> page at a time.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-[15px] text-black/75">
                  Every answer cites the exact textbook page — clarity you can trust.
                </p>
              </div>

              {/* Slide 3 */}
              <div className="slide slide-3">
                <h1 className="mx-auto max-w-[22ch] text-5xl md:text-6xl font-semibold leading-tight text-[#0e172a]">
                  Homework help that actually <span className="hero-accent">explains</span>.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-[15px] text-black/75">
                  Explain • Steps • Hints • Check — not just answers, real understanding.
                </p>
              </div>
            </div>

            {/* CTA row */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="btn-shimmer rounded-xl border border-transparent bg-[linear-gradient(180deg,#615BDB_0%,#433389_100%)] px-6 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(67,51,137,0.35)] hover:brightness-110"
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
          </div>

          {/* Scroll cue */}
          <div className="mt-8 flex justify-center">
            <a
              href="#features"
              className="scroll-cue inline-flex items-center gap-2 rounded-full border border-[#615BDB]/30 bg-white/60 px-3 py-1.5 text-xs text-[#433389] backdrop-blur-md transition hover:bg-white/80 hover:translate-y-0.5"
            >
              <ChevronDown className="h-4 w-4" />
              <span>Explore features</span>
            </a>
          </div>
        </section>

        {/* Live Stats */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-3 text-center text-sm font-medium text-[#433389]">
            Live usage
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Textbooks in library"
              value={stats.textbooks}
              gradient="from-[#06B6D4] to-[#433389]"
            />
            <StatCard
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="Quizzes taken"
              value={stats.attempts}
              gradient="from-[#433389] to-[#06B6D4]"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Total users"
              value={stats.users}
              gradient="from-[#615BDB] to-[#433389]"
            />
          </div>
          {!stats.ok && (
            <p className="mt-2 text-center text-xs text-amber-700">Stats unavailable.</p>
          )}
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[BookOpenCheck, MessagesSquare, PencilRuler, GraduationCap, ChartBar, ShieldCheck].map(
              (Icon, i) => (
                <div
                  key={i}
                  className="transition-transform duration-200 will-change-transform hover:-translate-y-0.5 md:hover:-translate-y-1"
                >
                  <FeatureCard
                    icon={<Icon className="h-5 w-5" />}
                    title={[
                      "Library by grade",
                      "Study Chat (grounded)",
                      "Homework help",
                      "Quizzes",
                      "Progress",
                      "Built for schools",
                    ][i]}
                    toneIndex={i}
                  >
                    {
                      [
                        "Official textbooks; signed links keep storage private.",
                        "3–5 textbook snippets per answer. “Sources: pNN…”",
                        "Explain • Steps • Hints • Check. Logged for review.",
                        "Auto-generated MCQs, instant scoring, attempt history.",
                        "Study minutes + homework logs; accessible charts.",
                        "Grade-aware, high contrast, keyboardable; Groq now, OpenAI later.",
                      ][i]
                    }
                  </FeatureCard>
                </div>
              )
            )}
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

        {/* Footer — smooth brand violet/blue to black, big icon on the left */}
        <footer className="mt-4">
          <div className="footer-wrap">
            <div className="footer-sheen" />
            <div className="content">
              <div className="mx-auto max-w-6xl px-6 py-10 text-white">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Big icon only (LEFT) */}
                  <div className="flex items-center">
                    <Image
                      src="/brand/logo-icon.png"
                      alt="AI Tutor icon"
                      width={256}
                      height={256}
                      className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 select-none"
                    />
                  </div>

                  {/* Contact */}
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

                  {/* Socials */}
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
                </div>

                <div className="mt-10 border-t border-white/20 pt-6 text-sm text-white/70 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                  <div>© {new Date().getFullYear()} AI Tutor Ethiopia. All rights reserved.</div>
                  <div className="flex items-center gap-3">
                    <Link href="/privacy" className="hover:opacity-90">Privacy</Link>
                    <span className="opacity-60">•</span>
                    <Link href="/terms" className="hover:opacity-90">Terms</Link>
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
