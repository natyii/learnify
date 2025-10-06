import { requireUser } from "@/core/auth";
import { getProfile } from "@/core/profile";
import Link from "next/link";

export default async function Page() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Welcome</h1>
      <p className="text-[var(--muted)] mb-6">Signed in as {user.email}</p>

      <div className="rounded-xl p-5 bg-[var(--card)] mb-6">
        <p>Your grade: <strong>{profile?.grade ?? "— not set —"}</strong></p>
      </div>

      <div className="grid gap-3">
        <Link className="rounded-lg p-4 bg-black/20 border border-white/10" href="/library">Library</Link>
        <Link className="rounded-lg p-4 bg-black/20 border border-white/10" href="/study">Study</Link>
        <Link className="rounded-lg p-4 bg-black/20 border border-white/10" href="/homework">Homework</Link>
        <Link className="rounded-lg p-4 bg-black/20 border border-white/10" href="/quiz">Quiz</Link>
        <Link className="rounded-lg p-4 bg-black/20 border border-white/10" href="/progress">Progress</Link>
      </div>
    </main>
  );
}
