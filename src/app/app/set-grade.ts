// src/app/app/set-grade.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/core/supabase/rsc";

/**
 * Server Action: saves the chosen grade to the signed-in user's profile,
 * then revalidates /app and redirects to /library.
 */
export async function setGradeAction(formData: FormData) {
  const grade = Number(formData.get("grade"));
  if (!Number.isFinite(grade) || grade < 1 || grade > 12) {
    // Nothing to do; return to /app without crashing.
    revalidatePath("/app");
    return;
  }

  const supabase = await getServerSupabase();

  // Require a user
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  const user = auth?.user;
  if (authErr || !user) {
    redirect("/sign-in?next=%2Fapp");
    return;
  }

  // Persist grade to profiles.user_id row
  const { error: upErr } = await supabase
    .from("profiles")
    .update({ grade })
    .eq("user_id", user.id);

  // Even if update fails silently, do not explode the UX.
  // (If you want, you can surface an error banner on /app.)
  if (upErr) {
    revalidatePath("/app");
    return;
  }

  // Refresh cache & go straight to grade-aware Library
  revalidatePath("/app");
  revalidatePath("/library");
  redirect("/library");
}
