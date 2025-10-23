// src/app/api/homework/guide/route.ts
import { NextResponse } from "next/server";
import { chatWithProvider } from "@/lib/ai/provider";

type Body = {
  subject: string;
  grade: number;
  exerciseText?: string | null;
};

export async function POST(req: Request) {
  try {
    const { subject, grade, exerciseText } = (await req.json()) as Body;

    if (!subject || !Number.isFinite(grade)) {
      return NextResponse.json({ error: "Missing subject or grade." }, { status: 400 });
    }

    const pasted = (exerciseText || "").trim();
    if (!pasted) {
      return NextResponse.json(
        {
          content:
            "Please paste the **exact exercise text** (or teacher’s prompt). I’ll guide you step-by-step without giving the final answer.",
          citations: [],
        },
        { status: 200 }
      );
    }

    // Grade/subject aware settings
    const ageBand = approxAgeFromGrade(grade);     // e.g., "14–15"
    const reading = readingBandFromGrade(grade);   // e.g., "simple and clear"
    const scaffold = subjectScaffold(subject);     // subject-specific coaching
    const template = tutorTemplate();              // STRICT output shape

    const system = [
      "You are a kind school tutor for Ethiopian students.",
      "Hard rules:",
      "- Use short, simple sentences. Avoid jargon.",
      "- Keep answers chunked with clear headings and spacing.",
      "- Use tasteful emojis to guide attention (📘 💡 ✏️ ✅ 🚫 ⏸️).",
      "- Teach the method. Do NOT give the final numeric result or a finished essay.",
      "- If the student’s text is ambiguous, choose the safest, most common interpretation and say what you assumed.",
    ].join("\n");

    // Drive the model to produce the exact layout we want.
    const user = [
      `Subject: ${subject}`,
      `Grade: ${grade} (about ${ageBand} years old)`,
      `Target reading style: ${reading}`,
      "",
      "Subject-specific coaching to apply:",
      scaffold,
      "",
      "Exact exercise text (treat this as the only source):",
      "```",
      safeCut(pasted, 3200),
      "```",
      "",
      "Produce a **student-friendly guide** using the STRICT OUTPUT FORMAT below.",
      "",
      "STRICT OUTPUT FORMAT (use EXACT headings, spacing, bullets, and emojis; keep each bullet to 1 line):",
      template,
      "",
      "Extra rules:",
      "- Never reveal the final numeric answer or a full essay.",
      "- Keep bullets short (max ~12 words).",
      "- Add a blank line between sections to create breathing room.",
    ].join("\n");

    const ai = await chatWithProvider({
      mode: "steps",
      subject,
      grade,
      question: user,
      context: { citations: [], snippets: [] }, // no DB fetch here
      system,
      temperature: 0.1,
    });

    return NextResponse.json(
      {
        content:
          ai?.content ??
          "📘 Let’s restate the task, list key ideas, make a short plan, and go step-by-step (without the final answer).",
        citations: [],
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Guide failed." }, { status: 500 });
  }
}

/* ---------------- helpers ---------------- */

function safeCut(t: string, n: number) {
  return (t || "").slice(0, n);
}

function approxAgeFromGrade(grade: number) {
  // Rough & friendly; sets tone only
  const base = 6 + grade; // G1≈7, G9≈15
  return `${Math.max(7, base - 1)}–${Math.max(8, base)}`;
}

function readingBandFromGrade(grade: number) {
  if (grade <= 4) return "very simple (tiny steps, short words)";
  if (grade <= 6) return "simple and clear (short sentences)";
  if (grade <= 8) return "clear and friendly (no jargon)";
  if (grade <= 10) return "clear and concise";
  return "concise with minimal jargon";
}

function subjectScaffold(subjRaw: string) {
  const s = subjRaw.toLowerCase();
  if (s.includes("math")) {
    return [
      "- Name givens & unknowns.",
      "- Write the formula and define symbols.",
      "- Check units; convert if needed.",
      "- Substitute step by step; stop before the final number.",
    ].join("\n");
  }
  if (s.includes("physics")) {
    return [
      "- List known values with units.",
      "- Pick one law/formula that fits.",
      "- Check units and direction if vectors.",
      "- Substitute carefully; stop before the final result.",
    ].join("\n");
  }
  if (s.includes("chem")) {
    return [
      "- Identify type: balancing, stoichiometry, properties.",
      "- Balance the equation if needed.",
      "- Track mole ratios/units.",
      "- Compute setup but stop before the last number.",
    ].join("\n");
  }
  if (s.includes("bio")) {
    return [
      "- Define key terms in simple words.",
      "- Break the process into small stages.",
      "- Use an everyday comparison.",
      "- Ask student to label or list parts.",
    ].join("\n");
  }
  if (s.includes("econ")) {
    return [
      "- Define terms simply (e.g., positive vs normative).",
      "- Give short, real-life examples.",
      "- Use compare/contrast bullets.",
      "- Ask student to sort sample statements.",
    ].join("\n");
  }
  if (s.includes("history")) {
    return [
      "- Use 5Ws (who, what, when, where, why).",
      "- Put events in time order.",
      "- Link cause → event → effect.",
      "- Student writes a 2–3 sentence summary.",
    ].join("\n");
  }
  if (s.includes("civics")) {
    return [
      "- Define the idea (right, duty, law).",
      "- Give a local example.",
      "- Show quick do vs don’t list.",
      "- Student adds one school/community example.",
    ].join("\n");
  }
  if (s.includes("geograph")) {
    return [
      "- Name place/feature/scale.",
      "- Describe pattern or trend in 1 line.",
      "- Use cause → effect for processes.",
      "- Read title/axes/units if data exists.",
    ].join("\n");
  }
  if (s.includes("english")) {
    return [
      "- Say the task type (reading, writing, grammar).",
      "- Give a sentence frame or pattern.",
      "- Provide 2 tiny examples.",
      "- Student completes one using the frame.",
    ].join("\n");
  }
  return [
    "- Restate the task simply.",
    "- List 3–5 key ideas.",
    "- Short plan, then small steps.",
    "- Add mini checkpoints; no final answer.",
  ].join("\n");
}

/** Returns a strict, compact, emoji-led template with spacing and line limits. */
function tutorTemplate() {
  return [
    "📘 **What is being asked?**",
    "- 1–3 short lines, in simple words.",
    "",
    "💡 **Key ideas you need**",
    "- • idea 1 (≤ 12 words)",
    "- • idea 2 (≤ 12 words)",
    "- • idea 3 (≤ 12 words)",
    "- • idea 4 (optional)",
    "",
    "🗺️ **Plan**",
    "1) step name (≤ 6 words)",
    "2) step name (≤ 6 words)",
    "3) step name (≤ 6 words)",
    "4) step name (optional)",
    "",
    "✏️ **Step-by-step help**",
    "- Step 1: one clear action.",
    "- Explain in one short line.",
    "",
    "⏸️ **Check yourself**",
    "- Yes/No or 1-line question.",
    "",
    "- Step 2: one clear action.",
    "- Explain in one short line.",
    "",
    "⏸️ **Check yourself**",
    "- Yes/No or 1-line question.",
    "",
    "🚫 **Common mistakes**",
    "- • mistake 1 (≤ 10 words)",
    "- • mistake 2 (≤ 10 words)",
    "- • mistake 3 (optional)",
    "",
    "✅ **Your turn**",
    "- One clear instruction for what to write/calc next.",
  ].join("\n");
}
