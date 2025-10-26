// src/app/quiz/page.tsx
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
};

export default function QuizPage() {
  // Subjects come from the signed-in user's grade
  const [subjects, setSubjects] = React.useState<string[]>([]);
  const [resolvedGrade, setResolvedGrade] = React.useState<number | null>(null);
  const [loadingSubjects, setLoadingSubjects] = React.useState<boolean>(true);
  const [subjectsError, setSubjectsError] = React.useState<string | null>(null);

  const [activeSubject, setActiveSubject] = React.useState<string>("");
  const [ranges, setRanges] = React.useState<PageRange[]>([{ start: 21, end: 24 }]);
  const [count, setCount] = React.useState<number>(10);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");

  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<QuizItem[]>([]);
  const [choices, setChoices] = React.useState<Record<string, number>>({});
  const [result, setResult] = React.useState<AttemptResult | null>(null);

  // Inline UI state (no alerts)
  const [uiError, setUiError] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  // Load subjects for the signed-in user's grade
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingSubjects(true);
        setSubjectsError(null);
        const res = await fetch("/api/study/subjects", { cache: "no-store" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error ||
              "Failed to load subjects. Make sure you are signed in and your profile has a grade."
          );
        }
        const data = await res.json();
        if (!mounted) return;
        const subs: string[] = Array.isArray(data?.subjects) ? data.subjects : [];
        setSubjects(subs);
        const g =
          typeof data?.grade === "string" ? parseInt(data.grade, 10) : Number(data?.grade);
        setResolvedGrade(Number.isFinite(g) ? g : null);
        if (subs.length && !activeSubject) setActiveSubject(subs[0]);
      } catch (e: any) {
        if (!mounted) return;
        setSubjectsError(e?.message || "Could not load subjects");
      } finally {
        if (mounted) setLoadingSubjects(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  function setRange(i: number, key: keyof PageRange, val: number) {
    setRanges((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: Math.max(1, Number(val) || 1) };
      return copy;
    });
  }
  function addRange() {
    setRanges((prev) => [...prev, { start: 1, end: 1 }]);
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
    setUiError(null);

    if (!activeSubject || !subjects.includes(activeSubject)) {
      setUiError("Pick a subject available for your grade.");
      return;
    }

    setGenerating(true);
    try {
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

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setItems([]);
        setSessionId(null);
        setUiError(data?.error || "Failed to generate quiz.");
        return;
      }

      setSessionId(data.session_id);
      const normalized: QuizItem[] = (data.items || []).map((it: any) => ({
        ...it,
        options: Array.isArray(it.options) ? it.options : JSON.parse(it.options || "[]"),
      }));
      setItems(normalized);
    } catch (e: any) {
      setUiError(e?.message || "Failed to generate quiz.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    if (!sessionId || !items.length) return;
    setUiError(null);
    setSubmitting(true);

    try {
      const answers: AttemptAnswer[] = items.map((it) => ({
        item_id: String(it.id),
        selected_index: Number.isFinite(choices[it.id]) ? choices[it.id] : -1,
      }));

      const res = await fetch("/api/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answers }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setUiError(data?.error || "Failed to submit.");
        return;
      }

      const r: AttemptResult = {
        correct: data.correct ?? 0,
        total: data.total ?? items.length,
        score_percent: data.score_percent ?? 0,
      };
      setResult(r);
    } catch (e: any) {
      setUiError(e?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="quiz-root" className={styles.quizTheme}>
      <div className={styles.header}>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Adaptive Quiz Generator {resolvedGrade ? `(Grade ${resolvedGrade})` : ""}
        </h1>
        <p className="opacity-80">
          Generate multiple-choice questions grounded in your textbook pages. Select subject(s), page
          ranges, and difficulty.
        </p>
      </div>

      {/* SUBJECT PICKER — filtered by signed-in grade */}
      {loadingSubjects ? (
        <div className="mb-4 text-sm opacity-80">Loading subjects…</div>
      ) : subjectsError ? (
        <div className="mb-4 text-sm text-red-500">{subjectsError}</div>
      ) : null}

      <div className={`${styles.chips} mb-4`}>
        {subjects.map((s) => {
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

      {/* PAGE RANGES */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Page ranges</div>
        <div className={styles.ranges}>
          {ranges.map((r, i) => (
            <div className={styles.rangeRow} key={i}>
              <label className={styles.rangeLabel}>Start</label>
              <input
                className={styles.rangeInput}
                type="number"
                min={1}
                value={r.start}
                onChange={(e) => setRange(i, "start", Number(e.target.value))}
              />
              <label className={styles.rangeLabel}>End</label>
              <input
                className={styles.rangeInput}
                type="number"
                min={1}
                value={r.end}
                onChange={(e) => setRange(i, "end", Number(e.target.value))}
              />
              {ranges.length > 1 && (
                <button className={styles.btnGhost} type="button" onClick={() => removeRange(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className={styles.btnGhost} type="button" onClick={addRange}>
            + Add range
          </button>
        </div>
      </div>

      {/* OPTIONS */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Options</div>
        {uiError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {uiError}
          </div>
        )}
        <div className={styles.optionsRow}>
          <label className={styles.optionLabel}>Questions</label>
          <input
            className={styles.optionInput}
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          />
          <label className={styles.optionLabel}>Difficulty</label>
          <select
            className={styles.optionSelect}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
          <button
            className={styles.btnPrimary}
            type="button"
            onClick={handleGenerate}
            disabled={!activeSubject || generating}
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {/* QUIZ ITEMS */}
      {items.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Your quiz</div>
          <div className={styles.items}>
            {items.map((it, idx) => {
              const opts = Array.isArray(it.options) ? it.options : [];
              const sel = choices[it.id];

              return (
                <div key={it.id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <div className={styles.itemIndex}>Q{idx + 1}</div>
                    <div className={styles.itemSubject}>{it.subject}</div>
                  </div>
                  <div className={styles.itemQuestion}>{it.question}</div>
                  <div className={styles.itemOptions}>
                    {opts.map((o, i) => {
                      const active = sel === i;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() =>
                            setChoices((prev) => ({
                              ...prev,
                              [it.id]: i,
                            }))
                          }
                          className={`${styles.optionChip} ${active ? styles.optionChipActive : ""}`}
                        >
                          {typeof o === "string" ? o : String(o)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className={styles.btnPrimary}
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit answers"}
            </button>
            <button
              className={styles.btnGhost}
              type="button"
              onClick={() => {
                setItems([]);
                setSessionId(null);
                setChoices({});
                setUiError(null);
                setResult(null);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* RESULT OVERLAY */}
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
