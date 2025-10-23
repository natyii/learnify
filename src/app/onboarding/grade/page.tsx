// src/app/onboarding/grade/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Server action to set the user's grade once and redirect to app
async function setGradeAction(formData: FormData) {
  "use server";

  const grade = Number(String(formData.get("grade") || "").trim());
  if (!grade || grade < 1 || grade > 12) {
    redirect("/onboarding/grade?error=Pick%20a%20grade");
  }

  // Supabase server client with cookie adapter
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const c = cookies();
  const supabase = createServerClient(URL, KEY, {
    cookies: {
      get: (name: string) => c.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) =>
        c.set({ name, value, ...(options || {}) }),
      remove: (name: string, options: CookieOptions) =>
        c.set({ name, value: "", ...(options || {}), expires: new Date(0) }),
    },
  });

  const { data: session } = await supabase.auth.getUser();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in?next=/onboarding/grade");

  // Upsert grade into profiles (idempotent)
  await supabase
    .from("profiles")
    .upsert({ user_id: userId, grade, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  redirect("/app");
}

export default async function OnboardGrade() {
  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-black">Set your grade</h1>
      <p className="mb-6 text-sm text-black/70">
        Choose your grade once so Study and Library match your curriculum.
      </p>

      <form action={setGradeAction} className="space-y-4">
        <label className="block text-sm font-medium text-black/80">
          Your grade
          <select
            name="grade"
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select grade
            </option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white font-semibold"
        >
          Save grade
        </button>

        <div className="text-xs text-black/60 mt-2">
          You can change this later from your profile.
        </div>
      </form>
    </main>
  );
}
