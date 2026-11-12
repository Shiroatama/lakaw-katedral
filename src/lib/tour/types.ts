/**
 * Quest shared fields. A quest is tap-only: the visitor never types.
 * The answer comes from looking at the place or from its on-page story.
 */
export type QuestBase = {
  /** Where to look. Shown first, normal weight. */
  look: string;
  /** The ask itself. Shown bold after `look`. */
  question: string;
  /** What the answer means. Shown on the page after a correct answer. */
  reveal: string;
  /** Gentle nudges for misses 1, 2, 3. Three or more lines. */
  nudges: string[];
};

/** Finish the line by tapping a chip. */
export type ClozeQuest = QuestBase & {
  type: "cloze";
  cloze: { before: string; after?: string; answer: string; chips: string[] };
};

/** Put three story beats in order. `orderItems` is the right order. */
export type OrderQuest = QuestBase & {
  type: "order";
  orderItems: [string, string, string];
};

/** Count with a stepper. */
export type CountQuest = QuestBase & {
  type: "count";
  count: { min: number; max: number; answer: number };
};

/** Tap every option that is true. */
export type SelectAllQuest = QuestBase & {
  type: "select_all";
  selectAll: { options: string[]; answers: string[] };
};

/** One pick from a small grid. Fallback format. */
export type ChoiceQuest = QuestBase & {
  type: "choice";
  choices: string[];
  answer: string;
};

export type PlaceQuest =
  | ClozeQuest
  | OrderQuest
  | CountQuest
  | SelectAllQuest
  | ChoiceQuest;

export type PlaceQuestType = PlaceQuest["type"];

export type Poi = {
  id: string;
  /** Readable URL segment, e.g. "mural" -> /s/mural. Typeable by hand. */
  slug: string;
  order: number;
  title: string;
  /** One word for the floor plan label, e.g. "Statue". */
  shortTitle: string;
  heroImage: string;
  /**
   * Optional muted autoplay loop for the teach media slot.
   * `heroImage` remains the offline still (and the poster, unless
   * `heroVideoPoster` is set).
   */
  heroVideo?: string;
  /**
   * How this place frames `heroVideo`. Landscape is 16:9. Portrait is 3:4
   * on the page.
   */
  heroVideoFrame?: "landscape" | "portrait";
  /** Poster for `heroVideo` when it should not use `heroImage`. */
  heroVideoPoster?: string;
  /**
   * Editorial story images paired with `aboutMore` (same order).
   * Kept for a future photo story. The prototype story is a prose list.
   */
  storyImages: string[];
  /** Plain-words directions to this place's sign / QR code. */
  landmark: string;
  /** What is here. Short; first line of the story. Descriptive only. */
  about: string;
  /**
   * Extra history and meaning as short story beats (one string per beat).
   * Shown as prose under the media, after `about`. Descriptive only.
   * Everything a quest asks must be knowable from the story or by looking.
   */
  aboutMore: string[];
  /** Imperative quest action: pray, look, pause, and so on. */
  action: string;
  /** Tap-only quest. Solving it marks the place complete. */
  quest: PlaceQuest;
  /** Compound overview pin, in the shared 280×360 map viewBox. */
  map: { x: number; y: number };
};

/**
 * Fresh-visit home copy: welcome, walk invite, then prize line.
 * `fact` may use `\n` for two short lines.
 */
export type TourIntro = {
  hook: string;
  /** Short invite to walk and learn about the cathedral. */
  fact: string;
  /** Closing invite (prize / next step). */
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
 * the quest is solved. Stops open in order: only the next unsolved place can
 * be completed (see SPEC §4.2).
 */
export type ScanOutcome =
  /**
   * This is not the next place to solve. Progress is unchanged. The visitor
   * is pointed toward `expected`.
   */
  | { kind: "start_here"; poi: Poi; expected: Poi }
  /** First arrival at the next place to solve (not yet solved). */
  | { kind: "advance"; poi: Poi; progress: number }
  /** Stop already solved. Reopens as story and reveal. */
  | { kind: "replay"; poi: Poi }
  /** Whole journey already finished. */
  | { kind: "completed"; poi: Poi };
