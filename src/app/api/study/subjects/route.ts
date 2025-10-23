// src/app/api/study/subjects/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer"; // your existing server client

export async function GET() {
  const supabase = createClient();

  // 1) Get user & grade (coerce to number in case profiles.grade is text)
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile, error: perr } = await supabase
    .from("profiles")
    .select("grade")
    .eq("user_id", user.id)
    .single();

  const grade = profile?.grade == null ? null : Number(profile.grade);
  if (!grade || Number.isNaN(grade)) {
    return NextResponse.json({ error: "Missing grade" }, { status: 400 });
  }

  // 2) Subjects that actually exist for this grade
  const { data: rows, error: serr } = await supabase
    .from("textbooks")
    .select("subject")
    .eq("grade", grade)
    .eq("published", true);

  if (serr) return NextResponse.json({ error: "Fetch failed" }, { status: 500 });

  const subjects = Array.from(new Set((rows || []).map(r => r.subject))).sort((a, b) =>
    a.localeCompare(b)
  );

  return NextResponse.json({ grade, subjects });
}
