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

/** The first stop, in route order, that has not been visited yet. */
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
 * Order is a suggestion, not a gate: any stop shows its full story and counts
 * toward completion. This keeps the walk forgiving when a visitor enters from
 * a side door, drifts in a crowd, or loses local progress by opening a link in
 * a different browser.
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
  return {
    kind: "advance",
    poi,
    progress: progress.completed.length + 1,
    suggested: expected && expected.id !== poi.id ? expected : null,
  };
}

export function applyScanOutcome(
  progress: JourneyProgress,
  outcome: ScanOutcome,
  tour: Tour,
): JourneyProgress {
  const next: JourneyProgress = {
    ...progress,
    lastScannedPoiId: outcome.poi.id,
  };

  if (outcome.kind !== "advance") {
    return next;
  }

  const completed = progress.completed.includes(outcome.poi.id)
    ? progress.completed
    : [...progress.completed, outcome.poi.id];
  const finished =
    completed.length === tour.pois.length
      ? new Date().toISOString()
      : progress.finishedAt;
  return {
    ...next,
    startedAt: progress.startedAt ?? new Date().toISOString(),
    completed,
    finishedAt: finished,
  };
}
