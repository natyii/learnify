// src/app/api/homework/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, server } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ items: [] }, { status: 200 });

    const supabase = await server();
    const { data, error } = await supabase
      .from("homework")
      .select("*")
      .eq("owner", user.id)
      .order("done", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const payload = {
      title: String(body.title ?? "").slice(0, 300),
      subject: String(body.subject ?? "general"),
      grade: Number(body.grade ?? 0),
      textbook_id: body.textbook_id ?? null,
      page: body.page === null || body.page === "" ? null : Number(body.page),
      notes: body.notes ?? null,
      due_at: body.due_at ?? null,
      done: false, // owner will be set by DEFAULT auth.uid()
    };
    if (!payload.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const supabase = await server();
    const { data, error } = await supabase.from("homework").insert(payload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
