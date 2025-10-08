// src/ui/AuthButtons.tsx
import Link from "next/link";
import { serverSupabase } from "@/core/supabase/server";

export default async function AuthButtons() {
  const supabase = await serverSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  async function signOut() {
    "use server";
    const sb = await serverSupabase();
    await sb.auth.signOut();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className="rounded-md px-3 py-2 text-sm bg-white/10 border border-white/15 hover:bg-white/15">
          Sign in
        </Link>
        <Link href="/sign-up" className="rounded-md px-3 py-2 text-sm bg-emerald-400 text-black hover:bg-emerald-300">
          Get started
        </Link>
      </div>
    );
  }

  return (
    <form action={signOut}>
      <button className="rounded-md px-3 py-2 text-sm border border-white/15 hover:bg-white/10">
        Sign out
      </button>
    </form>
  );
}
