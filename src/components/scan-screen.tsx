"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Poi, ScanOutcome } from "@/lib/tour";
import { useJourneyStore } from "@/lib/tour";
import { PoiDetail } from "@/components/poi-detail";
import { StopDock } from "@/components/stop-dock";
import { useHydrated } from "@/lib/use-hydrated";

function Banner({ outcome }: { outcome: ScanOutcome }) {
  if (outcome.kind === "advance" && outcome.suggested) {
    const { suggested } = outcome;
    return (
      <div
        className="fade-up rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-relaxed text-[var(--muted-fg)]"
        role="status"
      >
        Place {suggested.order} is next on the path. But you can see the
        places in any order. Enjoy this one!
      </div>
    );
  }

  if (outcome.kind === "completed") {
    return (
      <div
        className="fade-up flex items-center justify-between gap-3 rounded-md border border-[var(--ceremonial)]/60 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
        role="status"
      >
        <span>You finished the walk.</span>
        <Link
          href="/finish"
          transitionTypes={["nav-forward"]}
          className="font-semibold text-[var(--accent)] underline underline-offset-2"
        >
          See the end
        </Link>
      </div>
    );
  }

  return null;
}

/**
 * A visit to a stop. The story and bottom dock render at once (fast on weak
 * signal). Progress is recorded on mount; the status banner appears once that
 * outcome is ready.
 */
export function ScanScreen({ poi }: { poi: Poi }) {
  const hydrated = useHydrated();
  const scanned = useRef(false);
  const scanPoi = useJourneyStore((s) => s.scanPoi);
  const lastOutcome = useJourneyStore((s) => s.lastOutcome);

  useEffect(() => {
    if (scanned.current) return;
    scanned.current = true;
    scanPoi(poi);
  }, [poi, scanPoi]);

  const outcome =
    hydrated && lastOutcome?.poi.id === poi.id ? lastOutcome : null;

  return (
    <PoiDetail
      poi={poi}
      banner={outcome ? <Banner outcome={outcome} /> : null}
      dock={<StopDock />}
    />
  );
}
