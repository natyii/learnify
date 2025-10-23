"use client";

import React from "react";
import ResultOverlay from "@/ui/ResultOverlay";
import styles from "./quiz.theme.module.css";

type Difficulty = "easy" | "medium" | "hard";
type PageRange = { start: number; end: number };
type Selection = { subject: string; pages: PageRange[] };
type QuizItem = {
  id: string;
  subject: string;
  question: string;
  options: string[] | string;
  correct_index?: number;
  source_page_id?: number | null;
};
type GeneratePayload = {
  grade?: number;
  selections: Selection[];
  count: number;
  difficulty: Difficulty;
};
type AttemptAnswer = { item_id: string; selected_index: number };
type AttemptResult = {
  correct: number;
  total: number;
  score_percent: number;
  answers: { item_id: string; selected_index: number; is_correct: boolean }[];
};

const SUBJECTS = [
  "amharic",
  "business",
  "chemistry",
  "civics",
  "economics",
  "english",
  "general",
  "geography",
  "history",
  "ict",
  "physics",
] as const;

export default function QuizPage() {
  const [activeSubject, setActiveSubject] = React.useState<string>("chemistry");
  const [ranges, setRanges] = React.useState<PageRange[]>([{ start: 21, end: 24 }]);
  const [count, setCount] = React.useState<number>(10);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");

  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<QuizItem[]>([]);
  const [choices, setChoices] = React.useState<Record<string, number>>({});

  const [result, setResult] = React.useState<AttemptResult | null>(null);

  function setRange(i: number, key: keyof PageRange, val: number) {
    setRanges((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: val };
      return copy;
    });
  }
  function addRange() {
    setRanges((prev) => [...prev, { start: 1, end: 2 }]);
  }
  function removeRange(i: number) {
    setRanges((prev) => prev.filter((_, idx) => idx !== i));
  }
  function resetSelections() {
    setChoices({});
    setResult(null);
  }

  async function handleGenerate() {
    resetSelections();
    const payload: GeneratePayload = {
      selections: [{ subject: activeSubject, pages: ranges }],
      count,
      difficulty,
    };
    const res = await fetch("/api/quiz/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setItems([]);
      setSessionId(null);
      alert(data?.error || "Failed to generate quiz.");
      return;
    }
    setSessionId(data.session_id);
    const normalized: QuizItem[] = (data.items || []).map((it: any) => ({
      ...it,
      options: Array.isArray(it.options) ? it.options : JSON.parse(it.options || "[]"),
    }));
    setItems(normalized);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || items.length === 0) return;

    const answers: AttemptAnswer[] = items.map((it) => ({
      item_id: String(it.id),
      selected_index: Number.isFinite(choices[it.id]) ? choices[it.id] : -1,
    }));

    const res = await fetch("/api/quiz/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, answers }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data?.error || "Failed to submit.");
      alert(data?.error || "Failed to submit.");
      return;
    }

    const resultData: AttemptResult = {
      correct: data.correct ?? data.correct_count ?? 0,
      total: data.total ?? data.total_count ?? items.length,
      score_percent:
        data.score_percent ??
        Math.round(((data.correct ?? 0) / Math.max(items.length, 1)) * 100),
      answers: data.answers ?? [],
    };
    setResult(resultData);
  }

  return (
    <div className={styles.quizTheme}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className={`text-3xl font-extrabold mb-2 ${styles.quizTitle}`}>Quizzes</h1>
        <p className="text-sm text-zinc-600 mb-6">
          Grade 12 · Select subject(s), page ranges, and difficulty.
        </p>

        <div className={`${styles.chips} mb-4`}>
          {SUBJECTS.map((s) => {
            const active = s === activeSubject;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSubject(s)}
                className={`${styles.chip} ${active ? styles.chipActive : ""}`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className={`${styles.panel} mb-6`}>
          <div className="mb-3 font-semibold text-lg capitalize">{activeSubject}</div>

          <div className="space-y-2">
            {ranges.map((r, i) => (
              <div key={i} className="flex items-end gap-3">
                <div>
                  <div className={styles.label}>Pages</div>
                  <div className="flex items-center gap-2">
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      value={r.start}
                      onChange={(e) => setRange(i, "start", Number(e.target.value))}
                    />
                    <span className="text-zinc-500">—</span>
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      value={r.end}
                      onChange={(e) => setRange(i, "end", Number(e.target.value))}
                    />
                    {ranges.length > 1 && (
                      <button type="button" className={styles.btnGhost} onClick={() => removeRange(i)}>
                        remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className={styles.btnGhost} onClick={addRange}>
              + add page range
            </button>
          </div>

          <div className={`${styles.controls} mt-4`}>
            <div>
              <div className={styles.label}>Number of questions</div>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>

            <div>
              <div className={styles.label}>Difficulty</div>
              <select
                className={styles.input}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="grow" />
            <button type="button" className={styles.btnPrimary} onClick={handleGenerate}>
              Generate quiz
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <form onSubmit={handleSubmit} className={styles.panel}>
            <div className="mb-4 font-semibold">
              Preview ({items.length} {items.length === 1 ? "item" : "items"})
            </div>

            <ol className="space-y-4">
              {items.map((it, idx) => {
                const options = Array.isArray(it.options) ? it.options : [];
                const sel = choices[it.id];
                return (
                  <li key={it.id} className="border-b border-zinc-200 pb-3">
                    <div className="mb-2 font-medium">
                      {idx + 1}. {it.question}
                    </div>
                    <div className="grid gap-1">
                      {options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`q-${it.id}`}
                            checked={sel === i}
                            onChange={() => setChoices((prev) => ({ ...prev, [it.id]: i }))}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex gap-3">
              <button type="submit" className={styles.btnPrimary}>
                Submit answers
              </button>
              <button type="button" onClick={resetSelections} className={styles.btnGhost}>
                Reset
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SHOW OVERLAY WHEN WE HAVE A RESULT */}
      {result && (
        <ResultOverlay
          correct={result.correct}
          total={result.total}
          scorePercent={result.score_percent}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  );
}
