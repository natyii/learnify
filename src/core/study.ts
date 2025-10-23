// src/core/study.ts
export type Tone = "language" | "quant" | "science" | "social" | "general";
export type SubjectKey =
  | "amharic" | "english"
  | "math" | "algebra" | "geometry" | "trigonometry" | "calculus" | "statistics"
  | "science" | "biology" | "chemistry" | "physics"
  | "geography" | "history" | "civics" | "economics"
  | "ict" | "entrepreneurship" | "art" | "music"
  | "general" | "study";

export type Quick = { label: string; kind: "hint" | "steps" | "diagram" | "graph" | "map" | "flash" | "quiz" | "explain_elo5" | "explain_brief" };

export type SubjectConfig = {
  key: SubjectKey;
  title: string;
  tone: Tone;
  quick: Quick[];
  // Grade-aware system prompt builder
  system: (grade: number) => string;
};

const toneByGrade = (g: number) => {
  if (g <= 3) return "Speak warmly with short sentences. Use one concrete example.";
  if (g <= 6) return "Simple language with light reasoning words (because/so). Give two brief examples and one question back.";
  if (g <= 9) return "Balanced academic tone. Link ideas and include a short step-by-step when useful.";
  return "Academic, exam-prep tone. Structure with headings, steps, and a quick self-check.";
};

// ---- Base templates ---------------------------------------------------------

const baseTemplate = (
  g: number,
  subjectTitle: string,
  visualRule: string,
  extras = ""
) => `You are a grade ${g} ${subjectTitle} tutor in Ethiopia.
Your goal is to help the student learn, not to hand over answers.

RULES:
- Begin with ONE clarifying question or micro-hint.
- Do NOT reveal the final answer on first reply.
- Only give full solutions after the student attempts OR presses 'Step-by-step'.
- Prefer content aligned to Ethiopian syllabus for grade ${g}.
- ${toneByGrade(g)}
${extras}

STRUCTURE EACH REPLY:
1) Clarify/Restate the task
2) One hint (never the final numeric/complete answer first)
3) If 'Step-by-step' is requested → outline steps; reveal results only at the end
4) Provide a small self-check or reflection
5) If a visual helps, include ${visualRule}
6) End with: If you share a page excerpt, I will ground the answer to that page.

VISUALS:
Output valid <svg>...</svg> markup with ≤120 lines when asked for diagrams/graphs/maps/flowcharts.`;

// Subject-specific extras
const mathExtras =
  "For calculations: Given → Wanted → Rule → Substitute → Units → Check reasonableness. For geometry/graphs, prefer axis labels and neat proportions.";
const bioExtras =
  "Explain biological processes as input→process→output→regulation. Labeled parts if diagramming.";
const chemExtras =
  "Balance chemical equations; track states; use units and significant figures; add safety notes when relevant.";
const physExtras =
  "Always define variables and units. Use free-body or ray diagrams as SVG when helpful. Do a magnitude sanity check.";
const geoExtras =
  "If applicable, sketch a simple map SVG with legend, scale hint, and key labels. Compare past vs current data if relevant.";
const histExtras =
  "Organize as cause → event → effect. Offer a minimal timeline (SVG) when comparing periods.";
const civicsExtras =
  "Prefer flowcharts for processes (e.g., bill to law). Relate to local examples.";
const econExtras =
  "Use small numeric tables; show simple graphs as SVG where relevant. Emphasize reasoning, not memorization.";
const ictExtras =
  "Explain concepts + give pseudocode/flowchart for algorithms. Do not output full code on first go.";
const langExtras =
  "Languages: do reading comprehension, grammar hints, and writing scaffolds. Never write the whole essay unless requested; provide outlines and prompts instead.";
const artExtras =
  "Interpret symbols and forms. Offer a minimal sketch SVG when useful (composition, rhythm).";

const QA = {
  hint: { label: "Hint", kind: "hint" as const },
  steps: { label: "Step-by-step", kind: "steps" as const },
  diag: { label: "Explain + diagram", kind: "diagram" as const },
  graph: { label: "Make graph", kind: "graph" as const },
  map: { label: "Sketch map", kind: "map" as const },
  flash: { label: "Make flashcards", kind: "flash" as const },
  quiz: { label: "Quick quiz", kind: "quiz" as const },
  elo5: { label: "Explain like a 5-year-old", kind: "explain_elo5" as const },
  brief: { label: "Brief explanation", kind: "explain_brief" as const },
};

// ---- Subject registry -------------------------------------------------------

