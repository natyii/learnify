// src/app/library/ls/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/core/supabase/rsc";

/**
 * GET /library/ls?g=12
 * Lists textbooks for a grade (from query ?g=) or the signed-in user's profile.grade.
 * Returns: [{ id, subject, title, storage_path }]
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const qGrade = Number(url.searchParams.get("g"));

  const supabase = await getServerSupabase();

  // Resolve grade: URL > user profile
  let grade: number | null =
    Number.isFinite(qGrade) ? (qGrade as number) : null;

  if (!grade) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? null;

    if (userId) {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("grade")
        .eq("user_id", userId)
        .single();

      if (profileErr) {
        return NextResponse.json(
          { error: "PROFILE_ERROR", details: profileErr.message },
          { status: 500 }
        );
      }
      grade = (profile?.grade as number) ?? null;
    }
  }

  if (!grade) {
    return NextResponse.json(
      { error: "NO_GRADE", message: "Grade not set for this user." },
      { status: 400 }
    );
  }

  // Fetch textbooks for the resolved grade
  const { data, error } = await supabase
    .from("textbooks")
    .select("id, subject, title, storage_path")
    .eq("grade", grade)
    .order("subject")
    .order("title");

  if (error) {
    return NextResponse.json(
      { error: "DB_ERROR", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ grade, textbooks: data ?? [] });
}
