"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Create a Supabase server client that can set/remove cookies inside a Server Action */
function getSupabaseForAction() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const c = cookies();

  return createServerClient(URL, KEY, {
    cookies: {
      get: (name: string) => c.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        c.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        // delete by expiring
        c.set({ name, value: "", ...options, expires: new Date(0) });
      },
    },
  });
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const gradeStr = String(formData.get("grade") || "");
  const grade = Number(gradeStr);

  // Basic validation (keep user experience smooth)
  if (!email || !password) {
    redirect("/sign-up?error=missing_fields");
  }
  if (password !== confirm) {
    redirect("/sign-up?error=password_mismatch");
  }
  if (!Number.isFinite(grade) || grade < 1 || grade > 12) {
    redirect("/sign-up?error=invalid_grade");
  }

  const supabase = getSupabaseForAction();

  // Try sign-up
  const { data: signUp, error } = await supabase.auth.signUp({ email, password });

  // If the account already exists, nudge to sign-in while preserving intent
  // Known Supabase code: "user_already_exists"
  if (error && (error as any).code === "user_already_exists") {
    redirect("/sign-in?next=/app&error=already_exists");
  }
  if (error) {
    // Generic failure case
    redirect("/sign-up?error=signup_failed");
  }

  // If sign-up flow requires email confirmation, user may be null until confirmed.
  const user = signUp?.user;
  if (user?.id) {
    // Store grade in profile now (safe if you have RLS + policy permitting user to upsert own profile)
    await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, grade, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
  }

  // Land them in the app; the app will already be grade-aware from profile
  redirect("/app");
}
