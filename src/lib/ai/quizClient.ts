// src/lib/ai/quizClient.ts
// Single place to configure which LLM the quiz generator uses.

import Groq from "groq-sdk";
import OpenAI from "openai";

type Provider = "groq" | "openai";

function getProvider(): Provider {
  const p = (process.env.QUIZ_AI_PROVIDER || "").toLowerCase();
  if (p === "openai") return "openai";
  return "groq";
}

/**
 * Returns a client that ALWAYS has shape: client.chat.completions.create(...)
 * so generateFromPages can call it without branching.
 */
export function getQuizAI() {
  const provider = getProvider();

  if (provider === "groq") {
    const key = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is missing for quiz generation.");
    const client = new Groq({ apiKey: key });
    return client; // has chat.completions.create
  }

  // OpenAI
  const okey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!okey) throw new Error("OPENAI_API_KEY is missing for quiz generation.");
  const client = new OpenAI({ apiKey: okey });
  return client; // has chat.completions.create
}

/**
 * Returns a valid model name for the chosen provider.
 * You can override via env if you want.
 */
export function getQuizModel(): string {
  const provider = getProvider();

  if (provider === "groq") {
    // Pick env first, else safe default that exists
    return process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant";
  }

  // OpenAI
  return process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
}
