import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

type ChatArgs = {
  system: string;
  input: string;
  model?: string;
  maxOutputTokens?: number;
};

export async function aiChat({
  system,
  input,
  model = "llama-3.1-70b-versatile",
  maxOutputTokens = 800,
}: ChatArgs) {
  const res = await client.responses.create({
    model,
    input,
    system,
    max_output_tokens: maxOutputTokens,
  });
  return res.output_text ?? "";
}
