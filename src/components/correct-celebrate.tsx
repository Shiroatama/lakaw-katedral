"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FinishConfetti } from "@/components/finish-confetti";
import { playCorrectSound } from "@/lib/correct-sound";
import { useHydrated } from "@/lib/use-hydrated";

/** How long the black + sticker celebrate stays up. */
export const CORRECT_CELEBRATE_MS = 1800;

type CorrectCelebrateProps = {
  active: boolean;
  onDone?: () => void;
};

/**
 * Full-screen game beat when a quest answer is correct: dimmed blur wash, bold
 * green die-cut "CORRECT" sticker, then confetti.
 */
export function CorrectCelebrate({ active, onDone }: CorrectCelebrateProps) {
  const hydrated = useHydrated();
  const titleId = useId();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setLeaving(false);
      return;
    }

    setVisible(true);
    setLeaving(false);
    setBurstKey((key) => key + 1);
    playCorrectSound();

    const leaveAt = window.setTimeout(() => setLeaving(true), CORRECT_CELEBRATE_MS - 280);
    const doneAt = window.setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      onDoneRef.current?.();
    }, CORRECT_CELEBRATE_MS);

    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(doneAt);
    };
  }, [active]);

  if (!hydrated || !visible) return null;

  return createPortal(
    <div
      className={`correct-celebrate fixed inset-0 z-[70] flex items-center justify-center px-6${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
    >
      <div className="correct-celebrate-backdrop absolute inset-0" aria-hidden />
      <FinishConfetti active palette="correct" burstKey={burstKey} />
      <p id={titleId} className="correct-sticker relative z-10">
        Correct
        <span className="correct-sticker-spark correct-sticker-spark--a" aria-hidden />
        <span className="correct-sticker-spark correct-sticker-spark--b" aria-hidden />
      </p>
    </div>,
    document.body,
  );
}
