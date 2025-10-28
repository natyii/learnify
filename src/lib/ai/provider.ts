// src/lib/ai/provider.ts
// Smart Diagram Engine: JSON -> deterministic SVG (graphs, blocks, concepts, parts, reactions, map)
// Also: Explain, ELI5, Verify, Guided, strict no-fallback grounding, Amharic, sanitization.

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

type ProviderArgs = {
  mode:
    | "explain"
    | "eli5"
    | "diagram"
    | "graph"
    | "map"
    | "steps"
    | "hints"
    | "quiz"
    | "verify"
    | "guided";
  subject?: string | null;
  grade?: number | null;
  question: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }> | unknown;
  context?: {
    citations?: Array<{ bookId: string; page: number }>;
    snippets?: Array<{ bookId: string; page: number; excerpt: string; title?: string }>;
  };
  sessionId?: string | null;
};

type ProviderResult = {
  content: string;
  citations: Array<{ bookId: string; page: number }>;
  svg: string | null;
};

// -------------------------------------
// Subject + mode prompt library (TEXT)
// -------------------------------------
type ModeKey = "explain" | "eli5" | "diagram" | "verify" | "guided";
type SubjectKey =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "geography"
  | "civics"
  | "english"
  | "amharic"
  | "ict";

const SUBJECT_PROMPTS: Record<SubjectKey, Partial<Record<ModeKey, string>>> = {
  math: {
    explain: [
      "You are a Grade {grade} Mathematics teacher in Ethiopia.",
      "Explain the topic in clear, structured teacher notes.",
      "Always include: one worked numeric example; key formulas; a short reasoning for each step.",
      "Output sections: ### Key Idea, ### Definitions, ### Relationships/Formulas, ### Example, ### Quick Checks.",
      "Use readable formulas like `a = Δv / Δt`, `K = 1/2 m v²` and add one-liner explanations after each.",
    ].join("\n"),
    eli5: [
      "Teach like you’re helping a young learner who enjoys counting and puzzles.",
      "Use tiny stories (fruits, coins, classmates). Avoid heavy symbols; introduce symbols after the story.",
      "End with one memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Give a short verdict about the student's claim, using a gentle teacher tone:",
      "- If correct: '✅ Correct' then one short reason grounded in context.",
      "- If not correct: '❌ Not correct' then a nudge to re-check the relevant formula from the page.",
      "- If missing givens: '⚠️ Not enough info' and list the needed data.",
      "Keep it to 2–3 short lines; cite the page number.",
    ].join("\n"),
    guided: [
      "This is an exercise on the Study page. Provide guidance only; do NOT compute the final answer.",
      "Structure strictly:",
      "- What is asked (1 line)",
      "- Given (bullets with symbols + units)",
      "- Find (target variable)",
      "- Relevant formulas (with one-line plain-language meaning)",
      "- Plan (3–5 short steps)",
      "- Hints (1–3 progressive nudges)",
      "- Common mistake (1 line)",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  physics: {
    explain: [
      "You are a Grade {grade} Physics teacher.",
      "Provide a variables table (e.g., F: force (N), μ: coefficient of friction).",
      "Include one real-life example and at least one core formula with a one-line explanation.",
      "Sections: ### Key Idea, ### Variables, ### Formula, ### Example, ### Quick Checks.",
    ].join("\n"),
    eli5: [
      "Explain like to a curious child using push/pull, light/sound, or motion stories.",
      "Avoid heavy math; keep it intuitive.",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Give a short verdict with a guiding tone:",
      "- ✅ Correct / ❌ Not correct / ⚠️ Not enough info.",
      "If not correct, point the student to the right relation (e.g., `v = Δx / Δt`) and invite a re-check.",
      "2–3 short lines total; include page citation.",
    ].join("\n"),
    guided: [
      "Exercise guidance only; do NOT give final numeric results.",
      "Structure:",
      "- What is asked",
      "- Given (with units)",
      "- Find",
      "- Formula(s) with one-line meaning (e.g., `F = μN` → friction equals μ times normal force)",
      "- Plan (3–5 steps)",
      "- Hints (1–3 nudges)",
      "- Common mistake",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  chemistry: {
    explain: [
      "You are a Grade {grade} Chemistry teacher.",
      "Structure: Concept → Particle view → Balanced equation → Everyday example.",
      "Show balanced equations like `2H₂ + O₂ → 2H₂O` and briefly explain what it means.",
    ].join("\n"),
    eli5: [
      "Use kitchen stories (mixing, heating, smells, bubbles).",
      "Avoid Latin roots unless you define them simply.",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Give a short verdict (✅/❌/⚠️). If ❌, nudge toward the balanced equation from the page and ask to re-check coefficients.",
      "Keep 2–3 lines; cite page.",
    ].join("\n"),
    guided: [
      "Guidance-only for exercises (no final answer).",
      "Structure: What is asked / Given / Find / Equation(s) / Plan / Hints / Common mistake.",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  biology: {
    explain: [
      "You are a Grade {grade} Biology teacher.",
      "Use: Definition → Parts → Process → Role/Importance.",
      "Include one relatable example (human body or plant).",
    ].join("\n"),
    eli5: [
      "Explain with factory/road/team analogies to describe functions in a body or plant.",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Give a short verdict (✅/❌/⚠️) with 1–2 lines of reason referencing the page.",
      "Keep it guiding, not punitive.",
    ].join("\n"),
    guided: [
      "Guidance-only for comprehension questions: identify what is asked, key facts to extract from the page, and a plan to structure an answer.",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  geography: {
    explain: [
      "You are a Grade {grade} Geography teacher.",
      "Define the feature → Ethiopia/Africa context → Causes/Effects → Example.",
      "If a process exists, list stages clearly.",
    ].join("\n"),
    eli5: [
      "Tell a short story about land, rivers, seasons, or travel.",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Short verdict (✅/❌/⚠️) with 1–2 lines explaining the page-based reason.",
    ].join("\n"),
    guided: [
      "Guidance: What is asked / Facts to extract / Plan to answer / Hint(s).",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  civics: {
    explain: [
      "You are a Civics teacher.",
      "Idea → Rights & Responsibilities → Real Ethiopian example (school/community).",
      "End with one reflection question.",
    ].join("\n"),
    eli5: [
      "Tell a story about classmates/community sharing/queuing/helping.",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Short verdict (✅/❌/⚠️) with a gentle nudge toward the correct civic principle from the page.",
    ].join("\n"),
    guided: [
      "Guidance for discussion questions: identify the idea, evidence from the page, and a clear outline.",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  english: {
    explain: [
      "You are an English teacher.",
      "If grammar: state the rule, give 2 correct and 1 incorrect example, explain why.",
      "If vocabulary: definition, example sentence, near synonym/antonym.",
    ].join("\n"),
    eli5: [
      "Use super-simple sentences; if doing phonics, keep examples short and common.",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Verdict (✅/❌/⚠️) with a nudge to the correct rule from the page; keep it to 2–3 lines.",
    ].join("\n"),
    guided: [
      "Guidance for exercises: What is asked / Key rule(s) / Plan / Hint(s) / Common mistake.",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
  amharic: {
    explain: [
      "አንተ የመጀመሪያ-12ኛ ደረጃ የአማርኛ መምህር ነህ።",
      "ርዕሱን በግልጽ አማርኛ አብራር፤ ቃላትን በፊደል እና በንባብ አቅርብ።",
      "2 ምሳሌ አቅርብ እና የሰዋስው ደንብ ካለ በቀላሉ አብራር።",
      "መጨረሻ አንድ 'አስታውስ' መስመር ጨምር።",
    ].join("\n"),
    eli5: [
      "ለትንሽ ልጅ እንደምትናገር ቀላል አማርኛ ተጠቀም፤ ታሪክ ወይም ዕለታዊ ምሳሌ አብራር።",
      "ከባድ ቃላት አትጠቀም ወይም በቀላሉ ተርጉም።",
      "መጨረሻ በ'⭐' የሚጀምር አስታውስ ጨምር።",
    ].join("\n"),
    verify: [
      "የእውነት ምርመራ አድርግ፤ አጭር መልስ ስጥ: ✅ ትክክል / ❌ ትክክል አይደለም / ⚠️ መረጃ አይበቃም።",
      "2–3 መስመሮች ብቻ እና ገጽ ማመሳከሪያ አካትት።",
    ].join("\n"),
    guided: [
      "የልምምድ ጥያቄ መመሪያ ብቻ ስጥ፤ መጨረሻ መልስ አትስጥ።",
      "መቀመጫ: ምን ይጠይቃል / የተሰጠ / የሚፈለገው / ደንብ(ዎች) / ዕቅድ / ምክር / ተስተካክሎች ስህተት.",
      "ከመጨረሻ: 'እዚህ ቁም — መጨረሻ መልስ በStudy አይሰጥም.' በማለት ጨምር።",
    ].join("\n"),
  },
  ict: {
    explain: [
      "You are a Grade {grade} ICT/Computing teacher.",
      "Explain the system components and their roles in clear sections and short bullets.",
      "Relate to simple computer architecture where relevant (CPU, memory, I/O).",
    ].join("\n"),
    eli5: [
      "Explain with everyday tech analogies (remote → commands, storage → school locker, CPU → brain).",
      "End with a memory line starting with '⭐'.",
    ].join("\n"),
    verify: [
      "Verdict (✅/❌/⚠️) with a nudge to the correct component role from the page; 2–3 lines with page citation.",
    ].join("\n"),
    guided: [
      "Guidance-only for system exercises: What is asked / Components given / Find / Plan / Hints / Common mistake.",
      "End with: 'Stop here — no final answer on Study.'",
    ].join("\n"),
  },
};

const DEFAULTS: Record<ModeKey, string> = {
  explain:
    "You are a precise Grade {grade} {subject} tutor. Produce structured teacher notes with short sentences and bullet points.",
  eli5:
    "Explain like to a young learner using everyday stories and end with a one-line memory tip starting with '⭐'.",
  diagram:
    "Describe the diagram as a compact JSON spec (no prose).",
  verify:
    "Give a short guiding verdict (✅/❌/⚠️) in 2–3 lines with a page citation.",
  guided:
    "Provide guidance only for the exercise (no final answer). Use the specified structure and end with 'Stop here — no final answer on Study.'",
};

// -----------------------
// Helpers & utilities
// -----------------------
function normalizeSubject(s?: string | null): SubjectKey | null {
  if (!s) return null;
  const key = s.trim().toLowerCase();
  if (["math", "mathematics"].includes(key)) return "math";
  if (["physics"].includes(key)) return "physics";
  if (["chemistry", "chem"].includes(key)) return "chemistry";
  if (["biology", "bio"].includes(key)) return "biology";
  if (["geography", "geo"].includes(key)) return "geography";
  if (["civics", "social studies", "social-studies"].includes(key)) return "civics";
  if (["english", "english language"].includes(key)) return "english";
  if (["amharic", "አማርኛ"].includes(key)) return "amharic";
  if (["ict", "computing", "computer science", "information technology", "it"].includes(key)) return "ict";
  return null;
}
function fill(template: string, vars: Record<string, string | number | null | undefined>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
function svgSanitize(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "")
    .replace(/xlink:href="[^"]*"/g, "")
    .replace(/<a[\s\S]*?>|<\/a>/gi, "");
}
function looksLikeExerciseTitle(t?: string): boolean {
  if (!t) return false;
  return /(exercise|example|activity|question|practice|problem|revision|task)/i.test(t.toLowerCase());
}
function redactFinalAnswers(text: string): string {
  let out = text;
  out = out.replace(/^\s*(final answer|answer|result)\s*[:=].*$/gim, "");
  out = out.replace(
    /^(.*?\b(v|x|y|z|a|t|s|d|f|p|n|m|k|q|i|r|u)\b[^=\n]{0,20})=\s*-?\d+(?:\.\d+)?\s*(?:[a-zA-Z/°μΩ%²³⁻]+)?\s*$/gim,
    "$1 = …"
  );
  out = out.replace(/\n{3,}/g, "\n\n");
  if (!/Stop here — no final answer on Study\./.test(out)) {
    out = out.trimEnd() + "\n\n*Stop here — no final answer on Study.*";
  }
  return out;
}

// -----------------------------
// Diagram JSON types & render
// -----------------------------
type DiagramSpecBase = { title: string; desc?: string; type?: string };

type GraphSpec = DiagramSpecBase & {
  type: "graph";
  axes: { x: string; y: string; xUnit?: string; yUnit?: string; xMin?: number; xMax?: number; yMin?: number; yMax?: number; };
  lines: Array<{ points?: [number, number][], label?: string, shape?: "linear" | "parabola" | "curve", color?: string }>;
  annotations?: Array<{ x: number; y: number; text: string }>;
  legend?: string[];
};

type BlockSpec = DiagramSpecBase & {
  type: "block";
  nodes: Array<{ id: string; label: string; role?: "unit" | "part" | "process" }>;
  edges: Array<{ from: string; to: string; label?: string; kind?: "flow" | "bus" | "relation" }>;
};

type ConceptSpec = DiagramSpecBase & {
  type: "concept";
  nodes: Array<{ id: string; label: string }>;
  edges: Array<{ from: string; to: string; label?: string }>;
};

type PartsSpec = DiagramSpecBase & {
  type: "parts";
  figure?: string; // name of organ/object
  parts: Array<{ id: string; label: string }>;
};

type ReactionSpec = DiagramSpecBase & {
  type: "reaction";
  reactants: string[];
  products: string[];
  equation?: string; // e.g., "2H₂ + O₂ → 2H₂O"
};

type MapSpec = DiagramSpecBase & {
  type: "map";
  features: Array<{ label: string }>;
  legend?: string[];
};

type AnySpec = GraphSpec | BlockSpec | ConceptSpec | PartsSpec | ReactionSpec | MapSpec;

// --- JSON extraction ---
function extractJSONSpec(text: string): AnySpec | null {
  // prefer fenced json
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : text.trim();
  try {
    const spec = JSON.parse(raw);
    if (spec && spec.title) return spec as AnySpec;
  } catch { /* ignore */ }
  return null;
}

function esc(s: string) {
  return (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
function wrapLines(text: string, max = 24) {
  const words = (text || "").split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = (cur ? cur + " " : "") + w;
    if (t.length > max) { if (cur) out.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

const VBW = 800, VBH = 500, MARGIN = 40;

function svgShell(inner: string, title: string, desc?: string) {
  const defs = `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
    </marker>
    <style>
      text { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans'; }
      .axis { stroke:#111827; stroke-width:2; }
      .tick { stroke:#6b7280; stroke-width:1; }
      .grid { stroke:#e5e7eb; stroke-width:1; }
      .series { fill:none; stroke-width:2.5; }
      .box { fill:#f3f4f6; stroke:#111827; stroke-width:2; rx:14; }
      .lbl { font-size:14px; fill:#111827; }
      .sub { font-size:12px; fill:#374151; }
      .legend { fill:#f3f4f6; stroke:#111827; stroke-width:2; rx:12; }
    </style>
  </defs>`;
  return svgSanitize(
`<svg width="100%" height="100%" viewBox="0 0 ${VBW} ${VBH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc || "")}</desc>
  ${defs}
  ${inner}
</svg>`);
}

// ---------------- Graph renderer ----------------
function renderGraph(spec: GraphSpec) {
  // Frame
  const left = MARGIN + 70, right = VBW - MARGIN - 20, bottom = VBH - MARGIN - 80, top = MARGIN + 20;
  const w = right - left, h = bottom - top;

  // Axis labels
  const xLabel = esc(spec.axes.x || "x"), yLabel = esc(spec.axes.y || "y");

  // Ranges
  const xMin = spec.axes.xMin ?? 0;
  const xMax = spec.axes.xMax ?? 10;
  const yMin = spec.axes.yMin ?? 0;
  const yMax = spec.axes.yMax ?? 10;

  const sx = (x: number) => left + ((x - xMin) / (xMax - xMin)) * w;
  const sy = (y: number) => bottom - ((y - yMin) / (yMax - yMin)) * h;

  // Grid & ticks (5 steps)
  const ticks = 5;
  const gridLines: string[] = [];
  const tickEls: string[] = [];
  for (let i = 0; i <= ticks; i++) {
    const xi = xMin + (i * (xMax - xMin)) / ticks;
    const yi = yMin + (i * (yMax - yMin)) / ticks;
    const X = sx(xi), Y = sy(yi);
    gridLines.push(`<line class="grid" x1="${left}" y1="${Y}" x2="${right}" y2="${Y}"/>`);
    gridLines.push(`<line class="grid" x1="${X}" y1="${top}" x2="${X}" y2="${bottom}"/>`);
    tickEls.push(`<line class="tick" x1="${X}" y1="${bottom}" x2="${X}" y2="${bottom+6}"/>`);
    tickEls.push(`<text class="sub" x="${X}" y="${bottom+18}" text-anchor="middle">${Math.round(xi*100)/100}</text>`);
    tickEls.push(`<line class="tick" x1="${left-6}" y1="${Y}" x2="${left}" y2="${Y}"/>`);
    tickEls.push(`<text class="sub" x="${left-10}" y="${Y+4}" text-anchor="end">${Math.round(yi*100)/100}</text>`);
  }

  // Axes
  const axes = `
    <line class="axis" x1="${left}" y1="${top}" x2="${left}" y2="${bottom}"/>
    <line class="axis" x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}"/>
    <text class="lbl" x="${(left+right)/2}" y="${bottom+36}" text-anchor="middle">${xLabel}</text>
    <text class="lbl" transform="translate(${left-46}, ${(top+bottom)/2}) rotate(-90)" text-anchor="middle">${yLabel}</text>
  `;

  // Series
  const colors = ["#111827", "#1f2937", "#374151"];
  const seriesEls: string[] = [];
  (spec.lines || []).slice(0,3).forEach((ln, idx) => {
    let d = "";
    if (ln.shape === "linear" && (!ln.points || ln.points.length === 0)) {
      // default linear from origin to (xMax, yMax*0.8)
      d = `M ${sx(xMin)} ${sy(yMin)} L ${sx(xMax)} ${sy(yMax*0.8)}`;
    } else if (ln.shape === "parabola" && (!ln.points || ln.points.length === 0)) {
      // y = k x^2 scaled to box
      const steps = 40;
      const k = (yMax - yMin) / Math.pow((xMax - xMin), 2);
      for (let i=0;i<=steps;i++){
        const x = xMin + (i*(xMax - xMin))/steps;
        const y = Math.min(yMax, yMin + k*Math.pow(x - xMin,2));
        d += (i===0? "M":"L") + ` ${sx(x)} ${sy(y)} `;
      }
    } else if (ln.points && ln.points.length>0) {
      ln.points.forEach((pt, i) => {
        const [x,y] = pt;
        d += (i===0? "M":"L") + ` ${sx(x)} ${sy(y)} `;
      });
    }
    const col = ln.color || colors[idx % colors.length];
    seriesEls.push(`<path class="series" d="${d.trim()}" stroke="${col}" />`);
    if (ln.label) {
      seriesEls.push(`<text class="sub" x="${right-6}" y="${top+16+18*idx}" text-anchor="end">${esc(ln.label)}</text>`);
    }
  });

  // Annotations
  const notes = (spec.annotations || []).map(a =>
    `<text class="sub" x="${sx(a.x)}" y="${sy(a.y) - 8}" text-anchor="middle">${esc(a.text)}</text>`
  ).join("");

  // Legend
  const leg = spec.legend && spec.legend.length ? spec.legend : ["Axes show units", "Line shows relation"];
  const legend = `
    <g transform="translate(${VBW - MARGIN - 200}, ${VBH - MARGIN - 110})">
      <rect class="legend" width="200" height="110" rx="12" ry="12"></rect>
      <text class="lbl" x="12" y="20">Legend</text>
      ${leg.slice(0,3).map((l, i)=> `<text class="sub" x="12" y="${44 + i*18}">• ${esc(l)}</text>`).join("")}
    </g>`;

  const inner = `
    ${gridLines.join("")}
    ${axes}
    ${tickEls.join("")}
    ${seriesEls.join("")}
    ${notes}
    ${legend}
  `;
  return svgShell(inner, spec.title, spec.desc);
}

// --------------- Block / Concept ---------------
function wrapTspans(text: string, max = 22) {
  return wrapLines(text, max).map((ln,i)=>`<tspan x="12" dy="${i===0?0:16}">${esc(ln)}</tspan>`).join("");
}
function renderBlockOrConcept(spec: BlockSpec | ConceptSpec, subject: SubjectKey | null) {
  const nodes = (spec as any).nodes as { id:string; label:string }[];
  const edges = (spec as any).edges as { from:string; to:string; label?:string; kind?:string }[];
  const W=220,H=72,xL=120,xR=460, yStart=120,yStep=100;
  const pos: Record<string,{x:number,y:number}> = {};
  const half = Math.ceil(nodes.length/2);
  nodes.forEach((n,i)=>{
    const col = i<half?0:1; const row = i<half?i:i-half;
    pos[n.id] = { x: (col===0?xL:xR), y: yStart + row*yStep };
  });

  const nodeEls = nodes.map(n=>{
    const p = pos[n.id]; const tsp = wrapTspans(n.label);
    return `<g transform="translate(${p.x},${p.y})">
      <rect class="box" width="${W}" height="${H}" rx="14" ry="14"></rect>
      <text class="lbl" x="12" y="18">${tsp}</text>
    </g>`;
  }).join("");

  function center(id:string){ const p = pos[id] || {x:MARGIN,y:MARGIN}; return {cx: p.x+W/2, cy: p.y+H/2}; }
  const edgeEls = edges.map(e=>{
    const a=center(e.from), b=center(e.to); const midX=(a.cx+b.cx)/2;
    const path = `M ${a.cx} ${a.cy} L ${midX} ${a.cy} L ${midX} ${b.cy} L ${b.cx} ${b.cy}`;
    const lab = esc(e.label || (e.kind==="bus"?"Bus":e.kind==="flow"?"Flow":"Relation"));
    const lx=midX, ly=Math.min(a.cy,b.cy)-10;
    return `<path d="${path}" class="series" stroke="#111827" fill="none" marker-end="url(#arrow)"></path>
            <text class="sub" x="${lx}" y="${ly}" text-anchor="middle">${lab}</text>`;
  }).join("");

  const legend = `
    <g transform="translate(${VBW - MARGIN - 200}, ${VBH - MARGIN - 110})">
      <rect class="legend" width="200" height="110" rx="12" ry="12"></rect>
      <text class="lbl" x="12" y="20">Legend</text>
      <text class="sub" x="12" y="44">• Rectangles: Units/Parts</text>
      <text class="sub" x="12" y="62">• Lines: Flow/Relations</text>
      <text class="sub" x="12" y="80">• Arrow: Direction</text>
    </g>`;

  return svgShell(`${edgeEls}${nodeEls}${legend}`, spec.title, spec.desc);
}

// ----------------- Parts (labels) ----------------
function renderParts(spec: PartsSpec) {
  // Simple figure box left, labels right with leader lines
  const figX = MARGIN + 60, figY = MARGIN + 60, figW = 260, figH = 320;
  const labelsX = figX + figW + 60, labelsY = figY + 16, gap = 26;

  const figure = `<rect x="${figX}" y="${figY}" width="${figW}" height="${figH}" class="box"></rect>
                  <text class="lbl" x="${figX+12}" y="${figY+22}">${esc(spec.figure || "Figure")}</text>`;

  const items = spec.parts.slice(0,8).map((p,i)=>{
    const y = labelsY + i*gap;
    const fromX = figX + figW; const fromY = figY + 24 + (i+1)*(figH-40)/(spec.parts.length+1);
    return `<line x1="${fromX}" y1="${fromY}" x2="${labelsX-8}" y2="${y-4}" class="series" stroke="#111827" />
            <text class="lbl" x="${labelsX}" y="${y}" dominant-baseline="hanging">${esc(p.label)}</text>`;
  }).join("");

  const legend = `
    <g transform="translate(${VBW - MARGIN - 200}, ${VBH - MARGIN - 110})">
      <rect class="legend" width="200" height="110" rx="12" ry="12"></rect>
      <text class="lbl" x="12" y="20">Legend</text>
      <text class="sub" x="12" y="44">• Box: Whole figure</text>
      <text class="sub" x="12" y="62">• Lines: Pointers</text>
      <text class="sub" x="12" y="80">• Text: Part names</text>
    </g>`;
  return svgShell(`${figure}${items}${legend}`, spec.title, spec.desc);
}

// ---------------- Reaction (Chem) ----------------
function renderReaction(spec: ReactionSpec) {
  const leftX = MARGIN + 60, rightX = VBW - MARGIN - 260, y = VBH/2 - 40;
  const box = (x:number, text:string)=>`
    <g transform="translate(${x},${y})">
      <rect class="box" width="220" height="80" rx="14" ry="14"></rect>
      <text class="lbl" x="12" y="20">${wrapLines(text, 20).map((t,i)=>`<tspan x="12" dy="${i===0?0:16}">${esc(t)}</tspan>`).join("")}</text>
    </g>`;
  const react = box(leftX, (spec.reactants || []).join(" + ") || "Reactants");
  const prod = box(rightX, (spec.products || []).join(" + ") || "Products");
  const arrow = `<path d="M ${leftX+220} ${y+40} L ${rightX} ${y+40}" class="series" stroke="#111827" fill="none" marker-end="url(#arrow)"></path>`;
  const eqn = spec.equation ? `<text class="lbl" x="${(leftX+rightX+220)/2}" y="${y+16}" text-anchor="middle">${esc(spec.equation)}</text>` : "";
  const legend = `
    <g transform="translate(${VBW - MARGIN - 200}, ${VBH - MARGIN - 110})">
      <rect class="legend" width="200" height="110" rx="12" ry="12"></rect>
      <text class="lbl" x="12" y="20">Legend</text>
      <text class="sub" x="12" y="44">• Left: Reactants</text>
      <text class="sub" x="12" y="62">• Right: Products</text>
      <text class="sub" x="12" y="80">• Arrow: Reaction</text>
    </g>`;
  return svgShell(`${eqn}${react}${prod}${arrow}${legend}`, spec.title, spec.desc);
}

// ---------------- Map (schematic) ----------------
function renderMap(spec: MapSpec) {
  const frameX=MARGIN+40, frameY=MARGIN+40, frameW=VBW-2*(MARGIN+40), frameH=VBH-2*(MARGIN+40);
  const frame = `<rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" fill="none" stroke="#111827" stroke-width="2"/>`;
  const north = `<path d="M ${VBW-MARGIN-60} ${MARGIN+60} l 10 -20 l 10 20 z" fill="#111827"/><text class="sub" x="${VBW-MARGIN-50}" y="${MARGIN+88}" text-anchor="middle">N</text>`;
  const scale = `<line x1="${VBW-MARGIN-200}" y1="${VBH-MARGIN-60}" x2="${VBW-MARGIN-120}" y2="${VBH-MARGIN-60}" stroke="#111827" stroke-width="2"/>
                 <text class="sub" x="${VBW-MARGIN-160}" y="${VBH-MARGIN-68}" text-anchor="middle">Scale</text>`;
  const labels = (spec.features||[]).slice(0,6).map((f,i)=>{
    const x = frameX + 30 + (i%3)*((frameW-60)/2);
    const y = frameY + 30 + Math.floor(i/3)*((frameH-60)/2);
    return `<text class="lbl" x="${x}" y="${y}">${esc(f.label)}</text>`;
  }).join("");
  const legend = `
    <g transform="translate(${VBW - MARGIN - 200}, ${VBH - MARGIN - 110})">
      <rect class="legend" width="200" height="110" rx="12" ry="12"></rect>
      <text class="lbl" x="12" y="20">Legend</text>
      <text class="sub" x="12" y="44">• Frame: Map area</text>
      <text class="sub" x="12" y="62">• N: North</text>
      <text class="sub" x="12" y="80">• Lines/text: Features</text>
    </g>`;
  return svgShell(`${frame}${north}${scale}${labels}${legend}`, spec.title, spec.desc);
}

// ---------------- Renderer entry ----------------
function renderSVGFromSpec(subject: SubjectKey | null, spec: AnySpec) {
  if (spec.type === "graph") return renderGraph(spec as GraphSpec);
  if (spec.type === "block" || spec.type === "concept") return renderBlockOrConcept(spec as any, subject);
  if (spec.type === "parts") return renderParts(spec as PartsSpec);
  if (spec.type === "reaction") return renderReaction(spec as ReactionSpec);
  if (spec.type === "map") return renderMap(spec as MapSpec);
  // Fallback: treat as simple block/concept
  const fallback: BlockSpec = {
    type: "block",
    title: spec.title,
    desc: spec.desc,
    nodes: [{id:"a",label:"Topic A"},{id:"b",label:"Topic B"}],
    edges: [{from:"a",to:"b",label:"Relation"}],
  };
  return renderBlockOrConcept(fallback, subject);
}

// -------------------------
// Groq call helper (hardened with model fallbacks)
// -------------------------
async function callGroq(messages: ChatMsg[], temperature: number, maxTokens: number) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, error: "Server is missing GROQ_API_KEY.", data: null as any };

  // Prefer env-provided model, otherwise a CURRENT default, then safe fallbacks.
  const primary =
    (process.env.GROQ_CHAT_MODEL || process.env.GROQ_MODEL || "").trim() ||
    "llama-3.3-70b-versatile";

  // Order matters. We'll try these in sequence if the first fails due to deprecation/unsupported.
  const candidates = Array.from(
    new Set([
      primary,
      "llama-3.3-70b-versatile",
      "llama-3.2-11b-text-preview",
    ])
  );

  const baseUrl = "https://api.groq.com/openai/v1/chat/completions";

  let lastErr: any = null;

  for (const model of candidates) {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    });

    let data: any = null;
    try { data = await resp.json(); } catch { /* ignore parse error */ }

    if (resp.ok) {
      return { ok: true, error: null, data };
    }

    // Inspect error; continue to next model if this one is decommissioned/unsupported.
    const msg = (typeof data?.error?.message === "string" ? data.error.message : JSON.stringify(data || {})).toLowerCase();
    const status = resp.status;
    const decom =
      msg.includes("decommission") ||
      msg.includes("no longer supported") ||
      msg.includes("unknown model") ||
      status === 400 || status === 410;

    lastErr = `Groq error (${model}): ${resp.status} ${typeof data?.error?.message === "string" ? data.error.message : JSON.stringify(data)}`;

    if (decom) {
      // try next candidate
      continue;
    } else {
      // Non-deprecation error: bail immediately with this error
      return { ok: false, error: lastErr, data };
    }
  }

  return {
    ok: false,
    error: lastErr || "All Groq models failed.",
    data: null as any,
  };
}

// -------------------------------------------------
// Main entry
// -------------------------------------------------
export async function chatWithProvider(args: ProviderArgs): Promise<ProviderResult> {
  const { mode, subject = null, grade = null, question, messages = [], context } = args;

  // Require textbook grounding
  const hasGrounding = !!(context && Array.isArray(context.snippets) && context.snippets.length > 0);
  if (!hasGrounding) {
    return {
      content: "⚠️ Textbook reference not loaded.\n\nPlease reload the textbook page or pick a page number again.",
      citations: [],
      svg: null,
    };
  }

  const subjectKey = normalizeSubject(subject) ?? null;
  const modeKey: ModeKey = (mode === "diagram" || mode === "graph" || mode === "map") ? "diagram" : (mode as ModeKey);

  // Auto-upgrade to guided on exercises
  const exerciseDetected = (context?.snippets || []).some((s) => looksLikeExerciseTitle(s.title));
  const effectiveMode: ModeKey = (modeKey === "explain" && exerciseDetected) ? "guided" : modeKey;

  const subjectAddon = (subjectKey && SUBJECT_PROMPTS[subjectKey]?.[effectiveMode]) || DEFAULTS[effectiveMode];

  const globalPrefix = [
    "You are a precise Ethiopian Grade {grade} {subject} tutor.",
    "Ground your answer strictly in the provided textbook snippets (by page).",
    "Never invent textbook quotes or page numbers.",
    "Use short, clear sentences and structured lists.",
  ].join("\n");

  const system: ChatMsg = { role: "system", content: fill([globalPrefix, subjectAddon].join("\n\n"), { grade, subject }) };

  const groundingMsgs: ChatMsg[] = (context?.snippets || []).slice(0, 3).map((s, i) => ({
    role: "system" as const,
    content: [`Context ${i + 1} — book:${s.bookId} page:${s.page}${s.title ? ` — ${s.title}` : ""}`, (s.excerpt || "").slice(0, 800)].join("\n"),
  }));

  const history: ChatMsg[] = Array.isArray(messages)
    ? (messages as any[]).filter((m) => m && m.role && typeof m.content === "string").map((m) => ({ role: m.role, content: m.content }))
    : [];

  const lastUser: ChatMsg = { role: "user", content: question || "" };

  // ---------- DIAGRAM: ask for DIAGRAM SPEC JSON ----------
  if (effectiveMode === "diagram") {
    // Subject-smart hinting for the spec type
    const subjectHint =
      subjectKey === "physics" ? "If motion variables (distance, time, velocity, acceleration) appear, return a type:'graph' spec with axes and one or more lines (linear/parabola) and an annotation like 'Gradient = Acceleration'." :
      subjectKey === "math" ? "For functions (linear/quadratic), type:'graph' with axes and a line or curve. For shapes/relations, type:'concept' or 'block'." :
      subjectKey === "chemistry" ? "For reactions, type:'reaction' with reactants/products and 'equation'." :
      subjectKey === "biology" ? "For anatomy or structure, type:'parts' with part labels." :
      subjectKey === "geography" ? "For locations/processes, type:'map' with a few labeled features or 'concept'." :
      subjectKey === "ict" ? "For architecture, type:'block' with nodes (units) and edges (buses/flows)." :
      "Pick a type that best teaches the snippet content.";

    const diagramInstruction: ChatMsg = {
      role: "system",
      content: [
        "DIAGRAM SPEC MODE:",
        "Return a compact JSON only (no prose, no code fences). Choose one of these shapes:",
        "- type:'graph' with: title, desc, axes:{x,y,xMin?,xMax?,yMin?,yMax?}, lines:[{points?:[[x,y]...], label?, shape?}], annotations?, legend?",
        "- type:'block' with: title, desc, nodes:[{id,label}], edges:[{from,to,label?,kind?}]",
        "- type:'concept' with: title, desc, nodes:[{id,label}], edges:[{from,to,label?}]",
        "- type:'parts' with: title, desc, figure?, parts:[{id,label}]",
        "- type:'reaction' with: title, desc, reactants:[...], products:[...], equation?",
        "- type:'map' with: title, desc, features:[{label}], legend?",
        "IDs must be short (a–z,0–9,_). Keep to 3–6 nodes or 1–3 lines.",
        subjectHint,
      ].join("\n"),
    };

    const msgs = [system, diagramInstruction, ...groundingMsgs, ...history, lastUser];
    const call = await callGroq(msgs, 0.12, 750);
    if (!call.ok) return { content: call.error || "AI call failed.", citations: context?.citations || [], svg: null };

    const raw = String(call.data?.choices?.[0]?.message?.content ?? "");
    let spec = extractJSONSpec(raw);

    // Physics auto-default if missing useful spec and context includes motion variables
    if (!spec && subjectKey === "physics") {
      const ctxTxt = (context?.snippets || []).map(s=> (s.excerpt||"").toLowerCase()).join(" ");
      const motion = /(velocity|speed|distance|displacement|time|acceleration)/i.test(ctxTxt);
      if (motion) {
        spec = {
          type: "graph",
          title: "Velocity–Time Graph (Uniform Acceleration)",
          desc: "Straight line showing velocity increasing equally per second",
          axes: { x: "Time (s)", y: "Velocity (m/s)", xMin: 0, xMax: 10, yMin: 0, yMax: 20 },
          lines: [{ shape: "linear", label: "v = u + at" }],
          annotations: [{ x: 6, y: 12, text: "Gradient = Acceleration" }],
          legend: ["Line slope shows a", "Intercept is u"],
        } as GraphSpec;
      }
    }

    if (!spec) return { content: "I couldn’t generate an answer right now.", citations: context?.citations || [], svg: null };

    const svg = renderSVGFromSpec(subjectKey, spec as AnySpec);
    return { content: "", citations: context?.citations || [], svg };
  }

  // ---------- TEXT MODES ----------
  const verifyOrGuidedTail =
    effectiveMode === "verify"
      ? [
          "Give a short verdict in a gentle teacher tone:",
          "Use one of: ✅ Correct / ❌ Not correct / ⚠️ Not enough info.",
          "If not correct, nudge the student to the correct relation and invite a re-check.",
          "Keep it to 2–3 lines and include a page citation like (p. X).",
        ].join("\n")
      : effectiveMode === "guided"
      ? [
          "This is Study page guidance for an exercise. Do NOT give final numeric or multiple-choice answers.",
          "Follow the structure exactly and end with 'Stop here — no final answer on Study.'",
        ].join("\n")
      : "";

  const maybeTail: ChatMsg[] = verifyOrGuidedTail ? [{ role: "system", content: verifyOrGuidedTail }] : [];
  const finalMessages: ChatMsg[] = [system, ...maybeTail, ...groundingMsgs, ...history, lastUser];

  const chat = await callGroq(finalMessages, 0.2, 900);
  if (!chat.ok) return { content: chat.error || "AI call failed.", citations: context?.citations || [], svg: null };

  let content: string = chat.data?.choices?.[0]?.message?.content ?? "I couldn’t generate an answer right now.";
  if (effectiveMode === "guided") content = redactFinalAnswers(content);

  return { content, citations: context?.citations || [], svg: null };
}
