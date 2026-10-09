export type Poi = {
  id: string;
  /** Readable URL segment, e.g. "mural" -> /s/mural. Typeable by hand. */
  slug: string;
  order: number;
  title: string;
  /** One word for the floor plan label, e.g. "Statue". */
  shortTitle: string;
  heroImage: string;
  /** Plain-words directions to this place's sign / QR code. */
  landmark: string;
  /** What is here. Descriptive only; no instructions. */
  about: string;
  /** Call to action in the dark card: pray, look, pause, and so on. */
  action: string;
  /** One short interesting fact below the action. */
  fact: string;
  map: { x: number; y: number };
};

/**
 * Fresh-visit home copy (Layout C: welcome, fact first, then invite).
 * `fact` may use `\n` for two short impact lines.
 */
export type TourIntro = {
  hook: string;
  /** Drawn from the parish pilgrim guide welcome; keep claims aligned with docs/PILGRIM-GUIDE.md. */
  fact: string;
  /** Soft "Find out…" invite under the fact. */
  teasers: string;
};

/**
 * Quiet institutional crest on Home (upper left).
 */
export type TourSteward = {
  /** Exact institutional name (used for alt text). */
  name: string;
  /** Crest / logo under /public. */
  logo: string;
};

export type Tour = {
  id: string;
  version: number;
  name: string;
  siteName: string;
  steward: TourSteward;
  intro: TourIntro;
  pois: Poi[];
};

export type JourneyProgress = {
  tourId: string;
  tourVersion: number;
  startedAt: string | null;
  completed: string[];
  lastScannedPoiId: string | null;
  finishedAt: string | null;
  donated: boolean;
};

/**
 * Result of visiting a stop. Every stop always shows its full story; order is
 * a suggestion, not a gate (see SPEC §4.2).
 */
export type ScanOutcome =
  /** First visit to this stop. `suggested` is the stop the route expected instead, or null if in order. */
  | { kind: "advance"; poi: Poi; progress: number; suggested: Poi | null }
  /** Stop already visited. */
  | { kind: "replay"; poi: Poi }
  /** Whole journey already finished. */
  | { kind: "completed"; poi: Poi };
