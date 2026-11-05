"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
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
import {
  FinishSuccessModal,
  FINISH_SUCCESS_OPEN_DELAY_MS,
} from "@/components/finish-success-modal";
import { MapBubble, type MapFocus } from "@/components/map-bubble";
import { QuestSheet } from "@/components/observation-key";
import { QuestUnlockCta } from "@/components/quest-unlock-cta";
import { useWalkIntro } from "@/components/walk-intro";
import { PrimaryButton, StickyActionBar } from "@/components/ui";
import { readFinishSuccessSeen } from "@/lib/tour/finish-success";

type StopDockProps = {
  /** Label once every place is visited. */
  finishLabel?: string;
  /** Label before the walk has begun. */
  startLabel?: string;
  /** Open the wayfinding sheet on first render. */
  defaultOpen?: boolean;
  /**
   * Unstarted gate on place 2+: send them to Home to start, with the map
   * focused on the entrance. Skips the quest sheet for the previewed stop.
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
 * - walk not begun: Start the walk (brand handoff, then onboarding); map urges that CTA
 * - startGate:      Start the walk (Home); map hidden on preview
 * - continueTo:     Continue at the expected place (direct link); map hidden
 * - on a stop, quest unsolved: Solve the quest (terracotta; opens the quest sheet);
 *                   iris-closes while the sheet is open; unlock CTA returns on solve
 * - after solve:    ink-fill unlock to Next / Finish starts with the map celebrate
 * - next is entrance: Continue at the entrance (link to place 1)
 * - later places:   Continue the walk (opens wayfinding map)
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
  const router = useRouter();
  const playIntro = useWalkIntro();
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
  /** Quest bottom sheet open for the current stop. */
  const [questOpen, setQuestOpen] = useState(false);
  /** Keep the button mounted through the iris close; shown vs leaving drive clip-path. */
  const [solveQuestMounted, setSolveQuestMounted] = useState(true);
  const [solveQuestShown, setSolveQuestShown] = useState(true);
  const [solveQuestLeaving, setSolveQuestLeaving] = useState(false);
  /** Celebrate dialog after the last quest; Continue leads to /finish. */
  const [successOpen, setSuccessOpen] = useState(false);
  const [successDelayMs, setSuccessDelayMs] = useState(
    FINISH_SUCCESS_OPEN_DELAY_MS,
  );

  useEffect(() => {
    setQuestOpen(false);
  }, [currentStop?.id]);

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
      if (complete && !readFinishSuccessSeen()) {
        setSuccessDelayMs(FINISH_SUCCESS_OPEN_DELAY_MS);
        setSuccessOpen(true);
      }
    }
    wasUnsolved.current = false;
  }, [currentUnsolved, currentStop, complete]);

  useEffect(() => {
    if (!currentUnsolved) {
      setSolveQuestMounted(false);
      setSolveQuestShown(false);
      setSolveQuestLeaving(false);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Match .solve-quest-cta.is-leaving / quest backdrop fade-out in globals.css.
    const leaveMs = reduce ? 0 : 220;

    if (!questOpen) {
      setSolveQuestLeaving(false);
      setSolveQuestMounted(true);
      let inner = 0;
      const outer = window.requestAnimationFrame(() => {
        inner = window.requestAnimationFrame(() => setSolveQuestShown(true));
      });
      return () => {
        window.cancelAnimationFrame(outer);
        window.cancelAnimationFrame(inner);
      };
    }

    setSolveQuestShown(false);
    setSolveQuestLeaving(true);
    const id = window.setTimeout(() => {
      setSolveQuestMounted(false);
      setSolveQuestLeaving(false);
    }, leaveMs);
    return () => window.clearTimeout(id);
  }, [currentUnsolved, questOpen]);

  function openSuccessNow() {
    setSuccessDelayMs(0);
    setSuccessOpen(true);
  }

  useEffect(() => {
    if (!journeyReady || started || startGate || continueTo) return;
    router.prefetch("/onboarding");
  }, [journeyReady, started, startGate, continueTo, router]);

  function openMap(focus: MapFocus) {
    setQuestOpen(false);
    setMapFocus(focus);
    setMapOpen(true);
  }

  function unlockedTarget(): UnlockedTarget {
    if (complete || !next) {
      if (!readFinishSuccessSeen()) {
        return { label: finishLabel, icon: "check", onClick: openSuccessNow };
      }
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

  function finishAction() {
    if (!readFinishSuccessSeen()) {
      return (
        <PrimaryButton icon="check" onClick={openSuccessNow}>
          {finishLabel}
        </PrimaryButton>
      );
    }
    return (
      <PrimaryButton href="/finish" icon="check">
        {finishLabel}
      </PrimaryButton>
    );
  }

  if (!journeyReady) {
    return (
      <StickyActionBar
        shareTransition={false}
        map={hideMap ? undefined : <div className="h-14 w-14" aria-hidden />}
      >
        <div
          className="min-h-14 w-full rounded-md bg-[var(--accent)]"
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
    action = solveQuestMounted ? (
      <button
        type="button"
        onClick={() => setQuestOpen(true)}
        tabIndex={solveQuestShown ? undefined : -1}
        aria-hidden={!solveQuestShown}
        disabled={!solveQuestShown}
        className={`solve-quest-cta inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-fg)] hover:brightness-95 active:scale-[0.98] ${
          solveQuestLeaving
            ? "is-leaving pointer-events-none"
            : solveQuestShown
              ? "is-shown"
              : "pointer-events-none"
        }`}
      >
        Solve the quest
        <img
          src="/icons/quest-scroll.webp"
          alt=""
          width={28}
          height={28}
          className="h-[1.45em] w-[1.45em] object-contain drop-shadow-[0_1px_1px_rgba(42,33,28,0.25)]"
          draggable={false}
        />
      </button>
    ) : null;
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
    action = finishAction();
  } else if (!started) {
    action = (
      <PrimaryButton
        icon="walk"
        onClick={() => {
          playIntro("/onboarding");
        }}
      >
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
    <>
      <StickyActionBar
        elevated={(!hideMap && mapOpen) || questOpen}
        map={
          hideMap ? undefined : (
            <MapBubble
              open={mapOpen}
              onOpenChange={(nextOpen) => {
                if (nextOpen) setQuestOpen(false);
                setMapOpen(nextOpen);
              }}
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
      {currentStop ? (
        <QuestSheet
          key={currentStop.id}
          poi={currentStop}
          open={questOpen}
          onOpenChange={(nextOpen) => {
            if (nextOpen) setMapOpen(false);
            setQuestOpen(nextOpen);
          }}
        />
      ) : null}
      <FinishSuccessModal open={successOpen} openDelayMs={successDelayMs} />
    </>
  );
}
