// src/core/tutor.ts
// Build strict, textbook-grounded prompts for each quick-action mode.

export type PageSnippet = { page: number; content: string };

type SystemArgs = {
  subjectKey: string;
  grade: number;
  bookTitle: string | null;
  pages: PageSnippet[];
  mode:
    | "explain"
    | "steps"
    | "hints"
    | "eli5"
    | "diagram"
    | "graph"
    | "map"
    | "quiz";
};

export function buildSystemPrompt(args: SystemArgs) {
  const { subjectKey, grade, bookTitle, pages, mode } = args;
  const bookLine = bookTitle ? `Textbook: ${bookTitle}` : `Textbook: (grade-wide, subject filtered)`;

  const snippets = pages
    .map(
      (p) =>
        `--- page ${p.page} ---\n${p.content?.trim()?.slice(0, 4000) || ""}`
    )
    .join("\n\n");

  // Global safety + grounding contract.
  const base = `
You are a patient Ethiopian school tutor. 
• Ground every response ONLY in the provided textbook snippets.
• If a fact is not in snippets, say you don't have it and ask for a chapter or page.
• Ethiopia national curriculum. Grade ${grade}. Subject: ${subjectKey}.
• ${bookLine}
• Be respectful, concise, and avoid giving final answers outright—guide thinking first.
• Use KaTeX TeX math where helpful: wrap inline math with $...$ and block math with $$...$$.
• If you include an <svg> diagram/graph/map, output valid, minimal inline SVG only (no external assets).
• Always include a "Citations: p. X, p. Y" line at the end showing the pages you used.

TEXTBOOK SNIPPETS
${snippets}
  `.trim();

  const modeRules: Record<SystemArgs["mode"], string> = {
    explain: `
Style: Clear explanation, 3–7 short paragraphs max. Prefer definitions → example → recap.
Do not reveal the final numeric result for calculation problems before guiding the plan.`,
    eli5: `
Style: "Explain Like I'm 5": super simple words, 2–4 tiny paragraphs, one helpful analogy.
No jargon unless you've defined it in one short sentence first.`,
    steps: `
Style: Worked example scaffold.
Sections:
1) Given
2) Plan (bullet points)
3) Steps (numbered, each step a single action)
4) Check (does the result make sense?)
Never skip logical steps. Do NOT just dump a final answer.`,
    hints: `
Style: Progressive hints (max 4). Each hint gets a bit more specific.
No final answer. Encourage the student to try after each hint.`,
    diagram: `
Style: Provide a small <svg> diagram (max-width 520px) + 1–2 sentence caption.
No bitmap, no external refs. Think labels, arrows, axes as needed.`,
    graph: `
Style: Provide an <svg> graph (max-width 520px) with labeled axes and key points.
Include a 1–2 sentence caption. No external assets.`,
    map: `
Style: Provide an <svg> map-style schematic or labeled regions relevant to the content.
Keep it abstract but informative; add a 1–2 sentence caption.`,
    quiz: `
Style: 3–5 multiple-choice questions. For each:
- Show the question.
- Options A–D.
- Then "Feedback:" one line explaining the correct idea (do not reveal answers up front).
Finish with a short "What to review" line.`,
  };

  return `${base}\n\nMODE RULES\n${modeRules[mode]}`.trim();
}

export function buildDeveloperPrompt(mode: SystemArgs["mode"]) {
  // Lightweight dev guardrails per mode.
  const common = `
- Keep within textbook snippets. If uncertain, ask for a page/chapter.
- Prefer short sentences. Ethiopian curriculum alignment.
  `.trim();

  const byMode: Record<SystemArgs["mode"], string> = {
    explain: `- Emphasize core idea → small example → recap.`,
    eli5: `- Use kid-safe metaphors. One analogy only.`,
    steps: `- Each step should be a single, checkable action.`,
    hints: `- Hints should progress: general → specific.`,
    diagram: `- Output exactly one inline <svg> with labels + short caption.`,
    graph: `- Output exactly one inline <svg> with axes labels + short caption.`,
    map: `- Output exactly one inline <svg> of regions/parts + short caption.`,
    quiz: `- Avoid trick questions; test understanding of the page.`,
  };

  return `${common}\n${byMode[mode]}`;
}

// Tiny keyword helper for page search
export function extractKeywords(q: string): string[] {
  return (q || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
}
