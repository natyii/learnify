// src/core/ai/prompts.ts

type Mode = "notes" | "insights" | "summary" | "translate" | "explain" | "steps" | "hints" | "check";

const SUBJECT_STYLES: Record<string, string> = {
  math: `Voice: precise, step-by-step, show working.
- Prefer symbolic steps, align equations.
- Avoid hand-wavy language; prove or justify if asked.
- If multiple methods exist, list briefly then choose the clearest.`,
  physics: `Voice: conceptual + formula-based. Derive, define terms, and show units.`,
  chemistry: `Voice: structured. Balance equations, show mole ratios, safety and lab context if relevant.`,
  biology: `Voice: clear and visual. Define processes, use labeled stages and brief diagrams-in-text.`,
  english: `Voice: explanatory. For grammar, give rule → examples → common mistakes.`,
  history: `Voice: neutral and sourced. Give event → causes → effects; timelines and key figures.`,
  geography: `Voice: spatial. Use maps-in-text, coordinates, relief, climate patterns.`,
  civics: `Voice: civic clarity. Define rights/duties, institutions, processes with examples.`,
  default: `Voice: clear and age-appropriate. Use short sentences and bullet points when helpful.`,
};

const MODE_STYLES: Record<Mode, string> = {
  notes: `Produce structured, concise notes with headers and bullets.`,
  insights: `Extract 3–5 high-leverage insights and why they matter.`,
  summary: `Summarize in 5–8 bullets; keep facts tight.`,
  translate: `Translate to Amharic with simple academic tone.`,
  explain: `Explain like a patient tutor; assume prior topic confusion.`,
  steps: `Show numbered steps. One idea per step. Include equations where relevant.`,
  hints: `Give 3 graded hints (light → stronger) without the final answer.`,
  check: `Validate the student's answer; say Correct/Incorrect and why.`,
};

export function composePrompt(opts: {
  grade: number;
  subject: string;
  mode: Mode;
  question: string;
  contextMd: string;
}) {
  const subjStyle =
    SUBJECT_STYLES[opts.subject.toLowerCase()] ?? SUBJECT_STYLES.default;
  const modeStyle = MODE_STYLES[opts.mode];

  const sys = `You are a concise, accurate Ethiopian school tutor.
Always ground answers using provided textbook snippets; if insufficient, say so briefly.
Keep language matched to Grade ${opts.grade}.`;

  const user = `
Mode: ${opts.mode}
Subject: ${opts.subject}
Question: ${opts.question}

Context:
${opts.contextMd}

Return clear, numbered steps or bullet points.
Finish with a short "${"`"}Sources: pNN, pMM…${"`"} line using the pages cited.
`;

  const style = `Style:\n${subjStyle}\n\n${modeStyle}`;

  return { system: sys, user, style };
}
