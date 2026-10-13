"use client";

import { useLayoutEffect, useRef } from "react";
import type { Poi } from "@/lib/tour";
import {
  isJourneyStarted,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";
import { PoiDetail } from "@/components/poi-detail";
import { StartHere } from "@/components/start-here";
import { StopDock } from "@/components/stop-dock";

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
  const progress = useJourneyStore();

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
    return (
      <StartHere
        poi={outcome.poi}
        expected={outcome.expected}
        unstarted={!isJourneyStarted(progress)}
      />
    );
  }

  // First paint after hydrate can land before useLayoutEffect writes lastOutcome.
  // Hold an empty shell so we never flash the wrong stop's story.
  if (!outcome) {
    return <main className="flex flex-1 flex-col" />;
  }

  return (
    <PoiDetail
      poi={poi}
      dock={<StopDock finishLabel="You finished the walk" />}
    />
  );
}
