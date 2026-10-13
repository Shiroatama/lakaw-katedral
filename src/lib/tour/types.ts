/**
 * On-site clue that proves the pilgrim looked closely.
 * Compared with `normalizeObservationAnswer` (trim, lower case, light cleanup).
 */
export type ObservationKey = {
  /** Where to look. Shown after "Then", normal weight. */
  look: string;
  /** The ask itself. Shown bold. */
  question: string;
  /** Accepted answers after normalization. Keep several spellings. */
  answers: string[];
  /**
   * What the answer means. Shown under "You are right" after a correct
   * answer; the quest text above stays visible.
   */
  reveal: string;
};

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
  /** What is here. Short; always visible. Descriptive only; no instructions. */
  about: string;
  /**
   * Extra history and meaning behind "Read more". One string per paragraph.
   * Descriptive only; no instructions.
   */
  aboutMore: string[];
  /** Imperative quest: pray, look, pause, and so on. */
  action: string;
  /** Look-and-answer clue. Solving it marks the place complete. */
  observation: ObservationKey;
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
 * Result of arriving at a stop (scan). The place is marked complete only after
 * the observation key is solved. Stops open in order: only the next unsolved
 * place shows its full quest (see SPEC §4.2).
 */
export type ScanOutcome =
  /**
   * This is not the next place to solve. Show a teaser (hero + about) and a
   * gate toward `expected`. Progress is unchanged.
   */
  | { kind: "start_here"; poi: Poi; expected: Poi }
  /** First arrival at the next place to solve (not yet solved). */
  | { kind: "advance"; poi: Poi; progress: number }
  /** Stop already solved. */
  | { kind: "replay"; poi: Poi }
  /** Whole journey already finished. */
  | { kind: "completed"; poi: Poi };
