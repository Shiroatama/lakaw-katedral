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
 * Normalize a typed observation answer for comparison.
 * Lower case, trim, strip light punctuation, collapse spaces.
 */
export function normalizeObservationAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the typed answer matches any accepted answer for this place. */
export function isObservationCorrect(poi: Poi, raw: string): boolean {
  const guess = normalizeObservationAnswer(raw);
  if (!guess) return false;
  return poi.observation.answers.some(
    (answer) => normalizeObservationAnswer(answer) === guess,
  );
}

/**
 * Evaluate a stop visit (SPEC §4.2).
 *
 * Before the walk starts, only the entrance opens. After that, order is a
 * suggestion: any later stop shows its full story. Arrival (scan) starts the
 * walk and sets "you are here", but the place only counts as complete after
 * the observation key is solved.
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

  const entrance = getEntrancePoi(tour);
  if (!isJourneyStarted(progress) && poi.id !== entrance.id) {
    return { kind: "start_here", poi, entrance };
  }

  const expected = getNextExpectedPoi(progress, tour);
  return {
    kind: "advance",
    poi,
    progress: progress.completed.length,
    suggested: expected && expected.id !== poi.id ? expected : null,
  };
}

/**
 * Record arrival at a place. Does not mark the place complete; that waits
 * for a correct observation answer (`applyObservationSuccess`).
 * `start_here` leaves progress unchanged (teaser only; not a real visit).
 */
export function applyScanOutcome(
  progress: JourneyProgress,
  outcome: ScanOutcome,
  _tour: Tour,
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
 * Mark a place complete after a correct observation answer.
 * Idempotent if the place is already in `completed`.
 */
export function applyObservationSuccess(
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
