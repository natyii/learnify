// src/app/api/homework/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, server } from "@/lib/supabaseServer";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const supabase = await server();

    const { data: current, error: readErr } = await supabase
      .from("homework")
      .select("id, done")
      .eq("id", params.id)
      .eq("owner", user.id)
      .single();
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 404 });

    const { data, error } = await supabase
      .from("homework")
      .update({ done: !current.done })
      .eq("id", params.id)
      .eq("owner", user.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
