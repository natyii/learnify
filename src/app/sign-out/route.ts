import { NextResponse } from "next/server";
import { serverSupabaseAction } from "@/core/supabase/action";

export async function POST() {
  const supabase = serverSupabaseAction();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
