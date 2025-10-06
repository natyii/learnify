import { redirect } from "next/navigation";
import { serverSupabase } from "@/core/supabase/server";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={signIn} className="w-full max-w-sm space-y-4 bg-[var(--card)] p-6 rounded-xl">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Sign in</h1>
        <input name="email" type="email" required placeholder="Email"
               className="w-full rounded-md p-3 bg-black/20 border border-white/10 outline-none"/>
        <input name="password" type="password" required placeholder="Password"
               className="w-full rounded-md p-3 bg-black/20 border border-white/10 outline-none"/>
        <button className="w-full p-3 rounded-md bg-[var(--accent)] text-white font-medium">Sign in</button>
        <p className="text-sm text-[var(--muted)]">New here? <a href="/sign-up" className="underline">Create account</a></p>
      </form>
    </main>
  );
}

async function signIn(fd: FormData): Promise<void> {
  "use server";
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");
  const supabase = await serverSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  redirect("/app");
}
