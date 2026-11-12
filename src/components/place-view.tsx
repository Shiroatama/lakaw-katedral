"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CorrectCelebrate } from "@/components/correct-celebrate";
import { ChevronLeftIcon } from "@/components/icons";
import { MapChip } from "@/components/map-chip";
import { QuestSheet } from "@/components/quest-sheet";
import { TeachMedia } from "@/components/teach-media";
import { Btn } from "@/components/ui";
import { gatePath, walkGate } from "@/lib/access/gate";
import { sendThroughGate } from "@/lib/access/route-gate";
import { readWalkAccess, useAccessStore } from "@/lib/access/store";
import { useAccessHydrated } from "@/lib/access/use-access-hydrated";
import {
  getNextExpectedPoi,
  getPlaceState,
  isJourneyComplete,
  isJourneyStarted,
  isLatestSolved,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";
import type { Poi } from "@/lib/tour";

/**
 * One place. Story first (media, then prose), then the Solve the quest
 * sheet. After a solve, and on every later visit, the reveal shows with the
 * full story and no quest.
 *
 * Only the next unsolved place can be solved. Opening any other unsolved
 * place by link or scan sends the visitor back: home if the walk has not
 * started, otherwise Walk with a warm "next up" note. Places after the free
 * three go to login or pay first and are not recorded.
 */
export function PlaceView({ poi }: { poi: Poi }) {
  const router = useRouter();
  const journeyReady = useJourneyHydrated();
  const accessReady = useAccessHydrated();
  const progress = useJourneyStore();
  const account = useAccessStore((s) => s.account);
  const paid = useAccessStore((s) => s.paid);
  const setReturnTo = useAccessStore((s) => s.setReturnTo);
  const scanPoi = useJourneyStore((s) => s.scanPoi);
  const completePoi = useJourneyStore((s) => s.completePoi);
  const setEarlyScanGate = useJourneyStore((s) => s.setEarlyScanGate);

  const [questOpen, setQuestOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const handled = useRef(false);

  const total = nagaTour.pois.length;
  const ready = journeyReady && accessReady;
  const state = getPlaceState(poi, progress, nagaTour);
  const solved = state === "done";
  const lockedPath = gatePath(
    walkGate(poi, readWalkAccess({ account, paid })),
  );
  const redirecting = ready && !solved && (lockedPath !== null || state === "locked");

  useEffect(() => {
    if (!ready || handled.current) return;

    if (!solved && lockedPath) {
      handled.current = true;
      setReturnTo(`/s/${poi.slug}`);
      router.replace(lockedPath);
      return;
    }

    if (state === "locked") {
      handled.current = true;
      if (!isJourneyStarted(progress)) {
        router.replace("/");
        return;
      }
      const expected = getNextExpectedPoi(progress, nagaTour);
      setEarlyScanGate(expected?.id ?? null);
      router.replace("/walk");
      return;
    }

    // Record the visit once. Solving is separate: only a correct quest does it.
    handled.current = true;
    scanPoi(poi);
  }, [
    ready,
    solved,
    lockedPath,
    state,
    progress,
    poi,
    router,
    scanPoi,
    setEarlyScanGate,
    setReturnTo,
  ]);

  if (!ready || redirecting) {
    return <main className="view not-ready" />;
  }

  const isLast = poi.order === total;
  const dockLabel = !solved
    ? "Solve the quest"
    : isLast
      ? "Finish the walk"
      : isLatestSolved(poi, progress)
        ? "Next place"
        : "Continue the walk";

  function openQuest() {
    setSession((n) => n + 1);
    setQuestOpen(true);
  }

  function continueWalk() {
    if (isJourneyComplete(progress, nagaTour)) {
      router.push("/finish");
      return;
    }
    const next = getNextExpectedPoi(progress, nagaTour);
    if (!next) {
      router.push("/finish");
      return;
    }
    if (sendThroughGate(router, next, "/handoff")) return;
    router.push("/handoff");
  }

  function onCelebrateDone() {
    completePoi(poi);
    setCelebrating(false);
    setQuestOpen(false);
  }

  const story = [poi.about, ...poi.aboutMore].filter(Boolean);

  return (
    <main
      className="view"
      aria-label="Place"
      data-quest-open={questOpen ? "true" : "false"}
    >
      <MapChip order={poi.order} total={total} />

      <div className="topbar">
        <Link href="/walk" className="place-back" aria-label="Back to walk">
          <ChevronLeftIcon />
        </Link>
        <p className="count">{poi.shortTitle}</p>
      </div>

      <div className="learn-body">
        <div className={`teach-block${solved ? " is-solved" : ""}`}>
          <TeachMedia poi={poi} solved={solved} />
        </div>

        {solved ? (
          <div className="reward-block">
            <p className="reveal">{poi.quest.reveal}</p>
          </div>
        ) : null}

        {story.length > 0 ? (
          <div className="place-story">
            <h2 className="story-kicker">The story</h2>
            <div>
              {story.map((paragraph) => (
                <p key={paragraph} className="prose">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="learn-dock">
        <Btn onClick={solved ? continueWalk : openQuest}>{dockLabel}</Btn>
      </div>

      <QuestSheet
        quest={poi.quest}
        action={poi.action}
        open={questOpen}
        session={session}
        onClose={() => setQuestOpen(false)}
        onCorrect={() => setCelebrating(true)}
      />
      <CorrectCelebrate active={celebrating} onDone={onCelebrateDone} />
    </main>
  );
}
