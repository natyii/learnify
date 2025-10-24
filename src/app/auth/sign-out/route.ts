// src/app/auth/sign-out/route.ts
import { NextResponse, NextRequest } from "next/server";
import { serverSupabaseAction } from "@/core/supabase/action";

async function doSignOut(req: NextRequest) {
  const supabase = await serverSupabaseAction();
  await supabase.auth.signOut();
  // send them to sign-in after clearing cookies
  return NextResponse.redirect(new URL("/sign-in", req.url), { status: 302 });
}

export async function POST(req: NextRequest) { return doSignOut(req); }
export async function GET(req: NextRequest)  { return doSignOut(req); }
