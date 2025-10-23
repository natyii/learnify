// src/ui/progress/ProgressView.tsx
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

/* ================= Types & helpers ================= */
type Attempt = {
  id: string;
  created_at: string;
  total: number;
  correct_count: number;
};
type Answer = {
  attempt_id: string;
  selected_index: number;
  item?: { id: string; subject?: string | null; correct_index?: number | null };
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/* ============== Animated radial gauge (per-subject, blue gradient) ============== */
function Radial({
  size = 112,
  stroke = 12,
  value, // 0–100
  label,
  samples,
}: {
  size?: number;
  stroke?: number;
  value: number;
  label: string;
  samples: number;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const clamped = clamp(Math.round(value), 0, 100);
  const len = (clamped / 100) * C;
  const hasData = samples >= 5;
  const gid = `grad-${label.replace(/\W+/g, "-")}`;

  return (
    <div
      className="rounded-xl ring-1 ring-black/10 p-3 bg-white/70"
      title={`${label}: ${hasData ? clamped + "%" : "need more data"} • ${samples} answers`}
    >
      <svg width={size} height={size} className="block mx-auto">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#433389" />
            <stop offset="100%" stopColor="#6158DB" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={`${len} ${C - len}`}
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${len} ${C - len}` }}
          transition={{ duration: 0.9 }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontSize: 14, fontWeight: 800, fill: "#0b1220" }}
        >
          {hasData ? `${clamped}%` : "—"}
        </text>
      </svg>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-800 truncate" title={label}>
          {label}
        </div>
        <div className="text-xs text-slate-600">{samples} ans</div>
      </div>
      {!hasData && <div className="text-[11px] text-slate-500">need more data</div>}
    </div>
  );
}

/* ================= KPI card ================= */
function KPI({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/70 ring-1 ring-black/10 px-5 py-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-[#0b1220]">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

/* ================= Donut: overall correct vs incorrect (blue gradient) ================= */
function DonutOverall({
  correct,
  total,
  size = 220,
  stroke = 18,
}: {
  correct: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = total > 0 ? (correct * 100) / total : 0;
  const arc = (pct / 100) * C;
  const gid = "donut-overall-grad";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#433389" />
          <stop offset="100%" stopColor="#6158DB" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e6e6ef" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeDasharray={`${arc} ${C - arc}`}
        initial={{ strokeDasharray: `0 ${C}` }}
        animate={{ strokeDasharray: `${arc} ${C - arc}` }}
        transition={{ duration: 1.0 }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ fontSize: 18, fontWeight: 900, fill: "#0b1220" }}
      >
        {total > 0 ? `${Math.round(pct)}%` : "—"}
      </text>
    </svg>
  );
}

/* ================= Movers list (14d vs prev14d) ================= */
function MoversList({
  data, // [{label, delta, nowPct, prevPct, nowN, prevN}]
}: {
  data: { label: string; delta: number; nowPct: number; prevPct: number; nowN: number; prevN: number }[];
}) {
  if (!data.length) {
    return <div className="text-sm text-slate-600">Not enough data yet. Answer more questions to see changes.</div>;
  }

  return (
    <ul className="divide-y divide-black/5">
      {data.map((m) => (
        <li key={m.label} className="py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${
                m.delta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
              title={m.delta >= 0 ? "Improved" : "Declined"}
            >
              {m.delta >= 0 ? "▲" : "▼"}
            </span>
            <span className="text-slate-800">{m.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="tabular-nums text-slate-700">
              {Math.round(m.nowPct)}%
              <span className="text-slate-500 text-xs"> ({m.nowN})</span>
            </span>
            <span className="text-slate-400 text-xs">was {Math.round(m.prevPct)}%</span>
            <span className={`font-bold tabular-nums ${m.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {m.delta >= 0 ? "+" : ""}
              {Math.round(m.delta)} pp
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ================= Main ================= */
export default function ProgressView({
  payload,
}: {
  payload: {
    attempts: Attempt[];
    answers: Answer[];
    meta?: { attemptsLast30?: number };
    errors: { attempts: string | null; answers: string | null };
  };
}) {
  // ✅ Declare sortMode ONCE
  const [sortMode, setSortMode] = useState<"accuracy" | "answers">("accuracy");

  const {
    attemptsCount,
    attemptsLast30,
    streakDays,
    subjects,
    subjectsSorted,
    overallCorrect,
    overallTotal,
    movers,
  } = useMemo(() => {
    const attempts = (payload.attempts || []).filter((a) => (a.total ?? 0) > 0);

    const attemptsCount = attempts.length;
    const attemptsLast30 = payload.meta?.attemptsLast30 ?? 0;

    // Streak (UTC)
    const byDay = new Set(
      attempts.map((a) => new Date(a.created_at).toISOString().slice(0, 10))
    );
    let streakDays = 0;
    {
      const today = new Date();
      for (;;) {
        const key = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - streakDays)
        )
          .toISOString()
          .slice(0, 10);
        if (byDay.has(key)) streakDays++;
        else break;
      }
    }

    // Build attempt_id -> day map
    const attemptDay = new Map<string, string>();
    for (const a of attempts) {
      attemptDay.set(a.id, new Date(a.created_at).toISOString().slice(0, 10));
    }

    // Subjects + overall
    const subjAgg: Record<string, { correct: number; total: number }> = {};
    let overallCorrect = 0;
    let overallTotal = 0;

    for (const ans of payload.answers || []) {
      const isCorrect = ans.item?.correct_index === ans.selected_index;
      overallTotal += 1;
      if (isCorrect) overallCorrect += 1;

      const label = (ans.item?.subject || "Unknown").toString();
      const s = (subjAgg[label] ||= { correct: 0, total: 0 });
      s.total += 1;
      if (isCorrect) s.correct += 1;
    }

    const subjects = Object.entries(subjAgg).map(([label, { correct, total }]) => ({
      label,
      accuracy: total ? (correct * 100) / total : 0,
      samples: total,
    }));

    const subjectsSorted = [...subjects];

    // Movers: last 14 days vs previous 14 days (reliable only)
    const now = new Date();
    const start14 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 13));
    const start28 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 27));

    const inRange = (k: string, start: Date, end: Date) => {
      const t = new Date(k).getTime();
      return t >= start.getTime() && t <= end.getTime();
    };

    const windowAgg = new Map<
      string,
      { now: { c: number; t: number }; prev: { c: number; t: number } }
    >();

    for (const ans of payload.answers || []) {
      const day = attemptDay.get(ans.attempt_id);
      if (!day) continue;
      const subject = (ans.item?.subject || "Unknown").toString();
      let rec = windowAgg.get(subject);
      if (!rec) {
        rec = { now: { c: 0, t: 0 }, prev: { c: 0, t: 0 } };
        windowAgg.set(subject, rec);
      }
      const correct = ans.item?.correct_index === ans.selected_index;
      if (inRange(day, start14, now)) {
        rec.now.t += 1;
        if (correct) rec.now.c += 1;
      } else if (inRange(day, start28, new Date(Date.UTC(start14.getUTCFullYear(), start14.getUTCMonth(), start14.getUTCDate() - 1)))) {
        rec.prev.t += 1;
        if (correct) rec.prev.c += 1;
      }
    }

    const MIN_PER_WINDOW = 8;
    const movers = Array.from(windowAgg.entries())
      .filter(([, v]) => v.now.t >= MIN_PER_WINDOW && v.prev.t >= MIN_PER_WINDOW)
      .map(([label, v]) => {
        const nowPct = v.now.t ? (v.now.c * 100) / v.now.t : 0;
        const prevPct = v.prev.t ? (v.prev.c * 100) / v.prev.t : 0;
        const delta = nowPct - prevPct;
        return { label, delta, nowPct, prevPct, nowN: v.now.t, prevN: v.prev.t };
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 6);

    return {
      attemptsCount,
      attemptsLast30,
      streakDays,
      subjects,
      subjectsSorted,
      overallCorrect,
      overallTotal,
      movers,
    };
  }, [payload]);

  // UI sort switch for the radial grid (uses the single state declared above)
  const gridSubjects = useMemo(() => {
    const arr = [...subjectsSorted];
    if (sortMode === "answers") {
      arr.sort(
        (a, b) =>
          b.samples - a.samples || b.accuracy - a.accuracy || a.label.localeCompare(b.label)
      );
    } else {
      arr.sort(
        (a, b) =>
          Math.round(b.accuracy) - Math.round(a.accuracy) ||
          b.samples - a.samples ||
          a.label.localeCompare(b.label)
      );
    }
    return arr;
  }, [subjectsSorted, sortMode]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">
          Your Progress
        </h1>
        <p className="mt-2 text-sm text-slate-600">Lifetime overview based on your real quiz activity.</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <KPI label="Quiz Attempts" value={String(attemptsCount)} hint={`Last 30 days: ${attemptsLast30}`} />
        <KPI label="Learning Streak" value={`${streakDays}d`} hint="Consecutive days with attempts" />
      </section>

      {/* Subject accuracy — animated radial gauges */}
      <section className="mt-10 rounded-2xl p-5 bg-white/70 ring-1 ring-black/10 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subject accuracy</h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span>Sort by</span>
            <button
              onClick={() => setSortMode("accuracy")}
              className={`px-2 py-1 rounded border ${
                sortMode === "accuracy"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-black/10 text-slate-700"
              }`}
            >
              Accuracy
            </button>
            <button
              onClick={() => setSortMode("answers")}
              className={`px-2 py-1 rounded border ${
                sortMode === "answers"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-black/10 text-slate-700"
              }`}
            >
              Answers
            </button>
          </div>
        </div>

        {gridSubjects.length ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {gridSubjects.map((s, i) => (
              <motion.div
                key={s.label + i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Radial label={s.label} value={s.accuracy} samples={s.samples} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Bottom row: Overall donut + Subject movers */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl p-5 bg-white/70 ring-1 ring-black/10 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-700">Overall accuracy</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <DonutOverall correct={overallCorrect} total={overallTotal} />
            <div className="text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Correct</span>
                <span className="font-semibold tabular-nums">{overallCorrect}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Incorrect</span>
                <span className="font-semibold tabular-nums">{overallTotal - overallCorrect}</span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Based on all your answered questions across subjects.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white/70 ring-1 ring-black/10 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Subject movers (last 14 days vs previous 14 days)
          </div>
          <MoversList data={movers} />
        </div>
      </section>

      {(payload.errors.attempts || payload.errors.answers) && (
        <div className="mt-10 text-xs text-red-600">
          <div className="font-semibold">Data warnings</div>
          <pre className="whitespace-pre-wrap">{JSON.stringify(payload.errors, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="text-sm text-slate-600">
      No subject data yet. Take a quiz to start building your profile.
    </div>
  );
}
