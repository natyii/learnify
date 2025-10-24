// src/ui/pwa/InstallPWAButton.tsx
"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      // Prevent the mini-info bar from showing and stash the event
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall as any);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const canInstall = !!deferred;

  return (
    <button
      onClick={async () => {
        if (!deferred) return;
        deferred.prompt();
        await deferred.userChoice; // { outcome: 'accepted' | 'dismissed', platform: string }
        setDeferred(null);
      }}
      disabled={!canInstall}
      className={className}
      aria-disabled={!canInstall}
      title={canInstall ? "Install app" : "Install not available yet"}
    >
      {canInstall ? "Install app" : "Install not available"}
    </button>
  );
}
