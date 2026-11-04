"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FinishConfetti } from "@/components/finish-confetti";
import { PrimaryButton } from "@/components/ui";

import {
  readFinishSuccessSeen,
  writeFinishSuccessSeen,
} from "@/lib/tour/finish-success";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Wait for the last-place map head celebrate (percent → 100% → check) before
 * covering the stop with this dialog. Keep in sync with map-bubble timers:
 * HEAD_SWAP_MS + RING_ADVANCE_MS + FINISH_PERCENT_HOLD_MS + FINISH_CHECK_HOLD_MS.
 */
export const FINISH_SUCCESS_OPEN_DELAY_MS = 360 + 2000 + 1000 + 2000;

/**
 * Big celebrate dialog after the last quest is solved. Opens on the last place
 * (not on /finish) once the map head celebrate has played. Continue goes to
 * the finish page. Shown once per session until Start over.
 */
export function FinishSuccessModal({
  open: allowed,
  openDelayMs = FINISH_SUCCESS_OPEN_DELAY_MS,
}: {
  open: boolean;
  /** Delay before the dialog appears. 0 opens immediately (e.g. Finish tap). */
  openDelayMs?: number;
}) {
  const hydrated = useHydrated();
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated || !allowed) {
      setReady(false);
      return;
    }
    const seen = readFinishSuccessSeen();
    setDismissed(seen);
    if (seen) {
      setReady(false);
      return;
    }
    if (openDelayMs <= 0) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), openDelayMs);
    return () => window.clearTimeout(id);
  }, [hydrated, allowed, openDelayMs]);

  const open = hydrated && allowed && dismissed === false && ready;

  function dismiss() {
    writeFinishSuccessSeen();
    setDismissed(true);
  }

  function continueToFinish() {
    writeFinishSuccessSeen();
    setDismissed(true);
    router.push("/finish", { transitionTypes: ["nav-forward"] });
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        writeFinishSuccessSeen();
        setDismissed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>('a, button:not([aria-label="Close"])')
      ?.focus({ preventScroll: true });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!hydrated) return null;

  return createPortal(
    <div
      className="confirm-root fixed inset-0 z-[60] flex items-center justify-center px-4"
      data-open={open ? "true" : "false"}
      inert={!open ? true : undefined}
      aria-hidden={!open}
    >
      <div
        className="confirm-backdrop absolute inset-0 bg-[var(--foreground)]/45 backdrop-blur-[3px]"
        aria-hidden
        onClick={dismiss}
      />
      <FinishConfetti active={open} burstKey={ready ? 1 : 0} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="confirm-panel relative z-10 flex w-full max-w-md flex-col items-center rounded-2xl bg-[var(--surface)] px-6 pb-7 pt-10 text-center shadow-[0_20px_56px_rgba(42,33,28,0.28)] ring-1 ring-[var(--border)] outline-none"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center text-3xl leading-none text-[var(--foreground)] transition-transform duration-200 ease-[var(--ease-out)] active:scale-90"
          aria-label="Close"
        >
          ×
        </button>
        <div
          className="pop-in mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--success)] text-white shadow-[0_10px_28px_rgba(79,107,74,0.35)]"
          style={{ "--delay": "60ms" } as React.CSSProperties}
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="h-16 w-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2
          id={titleId}
          className="font-display text-3xl leading-tight text-[var(--success)] sm:text-4xl"
        >
          You finished the walk
        </h2>
        <p
          id={descriptionId}
          className="mt-3 max-w-sm text-lg leading-snug text-[var(--muted-fg)]"
        >
          Thank you for walking with us through every place. A small surprise
          prize from the church is waiting for you.
        </p>
        <div className="mt-7 w-full">
          <PrimaryButton onClick={continueToFinish}>Continue</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
