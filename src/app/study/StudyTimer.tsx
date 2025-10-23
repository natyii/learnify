// src/app/study/StudyTimer.tsx
"use client";

/**
 * Tracks time spent on the Study page and writes it to Supabase:
 * - Creates a row in study_sessions at mount (duration_ms = 0)
 * - Every 20s, bumps duration_ms
 * - On tab close/navigation/unmount, final update
 *
 * Works with @supabase/supabase-js (no auth-helpers dependency).
 * Assumes NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 * RLS: user must be able to insert/update rows where user_id = auth.uid().
 */

import { useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function StudyTimer({ subject }: { subject?: string | null }) {
  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const savedMsRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    async function start() {
      // get the logged-in user from browser session (localStorage)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // not signed in, don't record

      // create a new study session row
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          subject: subject ?? null,
          created_at: new Date().toISOString(),
          duration_ms: 0,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (error || !data) return;
      sessionIdRef.current = data.id;
      startedAtRef.current = Date.now();
      savedMsRef.current = 0;

      // heartbeat every 20s
      tickRef.current = window.setInterval(() => {
        void flush(false);
      }, 20000);
    }

    async function flush(final: boolean) {
      const id = sessionIdRef.current;
      if (!id) return;
      const elapsed = Date.now() - startedAtRef.current;
      const delta = Math.max(0, elapsed - savedMsRef.current);
      if (delta < 5000 && !final) return; // avoid very small writes unless final

      savedMsRef.current += delta;

      await supabase
        .from("study_sessions")
        .update({ duration_ms: savedMsRef.current })
        .eq("id", id);
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") void flush(false);
    }
    function handleFinal() {
      void flush(true);
      if (tickRef.current) clearInterval(tickRef.current);
    }

    start().catch(() => {});
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleFinal);
    window.addEventListener("beforeunload", handleFinal);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleFinal);
      window.removeEventListener("beforeunload", handleFinal);
      if (tickRef.current) clearInterval(tickRef.current);
      void (async () => { await flush(true); })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  return null;
}
