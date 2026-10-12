"use client";

import { useLayoutEffect, useRef } from "react";
import type { Poi, ScanOutcome } from "@/lib/tour";
import { useJourneyHydrated, useJourneyStore } from "@/lib/tour";
import { PoiDetail } from "@/components/poi-detail";
import { StartHere } from "@/components/start-here";
import { StopDock } from "@/components/stop-dock";

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

  return null;
}

/**
 * A visit to a stop. Wait for persisted progress before recording the visit,
 * so an unstarted walk does not flash the full quest on place 2/3. Progress
 * is recorded in useLayoutEffect so the dock's map head and CTA width settle
 * before the browser paints.
 */
export function ScanScreen({ poi }: { poi: Poi }) {
  const journeyReady = useJourneyHydrated();
  const scanned = useRef(false);
  const scanPoi = useJourneyStore((s) => s.scanPoi);
  const lastOutcome = useJourneyStore((s) => s.lastOutcome);

  useLayoutEffect(() => {
    if (!journeyReady || scanned.current) return;
    scanned.current = true;
    scanPoi(poi);
  }, [journeyReady, poi, scanPoi]);

  if (!journeyReady) {
    return <main className="flex flex-1 flex-col" />;
  }

  const outcome = lastOutcome?.poi.id === poi.id ? lastOutcome : null;

  if (outcome?.kind === "start_here") {
    return <StartHere poi={outcome.poi} />;
  }

  // First paint after hydrate can land before useLayoutEffect writes lastOutcome.
  // Hold an empty shell so we never flash the wrong stop's story.
  if (!outcome) {
    return <main className="flex flex-1 flex-col" />;
  }

  return (
    <PoiDetail
      poi={poi}
      banner={<Banner outcome={outcome} />}
      dock={<StopDock finishLabel="You finished the walk" />}
    />
  );
}
