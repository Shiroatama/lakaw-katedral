export type Poi = {
  id: string;
  /** Readable URL segment, e.g. "murals" -> /s/murals. Typeable by hand. */
  slug: string;
  order: number;
  title: string;
  /** One word for the floor plan label, e.g. "Statue". */
  shortTitle: string;
  heroImage: string;
  /** Plain-words directions to this place's sign / QR code. */
  landmark: string;
  /** Short overview of what the visitor is looking at. */
  about: string;
  /** Optional callout below the overview. */
  fact?: string;
  /** Longer story of how this place came to be. */
  history: string;
  map: { x: number; y: number };
};

export type Tour = {
  id: string;
  version: number;
  name: string;
  siteName: string;
  intro: string;
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
