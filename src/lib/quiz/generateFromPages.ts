// src/lib/quiz/generateFromPages.ts
// Calls the LLM to produce MCQs grounded in provided textbook pages.

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
  openai: any;   // Groq or OpenAI client (both have chat.completions.create)
  model: string; // picked by getQuizModel()
};

type GenItem = {
  question: string;
  options: string[];
  correct_index: number;
  source_page_id?: number;
};

export async function generateMCQsFromPages({
  grade,
  subject,
  difficulty,
  count,
  pages,
  openai,
  model,
}: GenArgs): Promise<GenItem[]> {
  // Guard: need some text to ground
  const chunks = pages
    .filter(p => (p.text_content || "").trim().length > 0)
    .slice(0, 20); // cap context

  if (chunks.length === 0) return [];

  const context = chunks
    .map(p => `# Page ${p.page_number}\n${(p.text_content || "").trim()}`)
    .join("\n\n");

  // Ask for strict JSON
  const system = [
    `You are a professional ${subject} teacher for grade ${grade}.`,
    `Write ${count} multiple-choice questions grounded ONLY in the provided textbook excerpt.`,
    `Level: ${difficulty}.`,
    `Each item must be factual, unambiguous, and based on the text.`,
    `Return JSON with schema:
{
  "items": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "correct_index": 0,
      "source_page": <number from the excerpt you used>
    }
  ]
}`,
    `Do NOT include any commentary outside JSON.`,
  ].join(" ");

  const user = [
    `TEXTBOOK EXCERPT (Grade ${grade}, Subject: ${subject})`,
    `-----------------------------------------------`,
    context,
  ].join("\n");

  // Some providers support response_format; if not, still ask for JSON
  const temperature = difficulty === "easy" ? 0.2 : difficulty === "medium" ? 0.35 : 0.5;

  let resp;
  try {
    resp = await openai.chat.completions.create({
      model,
      temperature,
      // If supported (OpenAI & Groq both accept today):
      response_format: { type: "json_object" } as any,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
  } catch (e: any) {
    // Let caller fall back to placeholders
    const msg = typeof e?.message === "string" ? e.message : String(e);
    throw new Error(`LLM call failed: ${msg}`);
  }

  const content =
    resp?.choices?.[0]?.message?.content ||
    resp?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ||
    "";

  let json: any;
  try {
    json = JSON.parse(content);
  } catch {
    // Try best-effort JSON extraction
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return [];
    try {
      json = JSON.parse(match[0]);
    } catch {
      return [];
    }
  }

  const items: GenItem[] = Array.isArray(json?.items)
    ? json.items.slice(0, count).map((it: any) => ({
        question: String(it.question || "").trim(),
        options: Array.isArray(it.options) ? it.options.map((o: any) => String(o)) : [],
        correct_index: Number(it.correct_index ?? 0),
        source_page_id:
          typeof it.source_page === "number"
            ? (pages.find(p => p.page_number === it.source_page)?.id ?? undefined)
            : undefined,
      }))
    : [];

  // Filter any malformed items
  return items.filter(
    it =>
      it.question &&
      Array.isArray(it.options) &&
      it.options.length >= 4 &&
      Number.isInteger(it.correct_index) &&
      it.correct_index >= 0 &&
      it.correct_index < it.options.length
  );
}
