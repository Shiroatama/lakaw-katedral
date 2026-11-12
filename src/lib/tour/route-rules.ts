import type { JourneyProgress, Poi, ScanOutcome, Tour } from "./types";

export function createInitialProgress(tour: Tour): JourneyProgress {
  return {
    tourId: tour.id,
    tourVersion: tour.version,
    startedAt: null,
    completed: [],
    lastScannedPoiId: null,
    finishedAt: null,
    donated: false,
  };
}

export function isJourneyStarted(progress: JourneyProgress): boolean {
  return progress.startedAt !== null;
}

export function isJourneyComplete(
  progress: JourneyProgress,
  tour: Tour,
): boolean {
  return tour.pois.every((poi) => progress.completed.includes(poi.id));
}

/** The first stop, in route order, that has not been solved yet. */
export function getNextExpectedPoi(
  progress: JourneyProgress,
  tour: Tour,
): Poi | null {
  const ordered = [...tour.pois].sort((a, b) => a.order - b.order);
  return (
    ordered.find((poi) => !progress.completed.includes(poi.id)) ?? null
  );
}

export function getEntrancePoi(tour: Tour): Poi {
  const ordered = [...tour.pois].sort((a, b) => a.order - b.order);
  const entrance = ordered[0];
  if (!entrance) {
    throw new Error("Tour has no POIs");
  }
  return entrance;
}

/**
 * Evaluate a stop visit (SPEC §4.2).
 *
 * Places open in order. Only the next unsolved place can be completed.
 * Opening any other unsolved place points the visitor toward the expected
 * stop. Arrival at the expected place starts the walk (if needed) and sets
 * "you are here"; the place counts as complete only after the quest is
 * solved. Solved places reopen as story and reveal.
 *
 * Pure function: no framework imports, reusable by a future Expo app.
 */
export function evaluateScan(
  poi: Poi,
  progress: JourneyProgress,
  tour: Tour,
): ScanOutcome {
  if (isJourneyComplete(progress, tour)) {
    return { kind: "completed", poi };
  }

  if (progress.completed.includes(poi.id)) {
    return { kind: "replay", poi };
  }

  const expected = getNextExpectedPoi(progress, tour);
  if (!expected || expected.id !== poi.id) {
    return {
      kind: "start_here",
      poi,
      expected: expected ?? getEntrancePoi(tour),
    };
  }

  return {
    kind: "advance",
    poi,
    progress: progress.completed.length,
  };
}

/**
 * Record arrival at a place. Does not mark the place complete; that waits
 * for a solved quest (`applyQuestSuccess`).
 * `start_here` leaves progress unchanged (not a real visit).
 */
export function applyScanOutcome(
  progress: JourneyProgress,
  outcome: ScanOutcome,
): JourneyProgress {
  if (outcome.kind === "start_here") {
    return progress;
  }

  const next: JourneyProgress = {
    ...progress,
    lastScannedPoiId: outcome.poi.id,
  };

  if (outcome.kind !== "advance") {
    return next;
  }

  return {
    ...next,
    startedAt: progress.startedAt ?? new Date().toISOString(),
  };
}

/**
 * Mark a place complete after a solved quest.
 * Only the next unsolved place in order can be completed. Idempotent if the
 * place is already in `completed`.
 */
export function applyQuestSuccess(
  progress: JourneyProgress,
  poi: Poi,
  tour: Tour,
): JourneyProgress {
  if (progress.completed.includes(poi.id)) {
    return {
      ...progress,
      lastScannedPoiId: poi.id,
      startedAt: progress.startedAt ?? new Date().toISOString(),
    };
  }

  const expected = getNextExpectedPoi(progress, tour);
  if (!expected || expected.id !== poi.id) {
    return progress;
  }

  const completed = [...progress.completed, poi.id];
  const finished =
    completed.length === tour.pois.length
      ? new Date().toISOString()
      : progress.finishedAt;

  return {
    ...progress,
    lastScannedPoiId: poi.id,
    startedAt: progress.startedAt ?? new Date().toISOString(),
    completed,
    finishedAt: finished,
  };
}

/** How a pin or place reads on the Walk board. */
export type PlaceState = "done" | "next" | "locked";

export function getPlaceState(
  poi: Poi,
  progress: JourneyProgress,
  tour: Tour,
): PlaceState {
  if (progress.completed.includes(poi.id)) return "done";
  const next = getNextExpectedPoi(progress, tour);
  return next?.id === poi.id ? "next" : "locked";
}

/** The place solved just before `poi` (or null for place 1). */
export function getPreviousPoi(poi: Poi, tour: Tour): Poi | null {
  return tour.pois.find((p) => p.order === poi.order - 1) ?? null;
}

/**
 * True when `poi` is the furthest solved place. Reopening it offers
 * "Next place"; older places offer "Continue the walk".
 */
export function isLatestSolved(
  poi: Poi,
  progress: JourneyProgress,
): boolean {
  return (
    progress.completed.includes(poi.id) &&
    poi.order === progress.completed.length
  );
}

/** Points stub until a real currency exists: 10 per solved place. */
export const POINTS_PER_PLACE = 10;

export function getPoints(progress: JourneyProgress): number {
  return progress.completed.length * POINTS_PER_PLACE;
}
