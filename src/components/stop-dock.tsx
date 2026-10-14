"use client";

import { useEffect, useRef, useState } from "react";
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
import { QuestUnlockCta } from "@/components/quest-unlock-cta";
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

type UnlockPhase = "idle" | "animating" | "done";

type UnlockedTarget = {
  label: string;
  icon: "walk" | "check";
  href?: string;
  onClick?: () => void;
};

/**
 * Bottom dock shared by every journey screen: map chat-head + one CTA.
 *
 * - walk not begun: Start the walk (goes to place 1); map urges that CTA
 * - startGate:      Start the walk (Home); map hidden on preview
 * - continueTo:     Continue at the expected place (direct link); map hidden
 * - on a stop, quest unsolved: Solve the quest first (locked)
 * - after solve:    ink-fill unlock to Next / Finish starts with the map celebrate
 * - next is entrance: Continue at the entrance (link to place 1)
 * - later places:   Next: the mural (opens wayfinding map)
 * - all solved:     Finish
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
  const [mapFocus, setMapFocus] = useState<MapFocus>(
    defaultOpen ? "next" : "here",
  );
  const progress = useJourneyStore();
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);
  const next = getNextExpectedPoi(progress, nagaTour);
  const entrance = getEntrancePoi(nagaTour);
  const mapOrientationOnly = onHome && !started;

  const stopSlug = pathname.startsWith("/s/")
    ? pathname.slice(3).split("/")[0]
    : null;
  const currentStop = stopSlug ? (getPoiBySlug(stopSlug) ?? null) : null;
  const currentUnsolved =
    currentStop !== null && !progress.completed.includes(currentStop.id);

  const [unlockPhase, setUnlockPhase] = useState<UnlockPhase>("idle");
  const wasUnsolved = useRef(currentUnsolved);
  const unlockingStopId = useRef<string | null>(null);

  useEffect(() => {
    if (currentUnsolved) {
      unlockingStopId.current = null;
      setUnlockPhase("idle");
      wasUnsolved.current = true;
      return;
    }
    if (
      wasUnsolved.current &&
      currentStop &&
      unlockingStopId.current !== currentStop.id
    ) {
      unlockingStopId.current = currentStop.id;
      // Start with the map percent celebrate, not after it.
      setUnlockPhase("animating");
    }
    wasUnsolved.current = false;
  }, [currentUnsolved, currentStop]);

  function openMap(focus: MapFocus) {
    setMapFocus(focus);
    setMapOpen(true);
  }

  function unlockedTarget(): UnlockedTarget {
    if (complete || !next) {
      return { label: finishLabel, icon: "check", href: "/finish" };
    }
    if (next.order === 1) {
      return {
        label: nextPlaceCtaLabel(next),
        icon: "walk",
        href: `/s/${next.slug}`,
      };
    }
    return {
      label: nextPlaceCtaLabel(next),
      icon: "walk",
      onClick: () => openMap("next"),
    };
  }

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
  } else if (unlockPhase === "animating" || unlockPhase === "done") {
    const target = unlockedTarget();
    action = (
      <QuestUnlockCta
        phase={unlockPhase === "done" ? "live" : "animating"}
        toLabel={target.label}
        toIcon={target.icon}
        href={target.href}
        onClick={target.onClick}
        onUnlocked={() => setUnlockPhase("done")}
      />
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
