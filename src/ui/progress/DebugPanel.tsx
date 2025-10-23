// src/ui/progress/DebugPanel.tsx
"use client";

import { useEffect, useState } from "react";

export default function DebugPanel({ clientSnapshot }: { clientSnapshot: any }) {
  const [server, setServer] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/progress-audit")
      .then((r) => r.json())
      .then(setServer)
      .catch((e) => setErr(e?.message || "fetch failed"));
  }, []);

  return (
    <div className="mt-10 rounded-2xl p-5 bg-white/70 ring-1 ring-black/10 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Progress Audit (debug)</h3>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 className="font-semibold mb-1">Client snapshot</h4>
          <pre className="text-xs bg-black/5 p-3 rounded overflow-auto">
            {JSON.stringify(clientSnapshot, null, 2)}
          </pre>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Server truth</h4>
          <pre className="text-xs bg-black/5 p-3 rounded overflow-auto">
            {server ? JSON.stringify(server, null, 2) : "Loading..."}
          </pre>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        This panel compares the page’s computed values (left) with a server-verified snapshot (right)
        taken directly from normalized views. Use it to confirm correctness.
      </p>
    </div>
  );
}
