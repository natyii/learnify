import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";
import { getProfile } from "@/core/profile";
import { requireUser } from "@/core/auth";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireUser();
    const profile = await getProfile(user.id);
    const grade = Number(profile?.grade ?? 0);
    if (!grade) return NextResponse.json({ error: "No grade set." }, { status: 400 });

    const supabase = await serverSupabase();
    const { data, error } = await supabase
      .from("textbooks")
      .select("*")
      .eq("grade", grade)
      .limit(25);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ count: (data ?? []).length, sample: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
