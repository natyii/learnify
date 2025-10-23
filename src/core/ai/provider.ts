// src/core/ai/provider.ts
import { OPENAI_MODEL, GROQ_MODEL, OPENAI_CAP } from "./models";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ProviderName = "openai" | "groq";

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const PREF = (process.env.PROVIDER_PREF || "").toLowerCase() as ProviderName | "";

export function getProviderHeaders(p: ProviderName) {
  if (p === "openai") {
    if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
    return { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" };
  }
  if (!GROQ_KEY) throw new Error("Missing GROQ_API_KEY");
  return { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" };
}

export function getProviderEndpoint(p: ProviderName) {
  return p === "openai"
    ? "https://api.openai.com/v1/chat/completions"
    : "https://api.groq.com/openai/v1/chat/completions";
}

export function getProviderModel(p: ProviderName) {
  return p === "openai" ? OPENAI_MODEL : GROQ_MODEL;
}

/** Decide provider given today's OpenAI usage count (per-browser cookie). */
export function decideProvider(openaiRequestsToday: number): ProviderName {
  const hasOpenAI = !!OPENAI_KEY;
  const hasGroq = !!GROQ_KEY;

  if (PREF === "groq" && hasGroq) return "groq";

  if (PREF === "openai" && hasOpenAI) {
    if (openaiRequestsToday < OPENAI_CAP) return "openai";
    if (hasGroq) return "groq";
    return "openai";
  }

  if (hasOpenAI && openaiRequestsToday < OPENAI_CAP) return "openai";
  if (hasGroq) return "groq";
  if (hasOpenAI) return "openai";

  // Neither key exists – default to groq so the error is clear
  return "groq";
}
