import { redirect } from "next/navigation";
import { serverSupabase } from "@/core/supabase/server";
import { upsertProfile } from "@/core/profile";

const GRADES = ["1","2","3","4","5","6","7","8","9","10","11","12"];

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={signUp} className="w-full max-w-sm space-y-4 bg-[var(--card)] p-6 rounded-xl">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Create account</h1>
        <input name="email" type="email" required placeholder="Email"
               className="w-full rounded-md p-3 bg-black/20 border border-white/10 outline-none"/>
        <input name="password" type="password" required placeholder="Password"
               className="w-full rounded-md p-3 bg-black/20 border border-white/10 outline-none"/>
        <label className="block text-sm text-[var(--muted)]">Grade</label>
        <select name="grade" required
                className="w-full rounded-md p-3 bg-black/20 border border-white/10 outline-none">
          <option value="">Select grade</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button className="w-full p-3 rounded-md bg-[var(--accent)] text-white font-medium">Sign up</button>
        <p className="text-sm text-[var(--muted)]">Have an account? <a href="/sign-in" className="underline">Sign in</a></p>
      </form>
    </main>
  );
}

async function signUp(fd: FormData): Promise<void> {
  "use server";
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");
  const grade = String(fd.get("grade") || "");

  const supabase = await serverSupabase();

  // Try to sign up; if already exists, fall back to sign-in
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error && (error as any).code === "user_already_exists") {
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) throw signInErr;
    const { data: u } = await supabase.auth.getUser();
    if (u.user) await upsertProfile(u.user.id, grade);
    return redirect("/app");
  }
  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error("No user returned from signUp");
  await upsertProfile(user.id, grade);
  redirect("/app");
}
