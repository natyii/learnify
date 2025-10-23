// src/core/textbooks.ts
import { serverSupabase } from "@/core/supabase/server";

/**
 * Return one or more canonical subject keys corresponding to a DB subject label.
 * Examples:
 *  - "CTE" -> ["cte"]
 *  - "Integrated Science" -> ["science"]
 *  - "CTE Science" -> ["cte","science"]  // special split-case
 */
export function subjectLabelToKeys(label: string | null | undefined): string[] {
  if (!label) return [];
  const raw = label.trim().toLowerCase();

  // normalize separators
  const compact = raw.replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").trim();

  // split-case: treat combined label as two distinct subjects
  if (compact === "cte science" || compact === "cte-science" || compact === "cte & science") {
    return ["cte", "science"];
  }

  // map many variants to a single canonical key
  const MAP: Record<string, string> = {
    // core
    "amharic": "amharic",
    "english": "english",
    "mathematics": "mathematics",
    "math": "mathematics",

    "biology": "biology",
    "chemistry": "chemistry",
    "physics": "physics",

    "geography": "geography",
    "history": "history",
    "civics": "civics",
    "economics": "economics",

    "ict": "ict",
    "computer": "ict",
    "computer science": "ict",

    "general": "general",

    // added subjects
    "environmental science": "environmental_science",
    "environmental-science": "environmental_science",
    "env science": "environmental_science",
    "env. science": "environmental_science",
    "environment": "environmental_science",

    "arts": "arts",
    "art": "arts",
    "visual arts": "arts",
    "fine arts": "arts",

    // CTE (separate subject)
    "cte": "cte",
    "c.t.e.": "cte",
    "c.t.e": "cte",
    "career and technical education": "cte",

    // Science (separate general/integrated science)
    "science": "science",
    "integrated science": "science",
    "general science": "science",
  };

  // direct hit
  if (MAP[compact]) return [MAP[compact]];

  // last-resort: try the raw input
  return [compact];
}

export async function getSubjectsForGrade(grade: number): Promise<string[]> {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("textbooks")
    .select("subject")
    .eq("grade", grade);

  if (error || !data) return [];

  const out = new Set<string>();
  for (const row of data) {
    for (const key of subjectLabelToKeys(String(row.subject || ""))) {
      if (key) out.add(key);
    }
  }
  return Array.from(out).sort();
}

export async function getTextbooksByGrade(grade: number) {
  const supabase = await serverSupabase();
  const { data } = await supabase
    .from("textbooks")
    .select("id, title, subject, grade, storage_path")
    .eq("grade", grade)
    .order("subject", { ascending: true })
    .order("title", { ascending: true });
  return data ?? [];
}

export async function getDefaultSubject(): Promise<string | null> {
  // keep simple; you can make this profile-driven later
  return "english";
}
