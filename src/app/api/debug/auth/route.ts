// src/app/api/debug/auth/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabaseServer";

export async function GET() {
  const user = await getAuthUser();
  return NextResponse.json({
    ok: !!user,
    user_id: user?.id ?? null,
    note: user ? "Auth working" : "No user. Go to /sign-in, then reload this."
  });
}
