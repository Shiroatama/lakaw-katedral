"use client";

import { useEffect, useState } from "react";
import { nagaTour } from "@/lib/tour";

/**
 * Small reassurance that the tour is saved on this phone. Checks the service
 * worker's precache for every stop page. Shows nothing when the service worker
 * is unavailable (for example in `next dev`).
 */
export function OfflineStatus({ className = "" }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;
    let cancelled = false;

    navigator.serviceWorker.ready
      .then(async () => {
        const hits = await Promise.all(
          nagaTour.pois.map((poi) =>
            caches.match(`/s/${poi.slug}`, { ignoreSearch: true }),
          ),
        );
        if (!cancelled) setReady(hits.every(Boolean));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <p
      className={`fade-in flex items-center justify-center gap-2 text-sm ${className || "text-[var(--success)]"}`.trim()}
      role="status"
    >
      <span aria-hidden className="pop-in" style={{ "--delay": "150ms" } as React.CSSProperties}>
        ✓
      </span>
      Saved on your phone. It works with no signal.
    </p>
  );
}
