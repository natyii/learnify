// src/lib/quiz/generateFromPages.ts

// Grounding page from DB
type GroundPage = {
  id: number;
  page_number: number;
  text_content: string | null;
};

type Difficulty = "easy" | "medium" | "hard";

type GenArgs = {
  grade: number;
  subject: string;
  difficulty: Difficulty;
  count: number;
  pages: GroundPage[];
  openai: any;      // Groq/OpenAI compatible client
  model: string;
  languageHint: "am" | "auto" | string;
};

type GenItem = {
  question: string;
  options: string[];
  correct_index: number;
  source_page_id?: number;
};

// ---- helpers ----
const isLettersOnly = (s: string) => /^[A-D]\.?$/.test(String(s || "").trim());
const normalize = (s: any) => String(s ?? "").trim();
const approxTokens = (s: string) => Math.ceil((s || "").length / 4);

// Detect Groq-ish models from model name (no need to import getProvider)
const isGroqModel = (model: string) => {
  const m = (model || "").toLowerCase();
  // Groq commonly serves llama, mixtral, gemma families
  return m.includes("llama") || m.includes("mixtral") || m.includes("gemma") || m.includes("groq");
};

export async function generateMCQsFromPages({
  grade,
  subject,
  difficulty,
  count,
  pages,
  openai,
  model,
  languageHint,
}: GenArgs): Promise<GenItem[]> {
  // keep only pages with text and cap context pages
  const chunks = (pages || [])
    .filter((p) => (p.text_content || "").trim().length > 0)
    .slice(0, 20);

  if (chunks.length === 0) return [];

  // Build raw context
  let context = chunks
    .map((p) => `# Page ${p.page_number}\n${(p.text_content || "").trim()}`)
    .join("\n\n");

  // Token budget to avoid 413 and big outputs
  const INPUT_BUDGET = 1800; // ~7.2k chars
  if (approxTokens(context) > INPUT_BUDGET) {
    context = context.slice(0, INPUT_BUDGET * 4);
  }

  const contextTok = approxTokens(context);
  const effectiveCount =
    contextTok > 1500 ? Math.min(count, 5) : contextTok > 1000 ? Math.min(count, 7) : count;

  // Language discipline + strict JSON shape
  const system = [
    `You are a professional ${subject} teacher for grade ${grade}.`,
    `Write ${effectiveCount} multiple-choice questions grounded ONLY in the excerpt.`,
    `Level: ${difficulty}.`,
    `${
      languageHint === "am"
        ? "Respond strictly in Amharic (Geʽez/Ethiopic script). Do not transliterate or translate."
        : "Detect the excerpt language and respond strictly in that language."
    }`,
    `Return STRICT JSON ONLY with schema:
{
  "items": [
    {
      "question": "string",
      "options": ["string","string","string","string"],
      "correct_index": 0,
      "source_page": <number from the excerpt>
    }
  ]
}
Rules:
- Exactly 4 options.
- Each option is 1–8 words of meaningful content (no single letters, no 'A/B/C/D', no numbering or punctuation labels).
- Do NOT wrap in code fences.
- No explanations or analysis outside JSON.`,
  ].join(" ");

  const user = [
    `TEXTBOOK EXCERPT (Grade ${grade}, Subject: ${subject})`,
    `-----------------------------------------------`,
    context,
  ].join("\n");

  const temperature = difficulty === "easy" ? 0.18 : difficulty === "medium" ? 0.28 : 0.4;
  const groq = isGroqModel(model);

  const mkPayload = (sys: string) => {
    const base: any = {
      model,
      temperature,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    };
    if (groq) {
      // Groq: avoid strict JSON mode; cap tokens; add stops to discourage fences
      base.max_tokens = 600;
      base.stop = ["```", "\n\n\n"];
    } else {
      // OpenAI: native JSON mode is reliable
      base.response_format = { type: "json_object" } as any;
      base.max_tokens = 700;
    }
    return base;
  };

  const callOnce = async (sys: string) => {
    const resp = await openai.chat.completions.create(mkPayload(sys));
    let txt = (resp?.choices?.[0]?.message?.content || "").trim();
    // Strip accidental code fences
    txt = txt.replace(/```[a-z]*\n?|```/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(txt);
    } catch {
      const m = txt.match(/\{[\s\S]*\}$/);
      if (!m) return [];
      try {
        parsed = JSON.parse(m[0]);
      } catch {
        return [];
      }
    }

    const items: GenItem[] = Array.isArray(parsed?.items)
      ? parsed.items.map((it: any) => ({
          question: normalize(it?.question),
          options: Array.isArray(it?.options) ? it.options.map((o: any) => normalize(o)) : [],
          correct_index: Number(it?.correct_index ?? -1),
          source_page_id: Number(it?.source_page ?? chunks[0]?.id ?? undefined),
        }))
      : [];

    // Filter invalid / letters-only options
    return items.filter(
      (it) =>
        it.question &&
        Array.isArray(it.options) &&
        it.options.length === 4 &&
        it.options.every((o) => o && !isLettersOnly(o)) &&
        Number.isInteger(it.correct_index) &&
        it.correct_index >= 0 &&
        it.correct_index < 4
    );
  };

  // Pass 1
  let items = await callOnce(system);
  if (items.length >= Math.min(3, effectiveCount)) return items.slice(0, effectiveCount);

  // Strict retry (smaller count, tighter constraint)
  const strict = system + `\nReturn exactly ${Math.max(3, Math.min(5, effectiveCount))} items.`;
  items = await callOnce(strict);
  return items.slice(0, effectiveCount);
}
