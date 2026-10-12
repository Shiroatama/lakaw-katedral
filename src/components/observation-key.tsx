"use client";

import { useEffect, useId, useState } from "react";
import type { Poi } from "@/lib/tour";
import {
  getNextExpectedPoi,
  isJourneyComplete,
  nagaTour,
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

/**
 * Fixed flare recipe: few bits, preset directions, palette from design tokens.
 * Kept tiny so low-end phones only paint a short CSS animation once.
 */
const FLARE_BITS = [
  { fx: "-28px", fy: "-42px", fr: "-40deg", color: "var(--success-on-dark)", fd: "0ms" },
  { fx: "8px", fy: "-48px", fr: "18deg", color: "var(--ceremonial)", fd: "40ms" },
  { fx: "36px", fy: "-36px", fr: "55deg", color: "var(--accent)", fd: "20ms" },
  { fx: "-42px", fy: "-18px", fr: "-70deg", color: "var(--ceremonial)", fd: "60ms" },
  { fx: "48px", fy: "-12px", fr: "80deg", color: "var(--success-on-dark)", fd: "30ms" },
  { fx: "-18px", fy: "-56px", fr: "-12deg", color: "var(--accent)", fd: "70ms" },
  { fx: "22px", fy: "-58px", fr: "28deg", color: "var(--ceremonial)", fd: "10ms" },
  { fx: "-50px", fy: "-34px", fr: "-95deg", color: "var(--success-on-dark)", fd: "50ms" },
  { fx: "54px", fy: "-30px", fr: "100deg", color: "var(--accent)", fd: "80ms" },
  { fx: "0px", fy: "-62px", fr: "8deg", color: "var(--ceremonial)", fd: "25ms" },
  { fx: "-34px", fy: "-50px", fr: "-48deg", color: "var(--accent)", fd: "55ms" },
  { fx: "40px", fy: "-46px", fr: "62deg", color: "var(--success-on-dark)", fd: "35ms" },
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
  /** One-shot burst on the moment of success, not on revisit. */
  const [flare, setFlare] = useState(false);

  useEffect(() => {
    if (!flare) return;
    const timer = window.setTimeout(() => setFlare(false), 1000);
    return () => window.clearTimeout(timer);
  }, [flare]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (solved) return;

    const ok = completePoi(poi, value);
    if (ok) {
      setError(null);
      setValue("");
      setFlare(true);
      return;
    }

    setError("Not yet. Look again, then try once more.");
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  }

  const proceedHint = journeyDone
    ? "You can finish the walk now. Tap Finish below when you are ready."
    : next
      ? `You can go on. Tap Find place ${next.order} below when you are ready.`
      : "You can go on when you are ready.";

  return (
    <aside
      className={`rounded-xl bg-[var(--foreground)] px-5 py-4 text-[var(--accent-fg)]${shake ? " observation-shake" : ""}`}
    >
      <h2 className="text-base font-bold">Your quest</h2>

      <div className="mt-3 space-y-3">
        <p className="text-sm leading-relaxed text-[var(--accent-fg)]/90">
          {poi.action}
        </p>
        <p className="text-sm leading-relaxed text-[var(--accent-fg)]/90">
          Then {asContinuation(poi.observation.look)}{" "}
          <span className="font-semibold text-[var(--accent-fg)]">
            {poi.observation.question}
          </span>
        </p>
      </div>

      {solved ? (
        <div className="relative mt-4 space-y-2" role="status">
          {flare ? (
            <div className="quest-flare" aria-hidden>
              {FLARE_BITS.map((bit, index) => (
                <span
                  key={index}
                  className="quest-flare-bit"
                  style={
                    {
                      "--fx": bit.fx,
                      "--fy": bit.fy,
                      "--fr": bit.fr,
                      "--fd": bit.fd,
                      "--flare-color": bit.color,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}
          <p className="text-sm font-semibold text-[var(--success-on-dark)]">
            You are right.
          </p>
          <p className="text-sm leading-relaxed text-[var(--accent-fg)]/90">
            {poi.observation.reveal}
          </p>
          <p className="text-sm leading-relaxed text-[var(--accent-fg)]/80">
            {proceedHint}
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-2"
          aria-describedby={error ? `${inputId}-error` : undefined}
        >
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
            className="min-h-12 w-full rounded-md border border-white/20 bg-white/10 px-3 text-base text-[var(--accent-fg)] outline-none ring-[var(--accent)] placeholder:text-[var(--accent-fg)]/45 focus:ring-2"
            aria-invalid={error ? true : undefined}
          />

          {error ? (
            <p
              id={`${inputId}-error`}
              className="text-sm text-[var(--accent)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 text-base font-semibold text-[var(--accent-fg)] shadow-[0_4px_16px_rgba(184,92,56,0.35)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97]"
          >
            Check answer
          </button>
        </form>
      )}
    </aside>
  );
}
