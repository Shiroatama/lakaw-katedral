"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  getEntrancePoi,
  getNextExpectedPoi,
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
};

/**
 * Bottom dock shared by every journey screen. One consistent action:
 *
 * - walk not begun: Come find out (goes to place 1)
 * - stops left:     Find place N (opens wayfinding map)
 * - all visited:    Finish
 *
 * Journey screens (and home once started) pass a map head so the CTA width
 * stays stable. Fresh home keeps a full-width CTA and skips the shared
 * view-transition name so Chrome does not morph full-width → map+CTA.
 */
export function StopDock({
  finishLabel = "Finish",
  startLabel = "Come find out",
  defaultOpen = false,
}: StopDockProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const journeyReady = useJourneyHydrated();
  const [mapOpen, setMapOpen] = useState(defaultOpen);
  // Deep-link /map opens wayfinding. Chat-head opens "you are here".
  const [mapFocus, setMapFocus] = useState<MapFocus>(
    defaultOpen ? "next" : "here",
  );
  const progress = useJourneyStore();
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);
  const next = getNextExpectedPoi(progress, nagaTour);
  const entrance = getEntrancePoi(nagaTour);

  // Map head on every non-home screen, and on home after the walk begins.
  const showMapHead = !onHome || (journeyReady && started);
  // Only share the VT snapshot when geometry matches journey docks.
  const shareTransition = showMapHead;

  function openMap(focus: MapFocus) {
    setMapFocus(focus);
    setMapOpen(true);
  }

  // Wait for persisted progress before choosing layout. Journey screens keep
  // the map column so width matches the hydrated dock; fresh home stays full-width.
  if (!journeyReady) {
    return (
      <StickyActionBar
        shareTransition={false}
        map={
          onHome ? undefined : <div className="h-14 w-14" aria-hidden />
        }
      >
        <div
          className="min-h-14 w-full rounded-md bg-[var(--accent)] shadow-[0_4px_16px_rgba(184,92,56,0.35)]"
          aria-hidden
        />
      </StickyActionBar>
    );
  }

  let action: React.ReactNode;
  if (complete || !next) {
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
      shareTransition={shareTransition}
      map={
        showMapHead ? (
          <MapBubble
            open={mapOpen}
            onOpenChange={setMapOpen}
            focus={mapFocus}
            onFocusChange={setMapFocus}
            onTriggerOpen={() => openMap("here")}
          />
        ) : undefined
      }
    >
      {action}
    </StickyActionBar>
  );
}
