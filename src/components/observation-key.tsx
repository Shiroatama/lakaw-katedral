"use client";

import { useId, useState } from "react";
import {
  CORRECT_CELEBRATE_MS,
  CorrectCelebrate,
} from "@/components/correct-celebrate";
import type { Poi } from "@/lib/tour";
import {
  getNextExpectedPoi,
  isJourneyComplete,
  nagaTour,
  nextPlaceCtaLabel,
  useJourneyStore,
} from "@/lib/tour";

type ObservationKeyFormProps = {
  poi: Poi;
};

/** Lowercase the first letter so the line reads as one sentence after "Then". */
function asContinuation(text: string) {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Scroll target for the dock's "Solve the quest" control. */
export const QUEST_ANCHOR_ID = "your-quest";

/** Wrong submits before the gentle answer reveal. Place stays unsolved. */
const MISS_LIMIT = 5;

/**
 * Nudges for misses 1–4. The 5th miss reveals the answer (form stays open;
 * place does not auto-complete). Last line foreshadows help.
 */
const MISS_NUDGES = [
  "Not quite. Look again.",
  "Try again. You can do it.",
  "Still hiding. Check the clue once more.",
  "One more try, then we'll show you.",
] as const;

/**
 * One quest card: do the act, then answer the look-closely clue.
 * A correct answer keeps the quest text and adds the meaning reveal below.
 */
export function ObservationKeyForm({ poi }: ObservationKeyFormProps) {
  const inputId = useId();
  const progress = useJourneyStore();
  const completePoi = useJourneyStore((s) => s.completePoi);
  const solved = progress.completed.includes(poi.id);
  const journeyDone = isJourneyComplete(progress, nagaTour);
  const next = getNextExpectedPoi(progress, nagaTour);

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  /** Wrong submits this visit. Resets when the place remounts. */
  const [misses, setMisses] = useState(0);
  /** One-shot celebrate on the moment of success, not on revisit. */
  const [celebrate, setCelebrate] = useState(false);
  /** Keep the reveal pop until the sticker overlay finishes. */
  const [justSolved, setJustSolved] = useState(false);

  const answerRevealed = misses >= MISS_LIMIT;
  const canonicalAnswer = poi.observation.answers[0] ?? "";

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (solved) return;

    if (!value.trim()) {
      setError("Type an answer first.");
      return;
    }

    const ok = completePoi(poi, value);
    if (ok) {
      setError(null);
      setValue("");
      setCelebrate(true);
      setJustSolved(true);
      return;
    }

    const nextMisses = Math.min(misses + 1, MISS_LIMIT);
    setMisses(nextMisses);
    setValue("");
    setShake(true);
    window.setTimeout(() => setShake(false), 400);

    if (nextMisses >= MISS_LIMIT) {
      setError(null);
      return;
    }

    setError(MISS_NUDGES[nextMisses - 1]);
  }

  const proceedHint = journeyDone
    ? "You finished every place. A short celebration is next."
    : next
      ? `You can go on. Tap "${nextPlaceCtaLabel(next)}" below when you are ready.`
      : "You can go on when you are ready.";

  return (
    <aside
      id={QUEST_ANCHOR_ID}
      tabIndex={-1}
      className={`scroll-mt-4 rounded-xl bg-[var(--foreground)] px-5 py-5 outline-none${shake ? " observation-shake" : ""}`}
    >
      <CorrectCelebrate
        active={celebrate}
        onDone={() => {
          setCelebrate(false);
          window.setTimeout(() => setJustSolved(false), 500);
        }}
      />

      <h2 className="text-lg font-bold uppercase tracking-[0.14em] text-[var(--ceremonial)]">
        Your quest
      </h2>

      <div className="mt-3 space-y-3">
        <p className="text-base leading-relaxed text-[var(--accent-fg)]">
          {poi.action}
        </p>
        <p className="text-base leading-relaxed text-[var(--accent-fg)]">
          Then {asContinuation(poi.observation.look)}{" "}
          <span className="font-semibold">{poi.observation.question}</span>
        </p>
      </div>

      {solved ? (
        <div className="mt-5 space-y-3" role="status">
          <p
            className={`font-display text-3xl leading-tight text-[var(--success-on-dark)] sm:text-4xl${justSolved ? " pop-in" : ""}`}
            style={
              justSolved
                ? ({ "--delay": `${CORRECT_CELEBRATE_MS}ms` } as React.CSSProperties)
                : undefined
            }
          >
            You are right.
          </p>
          <p className="text-base leading-relaxed text-[var(--accent-fg)]">
            {poi.observation.reveal}
          </p>
          <p className="text-sm leading-relaxed text-[var(--stone-light)]">
            {proceedHint}
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-2"
          aria-describedby={
            error
              ? `${inputId}-error`
              : answerRevealed
                ? `${inputId}-answer`
                : undefined
          }
        >
          {answerRevealed && canonicalAnswer ? (
            <p
              id={`${inputId}-answer`}
              className="text-base leading-relaxed text-[var(--accent-fg)]"
              role="status"
            >
              Answer:{" "}
              <span className="font-semibold text-[var(--ceremonial)]">
                {canonicalAnswer}
              </span>
            </p>
          ) : null}

          <label htmlFor={inputId} className="sr-only">
            Your answer
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Type your answer"
            className="min-h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-base text-[var(--foreground)] outline-none ring-[var(--accent)] placeholder:text-[var(--muted-fg)]/60 focus:ring-2"
            aria-invalid={error ? true : undefined}
          />

          {error ? (
            <p
              id={`${inputId}-error`}
              className="text-sm text-[var(--accent-fg)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 text-base font-semibold text-[var(--accent-fg)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97]"
          >
            Submit answer
          </button>
        </form>
      )}
    </aside>
  );
}
