"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  getEntrancePoi,
  getNextExpectedPoi,
  getPoiBySlug,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";
import { MapBubble, type MapFocus } from "@/components/map-bubble";
import { PrimaryButton, StickyActionBar } from "@/components/ui";

type StopDockProps = {
  /** Label once every place is visited. */
  finishLabel?: string;
  /** Label before the walk has begun. */
  startLabel?: string;
  /** Open the wayfinding sheet on first render. */
  defaultOpen?: boolean;
  /**
   * Unstarted gate on place 2+: always offer begin-at-entrance + map to find
   * the door. Skips the "Solve the quest first" lock for the previewed stop.
   */
  startGate?: boolean;
};

/**
 * Bottom dock shared by every journey screen: map chat-head + one CTA.
 *
 * - walk not begun: Come find out (goes to place 1); map urges that CTA
 * - startGate:      Begin at the entrance + map focused on place 1
 * - on a stop, quest unsolved: Solve the quest first (locked)
 * - stops left:     Find place N (opens wayfinding map)
 * - all solved:     Finish
 *
 * The map head is always present (including Home) so pilgrims can check where
 * they are or where to begin. The observation key unlocks "Find place N"
 * after you finish the quest at the current stop.
 */
export function StopDock({
  finishLabel = "Finish",
  startLabel = "Come find out",
  defaultOpen = false,
  startGate = false,
}: StopDockProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const journeyReady = useJourneyHydrated();
  const [mapOpen, setMapOpen] = useState(defaultOpen);
  // Deep-link /map opens wayfinding. Chat-head opens "you are here" when known,
  // otherwise "Start here" / next place.
  const [mapFocus, setMapFocus] = useState<MapFocus>(
    defaultOpen ? "next" : "here",
  );
  const progress = useJourneyStore();
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);
  const next = getNextExpectedPoi(progress, nagaTour);
  const entrance = getEntrancePoi(nagaTour);
  // Home before the walk: map is for orientation only. Come find out starts place 1.
  const mapOrientationOnly = onHome && !started;

  const stopSlug = pathname.startsWith("/s/")
    ? pathname.slice(3).split("/")[0]
    : null;
  const currentStop = stopSlug ? (getPoiBySlug(stopSlug) ?? null) : null;
  const currentUnsolved =
    currentStop !== null && !progress.completed.includes(currentStop.id);

  function openMap(focus: MapFocus) {
    setMapFocus(focus);
    setMapOpen(true);
  }

  // Wait for persisted progress before choosing the CTA. Map column stays so
  // home and journey docks share the same geometry (no full-width flash).
  if (!journeyReady) {
    return (
      <StickyActionBar
        shareTransition={false}
        map={<div className="h-14 w-14" aria-hidden />}
      >
        <div
          className="min-h-14 w-full rounded-md bg-[var(--accent)] shadow-[0_4px_16px_rgba(184,92,56,0.35)]"
          aria-hidden
        />
      </StickyActionBar>
    );
  }

  let action: React.ReactNode;
  if (startGate) {
    action = (
      <PrimaryButton href={`/s/${entrance.slug}`}>
        Begin at the entrance
      </PrimaryButton>
    );
  } else if (currentUnsolved) {
    action = (
      <PrimaryButton disabled icon="none">
        Solve the quest first
      </PrimaryButton>
    );
  } else if (complete || !next) {
    action = <PrimaryButton href="/finish">{finishLabel}</PrimaryButton>;
  } else if (!started) {
    action = (
      <PrimaryButton href={`/s/${entrance.slug}`}>{startLabel}</PrimaryButton>
    );
  } else {
    action = (
      <PrimaryButton onClick={() => openMap("next")}>
        Find place {next.order}
      </PrimaryButton>
    );
  }

  return (
    <StickyActionBar
      elevated={mapOpen}
      map={
        <MapBubble
          open={mapOpen}
          onOpenChange={setMapOpen}
          focus={mapFocus}
          onFocusChange={setMapFocus}
          hideActions={mapOrientationOnly}
          beginLabel={startLabel}
          onTriggerOpen={() =>
            openMap(
              startGate || !(started && progress.lastScannedPoiId)
                ? "next"
                : "here",
            )
          }
        />
      }
    >
      {action}
    </StickyActionBar>
  );
}
