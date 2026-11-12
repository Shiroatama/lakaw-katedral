"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";
import { createPortal } from "react-dom";
import { FinishConfetti } from "@/components/finish-confetti";
import { playCorrectSound } from "@/lib/correct-sound";
import { useHydrated } from "@/lib/use-hydrated";

/** How long the dimmed wash and sticker stay up. */
export const CORRECT_CELEBRATE_MS = 1800;

type CorrectCelebrateProps = {
  active: boolean;
  onDone?: () => void;
};

/**
 * Full-screen game beat when a quest answer is correct: dimmed blur wash, bold
 * green die-cut "CORRECT" sticker, then confetti. Mounts only while `active`,
 * so every correct answer starts a fresh beat.
 */
export function CorrectCelebrate({ active, onDone }: CorrectCelebrateProps) {
  const hydrated = useHydrated();
  if (!hydrated || !active) return null;
  return createPortal(<Beat onDone={onDone} />, document.body);
}

function Beat({ onDone }: { onDone?: () => void }) {
  const titleId = useId();
  const [leaving, setLeaving] = useState(false);
  const finish = useEffectEvent(() => onDone?.());

  useEffect(() => {
    playCorrectSound();
    const leaveAt = window.setTimeout(
      () => setLeaving(true),
      CORRECT_CELEBRATE_MS - 280,
    );
    const doneAt = window.setTimeout(() => finish(), CORRECT_CELEBRATE_MS);
    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(doneAt);
    };
  }, []);

  return (
    <div
      className={`correct-celebrate fixed inset-0 z-[70] flex items-center justify-center px-6${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
    >
      <div className="correct-celebrate-backdrop absolute inset-0" aria-hidden />
      <FinishConfetti active palette="correct" />
      <p id={titleId} className="correct-sticker relative z-10">
        Correct
        <span className="correct-sticker-spark correct-sticker-spark--a" aria-hidden />
        <span className="correct-sticker-spark correct-sticker-spark--b" aria-hidden />
      </p>
    </div>
  );
}
