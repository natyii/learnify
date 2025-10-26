// src/app/api/study/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const subject = String(req.nextUrl.searchParams.get("subject") || "").trim().toLowerCase();
  if (!subject) return NextResponse.json({ error: "Missing subject" }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("grade")
    .eq("user_id", user.id)
    .single();

  const grade = profile?.grade == null ? null : Number(profile.grade);
  if (!grade || Number.isNaN(grade)) {
    return NextResponse.json({ error: "Missing grade" }, { status: 400 });
  }

  const { data: books, error } = await supabase
    .from("textbooks")
    .select("id, title, subject")
    .eq("grade", grade)
    .eq("published", true);

  if (error) return NextResponse.json({ error: "Fetch failed" }, { status: 500 });

  const match =
    (books || []).find(b => (b.subject || "").toLowerCase() === subject) ??
    (books || [])[0] ??
    null;

  if (!match) {
    return NextResponse.json({ grade, subject, book: null }, { status: 404 });
  }

  return NextResponse.json({
    grade,
    subject,
    book: { id: match.id, title: match.title, subject: match.subject },
  });
}
