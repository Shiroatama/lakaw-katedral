"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PrimaryButton } from "@/components/ui";
import {
  readFinishSuccessSeen,
  writeFinishSuccessSeen,
} from "@/lib/tour/finish-success";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Big celebrate dialog on /finish. Opens on first arrival after the walk is
 * done; Continue dismisses it so next ideas and the gift sit underneath.
 */
export function FinishSuccessModal({ open: allowed }: { open: boolean }) {
  const hydrated = useHydrated();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hydrated || !allowed) return;
    setDismissed(readFinishSuccessSeen());
  }, [hydrated, allowed]);

  const open = hydrated && allowed && dismissed === false;

  function dismiss() {
    writeFinishSuccessSeen();
    setDismissed(true);
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
      ?.querySelector<HTMLElement>("a, button")
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
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="confirm-panel relative flex w-full max-w-md flex-col items-center rounded-2xl bg-[var(--surface)] px-6 pb-7 pt-10 text-center shadow-[0_20px_56px_rgba(42,33,28,0.28)] ring-1 ring-[var(--border)] outline-none"
      >
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
          Thank you for walking with us through every place.
        </p>
        <div className="mt-7 w-full">
          <PrimaryButton onClick={dismiss}>Continue</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
