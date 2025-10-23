"use client";
import { useMemo, useState } from "react";
import s from "@/app/quiz/quiz.theme.module.css";

type Props = { initialGrade: number | null; subjects: string[]; };
type SubjectSel = { subject: string; ranges: { start: number; end: number }[]; chapters: string[]; };

export default function QuizWizardClient({ initialGrade, subjects }: Props) {
  const [grade] = useState<number | null>(initialGrade);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard">("medium");
  const [selected, setSelected] = useState<SubjectSel[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<null | { session_id: string; items: any[] }>(null);
  const [error, setError] = useState<string | null>(null);

  // answers: item_id -> chosen_index
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const allAnswered = session
    ? session.items.every((it) => Object.prototype.hasOwnProperty.call(answers, it.id))
    : false;

  const subjectSet = useMemo(() => new Set(selected.map(s => s.subject)), [selected]);

  function toggleSubject(subj: string) {
    setSelected((prev) => {
      const exists = prev.find(p => p.subject === subj);
      if (exists) return prev.filter(p => p.subject !== subj);
      return [...prev, { subject: subj, ranges: [{ start: 1, end: 2 }], chapters: [] }];
    });
  }
  function updateRange(subj: string, idx: number, key: "start"|"end", val: number) {
    setSelected(prev => prev.map(p => {
      if (p.subject !== subj) return p;
      const ranges = p.ranges.map((r, i) => i === idx ? { ...r, [key]: val } : r);
      return { ...p, ranges };
    }));
  }
  const addRange    = (subj: string) => setSelected(prev => prev.map(p => p.subject === subj ? { ...p, ranges:[...p.ranges, {start:1,end:1}] } : p));
  const removeRange = (subj: string, idx: number) => setSelected(prev => prev.map(p => p.subject === subj ? { ...p, ranges:p.ranges.filter((_,i)=>i!==idx) } : p));

  async function generate() {
    setError(null);
    setAnswers({});
    setSession(null);
    if (!grade) return setError("Grade not set on profile.");
    if (selected.length === 0) return setError("Select at least one subject.");

    const payload = {
      grade,
      selections: selected.map(s => ({
        subject: s.subject,
        pages: s.ranges.map(r => ({ start: Math.min(r.start, r.end), end: Math.max(r.start, r.end) })),
        chapters: s.chapters
      })),
      count,
      difficulty
    };

    setLoading(true);
    try {
      const res = await fetch("/api/quiz/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create quiz");
      setSession({ session_id: data.session_id, items: data.items });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswers() {
    if (!session) return;
    try {
      const payload = {
        session_id: session.session_id,
        answers: session.items.map((it: any) => ({
          item_id: it.id,
          chosen_index: answers[it.id]
        })),
        duration_ms: 60_000 // TODO: wire up a timer later
      };
      const res = await fetch("/api/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Submit failed");
      alert(`Score: ${data.correct_count}/${data.total} (${data.score_pct}%)`);
      // keep session visible; answers are saved server-side for Progress
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Subjects */}
      <div>
        <div className={`${s.label} mb-2`}>Subjects</div>
        <div className={s.chips}>
          {subjects.map((subj) => {
            const active = subjectSet.has(subj);
            return (
              <button key={subj} type="button" onClick={() => toggleSubject(subj)}
                className={`${s.chip} ${active ? s.chipActive : ""}`}>
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected subjects → page ranges */}
      {selected.map(sel => (
        <div key={sel.subject} className={s.panel}>
          <div className="font-medium mb-3">{sel.subject}</div>
          <div className="space-y-3">
            {sel.ranges.map((r, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <label className={s.label}>Pages</label>
                <input type="number" min={1} value={r.start}
                  onChange={e => updateRange(sel.subject, idx, "start", parseInt(e.target.value || "1", 10))}
                  className={s.input} />
                <span>—</span>
                <input type="number" min={1} value={r.end}
                  onChange={e => updateRange(sel.subject, idx, "end", parseInt(e.target.value || "1", 10))}
                  className={s.input} />
                <button type="button" onClick={() => removeRange(sel.subject, idx)} className="text-xs underline opacity-80">
                  remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addRange(sel.subject)} className="text-xs underline">
              + add page range
            </button>
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className={s.controls}>
        <div>
          <label className={s.label}>Number of questions</label>
          <input type="number" min={1} max={100} value={count}
            onChange={e => setCount(parseInt(e.target.value || "1", 10))}
            className={`${s.input} ml-2 w-24`} />
        </div>
        <div>
          <label className={s.label}>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}
            className={`${s.input} ml-2`}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button type="button" onClick={generate} disabled={loading || !grade} className={s.btnPrimary}>
          {loading ? "Generating…" : "Generate quiz"}
        </button>
      </div>

      {/* Preview + answering */}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {session && (
        <div className={s.panel}>
          <div className="font-medium mb-3">Preview ({session.items.length} items)</div>
          <ol className="space-y-4 list-decimal pl-5">
            {session.items.map((it: any) => {
              const opts = Array.isArray(it.options) ? it.options : JSON.parse(it.options);
              return (
                <li key={it.id} className="space-y-2">
                  <div className="font-medium">{it.question}</div>
                  <div className="space-y-1">
                    {opts.map((o: string, i: number) => {
                      const id = `${it.id}_${i}`;
                      const chosen = answers[it.id] === i;
                      return (
                        <label key={id} htmlFor={id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            id={id}
                            type="radio"
                            name={`q_${it.id}`}
                            checked={chosen}
                            onChange={() => setAnswers(prev => ({ ...prev, [it.id]: i }))}
                          />
                          <span className="text-sm">{String.fromCharCode(65 + i)}. {o}</span>
                        </label>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex gap-2">
            <button type="button" onClick={submitAnswers} disabled={!allAnswered} className={s.btnPrimary}>
              Submit answers
            </button>
            <button type="button" onClick={() => { setSession(null); setAnswers({}); }} className={s.btnGhost}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
