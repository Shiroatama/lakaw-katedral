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
  continuePlaceCtaLabel,
  nextPlaceCtaLabel,
  useJourneyHydrated,
  useJourneyStore,
  type Poi,
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
   * Unstarted gate on place 2+: send them to Home to start, with the map
   * focused on the entrance. Skips the "Solve the quest first" lock for the
   * previewed stop.
   */
  startGate?: boolean;
  /**
   * Mid-walk gate: link straight to this place (e.g. Continue at the entrance).
   * Skips the quest lock for the previewed stop.
   */
  continueTo?: Poi;
  /** Hide the map chat-head (preview / gate screens). */
  hideMap?: boolean;
};

/**
 * Bottom dock shared by every journey screen: map chat-head + one CTA.
 *
 * - walk not begun: Start the walk (goes to place 1); map urges that CTA
 * - startGate:      Start the walk (Home); map hidden on preview
 * - continueTo:     Continue at the expected place (direct link); map hidden
 * - on a stop, quest unsolved: Solve the quest first (locked)
 * - next is entrance: Continue at the entrance (link to place 1)
 * - later places:   Next: the mural (opens wayfinding map)
 * - all solved:     Finish
 *
 * The map head is present on Home and stop screens so pilgrims can check where
 * they are or where to begin. Preview gates hide it. The observation key
 * unlocks the next-place CTA after you finish the quest at the current stop.
 */
export function StopDock({
  finishLabel = "Finish",
  startLabel = "Start the walk",
  defaultOpen = false,
  startGate = false,
  continueTo,
  hideMap = false,
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
  // Home before the walk: map is for orientation only. Start the walk opens place 1.
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
  // home and journey docks share the same geometry (no full-width flash),
  // except preview gates that hide the map.
  if (!journeyReady) {
    return (
      <StickyActionBar
        shareTransition={false}
        map={hideMap ? undefined : <div className="h-14 w-14" aria-hidden />}
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
      <PrimaryButton href="/" icon="walk">
        {startLabel}
      </PrimaryButton>
    );
  } else if (continueTo) {
    action = (
      <PrimaryButton href={`/s/${continueTo.slug}`} icon="walk">
        {continuePlaceCtaLabel(continueTo)}
      </PrimaryButton>
    );
  } else if (currentUnsolved) {
    action = (
      <PrimaryButton disabled icon="none">
        Solve the quest first
      </PrimaryButton>
    );
  } else if (complete || !next) {
    action = (
      <PrimaryButton href="/finish" icon="check">
        {finishLabel}
      </PrimaryButton>
    );
  } else if (!started) {
    action = (
      <PrimaryButton href={`/s/${entrance.slug}`} icon="walk">
        {startLabel}
      </PrimaryButton>
    );
  } else if (next.order === 1) {
    // Left the entrance mid-quest: go back to the story, not the map.
    action = (
      <PrimaryButton href={`/s/${next.slug}`} icon="walk">
        {nextPlaceCtaLabel(next)}
      </PrimaryButton>
    );
  } else {
    action = (
      <PrimaryButton onClick={() => openMap("next")} icon="walk">
        {nextPlaceCtaLabel(next)}
      </PrimaryButton>
    );
  }

  return (
    <StickyActionBar
      elevated={!hideMap && mapOpen}
      map={
        hideMap ? undefined : (
          <MapBubble
            open={mapOpen}
            onOpenChange={setMapOpen}
            focus={mapFocus}
            onFocusChange={setMapFocus}
            hideActions={mapOrientationOnly}
            beginLabel={startLabel}
            onTriggerOpen={() =>
              openMap(
                startGate ||
                  continueTo ||
                  !(started && progress.lastScannedPoiId)
                  ? "next"
                  : "here",
              )
            }
          />
        )
      }
    >
      {action}
    </StickyActionBar>
  );
}