export const SUBJECTS: Record<SubjectKey, SubjectConfig> = {
  // Languages
  amharic: {
    key: "amharic",
    title: "Amharic",
    tone: "language",
    quick: [QA.hint, QA.brief, QA.flash, QA.quiz],
    system: (g) => baseTemplate(g, "Amharic language", "no visual requirement", langExtras),
  },
  english: {
    key: "english",
    title: "English",
    tone: "language",
    quick: [QA.hint, QA.brief, QA.flash, QA.quiz],
    system: (g) => baseTemplate(g, "English language", "no visual requirement", langExtras),
  },

  // Math family
  math: {
    key: "math",
    title: "Mathematics",
    tone: "quant",
    quick: [QA.hint, QA.steps, QA.graph, QA.diag, QA.quiz, QA.elo5, QA.brief],
    system: (g) => baseTemplate(g, "Mathematics", "geometry or graph SVG", mathExtras),
  },
  algebra: {
    key: "algebra",
    title: "Algebra",
    tone: "quant",
    quick: [QA.hint, QA.steps, QA.graph, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Algebra", "function graph SVG", mathExtras),
  },
  geometry: {
    key: "geometry",
    title: "Geometry",
    tone: "quant",
    quick: [QA.hint, QA.steps, QA.diag, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Geometry", "labeled geometry SVG", mathExtras),
  },
  trigonometry: {
    key: "trigonometry",
    title: "Trigonometry",
    tone: "quant",
    quick: [QA.hint, QA.steps, QA.graph, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Trigonometry", "unit circle or wave SVG", mathExtras),
  },
  calculus: {
    key: "calculus",
    title: "Calculus",
    tone: "quant",
    quick: [QA.hint, QA.steps, QA.graph, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Calculus", "graph with tangent/area SVG", mathExtras),
  },
  statistics: {
    key: "statistics",
    title: "Statistics",
    tone: "quant",
    quick: [QA.hint, QA.steps, QA.graph, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Statistics", "histogram/boxplot SVG", mathExtras),
  },

  // Science
  science: {
    key: "science",
    title: "General Science",
    tone: "science",
    quick: [QA.hint, QA.diag, QA.flash, QA.quiz, QA.elo5],
    system: (g) => baseTemplate(g, "General Science", "simple labeled SVG if helpful", bioExtras),
  },
  biology: {
    key: "biology",
    title: "Biology",
    tone: "science",
    quick: [QA.hint, QA.steps, QA.diag, QA.flash, QA.quiz, QA.elo5, QA.brief],
    system: (g) => baseTemplate(g, "Biology", "labeled process/organ SVG", bioExtras),
  },
  chemistry: {
    key: "chemistry",
    title: "Chemistry",
    tone: "science",
    quick: [QA.hint, QA.steps, QA.diag, QA.flash, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Chemistry", "reaction scheme or particle-flow SVG", chemExtras),
  },
  physics: {
    key: "physics",
    title: "Physics",
    tone: "science",
    quick: [QA.hint, QA.steps, QA.graph, QA.diag, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Physics", "free-body or ray diagram SVG", physExtras),
  },

  // Social / Humanities
  geography: {
    key: "geography",
    title: "Geography",
    tone: "social",
    quick: [QA.hint, QA.map, QA.graph, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Geography", "map sketch SVG with legend", geoExtras),
  },
  history: {
    key: "history",
    title: "History",
    tone: "social",
    quick: [QA.hint, QA.map, QA.flash, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "History", "timeline SVG", histExtras),
  },
  civics: {
    key: "civics",
    title: "Civics",
    tone: "social",
    quick: [QA.hint, QA.diag, QA.flash, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Civics", "flowchart SVG", civicsExtras),
  },
  economics: {
    key: "economics",
    title: "Economics",
    tone: "social",
    quick: [QA.hint, QA.graph, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Economics", "supply/demand or cycle flowchart SVG", econExtras),
  },

  // Tech / Arts
  ict: {
    key: "ict",
    title: "ICT",
    tone: "general",
    quick: [QA.hint, QA.diag, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "ICT", "algorithm flowchart SVG", ictExtras),
  },
  entrepreneurship: {
    key: "entrepreneurship",
    title: "Entrepreneurship",
    tone: "general",
    quick: [QA.hint, QA.diag, QA.quiz, QA.brief],
    system: (g) => baseTemplate(g, "Entrepreneurship", "process flowchart SVG", econExtras),
  },
  art: {
    key: "art",
    title: "Art",
    tone: "general",
    quick: [QA.hint, QA.diag, QA.brief],
    system: (g) => baseTemplate(g, "Art", "minimal composition SVG", artExtras),
  },
  music: {
    key: "music",
    title: "Music",
    tone: "general",
    quick: [QA.hint, QA.brief, QA.quiz],
    system: (g) => baseTemplate(g, "Music", "no visual requirement (optional rhythm SVG)", artExtras),
  },

  // Routing helpers
  study: {
    key: "study",
    title: "Study",
    tone: "general",
    quick: [QA.hint, QA.brief, QA.flash, QA.quiz],
    system: (g) => baseTemplate(g, "General Study", "optional sketch", ""),
  },
  general: {
    key: "general",
    title: "General",
    tone: "general",
    quick: [QA.hint, QA.brief, QA.flash, QA.quiz],
    system: (g) => baseTemplate(g, "General", "optional sketch", ""),
  },
};

export function subjectToSlug(k: SubjectKey): string {
  return k.replace(/\s+/g, "-").toLowerCase();
}

export function getSubjectConfig(key: SubjectKey, grade: number) {
  const cfg = SUBJECTS[key] ?? SUBJECTS.general;
  return {
    ...cfg,
    systemPrompt: cfg.system(grade),
  };
}
