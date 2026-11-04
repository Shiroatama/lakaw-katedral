"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Poi } from "@/lib/tour";
import {
  isJourneyStarted,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";
import { PoiDetail } from "@/components/poi-detail";
import { StopDock } from "@/components/stop-dock";

/**
 * A visit to a stop. Wait for persisted progress before recording the visit,
 * so an unstarted walk does not flash the full quest on place 2+. Progress
 * is recorded in useLayoutEffect so the dock's map head and CTA width settle
 * before the browser paints.
 *
 * Too-early visits: unstarted → Home; started → map with a warm tip.
 */
export function ScanScreen({ poi }: { poi: Poi }) {
  const router = useRouter();
  const journeyReady = useJourneyHydrated();
  const scanned = useRef(false);
  const gated = useRef(false);
  const scanPoi = useJourneyStore((s) => s.scanPoi);
  const setEarlyScanGate = useJourneyStore((s) => s.setEarlyScanGate);
  const lastOutcome = useJourneyStore((s) => s.lastOutcome);
  const progress = useJourneyStore();

  useLayoutEffect(() => {
    if (!journeyReady || scanned.current) return;
    scanned.current = true;
    scanPoi(poi);
  }, [journeyReady, poi, scanPoi]);

  const outcome = lastOutcome?.poi.id === poi.id ? lastOutcome : null;
  const unstartedEarly =
    outcome?.kind === "start_here" && !isJourneyStarted(progress);
  const startedEarly =
    outcome?.kind === "start_here" && isJourneyStarted(progress);

  useEffect(() => {
    if (!journeyReady || !outcome || gated.current) return;
    if (unstartedEarly) {
      gated.current = true;
      router.replace("/");
      return;
    }
    if (startedEarly && outcome.kind === "start_here") {
      gated.current = true;
      setEarlyScanGate(outcome.expected.id);
      router.replace("/map");
    }
  }, [
    journeyReady,
    outcome,
    unstartedEarly,
    startedEarly,
    router,
    setEarlyScanGate,
  ]);

  if (!journeyReady) {
    return <main className="flex flex-1 flex-col" />;
  }

  if (unstartedEarly || startedEarly || !outcome) {
    return <main className="flex flex-1 flex-col" />;
  }

  return (
    <PoiDetail
      poi={poi}
      dock={<StopDock finishLabel="You finished the walk" />}
    />
  );
}
