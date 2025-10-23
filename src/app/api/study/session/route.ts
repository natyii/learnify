// src/app/api/study/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    // 1) Grade from profile
    const { data: prof, error: pErr } = await supabase
      .from("profiles")
      .select("grade")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pErr) throw pErr;
    const grade = typeof prof?.grade === "number" ? prof.grade
      : prof?.grade ? Number(prof.grade) : null;

    if (!grade) {
      return NextResponse.json(
        { error: "Missing grade. Please set your grade in Profile." },
        { status: 400 }
      );
    }

    // 2) Subject (from body or fallback to first available)
    let subject: string | null = body?.subject ?? null;
    if (!subject) {
      const { data: firstSubj } = await supabase
        .from("textbooks")
        .select("subject")
        .eq("grade", grade)
        .eq("published", true)
        .order("subject", { ascending: true })
        .limit(1)
        .maybeSingle();
      subject = firstSubj?.subject ?? null;
    }
    if (!subject) {
      return NextResponse.json(
        { error: "Missing subject. Pick a subject with available textbook." },
        { status: 400 }
      );
    }

    // 3) Resolve a textbook for (grade, subject)
    const { data: book } = await supabase
      .from("textbooks")
      .select("id, title")
      .eq("grade", grade)
      .eq("subject", subject)
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const book_id = book?.id ?? null;
    const book_title = book?.title ?? null;

    // 4) Create session row (even if no book found, we record attempt)
    const payload = {
      user_id: user.id,
      grade,
      subject,
      subject_key: subject.toLowerCase(),
      book_id,
      book_title,
      started_at: new Date().toISOString(),
      is_archived: false,
    };

    const { data: created, error } = await supabase
      .from("study_sessions")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: created.id, ...payload }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Session route failed", message: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
