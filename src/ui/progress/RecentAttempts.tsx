// src/ui/progress/RecentAttempts.tsx
"use client";

import Link from "next/link";

type Attempt = {
  id: string;
  created_at: string;
  correct_count: number;
  total: number;
  duration_ms: number | null;
  session?: { id: string | null; difficulty: string | null };
};

export default function RecentAttempts({ attempts }: { attempts: Attempt[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent attempts</h3>
        <span className="text-xs text-slate-600">Last {Math.min(10, attempts.length)} shown</span>
      </div>
      <div className="overflow-hidden rounded-xl ring-1 ring-black/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <Th>Date</Th>
              <Th>Score</Th>
              <Th>Duration</Th>
              <Th>Difficulty</Th>
              <Th className="text-right pr-4">Details</Th>
            </tr>
          </thead>
          <tbody className="bg-white/60">
            {attempts.map((a) => {
              const pct = a.total ? Math.round((a.correct_count * 100) / a.total) : 0;
              const dur = fmtDuration(a.duration_ms || 0);
              const difficulty =
                (a.session?.difficulty?.toString() || "—").replace(/^\w/, (c) => c.toUpperCase());

              return (
                <tr key={a.id} className="border-t border-black/5">
                  <Td>{fmtDate(a.created_at)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded bg-black/10 overflow-hidden">
                        <div
                          className="h-2 rounded bg-gradient-to-r from-indigo-500 to-cyan-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                  </Td>
                  <Td>{dur}</Td>
                  <Td>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-black/10"
                      style={{ background: "rgba(97,91,219,0.08)" }}>
                      {difficulty}
                    </span>
                  </Td>
                  <Td className="text-right pr-4">
                    <Link
                      href={`/progress/${a.id}`}
                      className="text-indigo-600 font-medium hover:underline"
                    >
                      Review
                    </Link>
                  </Td>
                </tr>
              );
            })}
            {!attempts.length && (
              <tr>
                <Td colSpan={5} className="text-slate-500">
                  No attempts in the last 30 days.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: any) {
  return (
    <th className={`px-4 py-2 text-left text-slate-700 ${className}`}>{children}</th>
  );
}
function Td({ children, className = "", colSpan }: any) {
  return (
    <td colSpan={colSpan} className={`px-4 py-2 text-slate-700 ${className}`}>{children}</td>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")} min`;
}
