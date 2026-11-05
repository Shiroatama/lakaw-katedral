"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CorrectCelebrate } from "@/components/correct-celebrate";
import { CloseIcon } from "@/components/icons";
import type { Poi } from "@/lib/tour";
import {
  getNextExpectedPoi,
  isJourneyComplete,
  nagaTour,
  nextPlaceCtaLabel,
  useJourneyStore,
} from "@/lib/tour";
import { useHydrated } from "@/lib/use-hydrated";

type QuestSheetProps = {
  poi: Poi;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Lowercase the first letter so the line reads as one sentence after "Then". */
function asContinuation(text: string) {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

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
 * Bottom sheet for the place quest: do the act, then answer the look-closely
 * clue. Opens from Solve the quest; a correct answer keeps the sheet open with
 * the meaning reveal until the visitor dismisses it.
 */
export function QuestSheet({ poi, open, onOpenChange }: QuestSheetProps) {
  const hydrated = useHydrated();
  const titleId = useId();
  const inputId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

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

  const answerRevealed = misses >= MISS_LIMIT;
  const canonicalAnswer = poi.observation.answers[0] ?? "";

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      panelRef.current?.focus({ preventScroll: true });
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

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

  if (!hydrated) return null;

  return createPortal(
    <div
      className="quest-sheet-root pointer-events-none fixed inset-0 z-40"
      data-open={open}
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className="quest-sheet-backdrop pointer-events-auto absolute inset-0 z-0 bg-[var(--foreground)]/60 backdrop-blur-[3px]"
        aria-label="Close quest"
        onClick={() => onOpenChange(false)}
      />
      {/* Hitbox wrapper: stop backdrop clicks from closing when interacting
          with the panel (focusing the answer input, scrolling, etc.). */}
      <div
        className="pointer-events-auto absolute inset-x-3 bottom-[calc(var(--action-bar-space)+0.55rem)] top-[var(--top-chrome-space)] z-10 mx-auto flex w-[calc(100%-1.5rem)] max-w-lg flex-col justify-end md:max-w-4xl"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`quest-sheet-panel flex max-h-full w-full flex-col overflow-y-auto rounded-xl bg-[var(--foreground)] px-5 pb-5 pt-4 shadow-[0_12px_40px_rgba(42,33,28,0.4)] outline-none${shake ? " observation-shake" : ""}`}
        >
          <CorrectCelebrate
            active={celebrate}
            onDone={() => setCelebrate(false)}
          />

          <div className="flex shrink-0 items-center justify-between gap-3">
            <h2
              id={titleId}
              className="text-lg font-bold leading-none uppercase tracking-[0.14em] text-[var(--ceremonial)]"
            >
              Your quest
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[var(--accent-fg)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-110 active:scale-90"
              aria-label="Close"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-1 space-y-3">
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
        </div>
      </div>
    </div>,
    document.body,
  );
}
