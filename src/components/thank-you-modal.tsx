"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useJourneyStore } from "@/lib/tour";
import { PrimaryButton } from "@/components/ui";
import { useHydrated } from "@/lib/use-hydrated";

/** Centered reward acknowledgment after a gift. Backdrop is non-dismissible. */
export function ThankYouModal() {
  const router = useRouter();
  const hydrated = useHydrated();
  const donated = useJourneyStore((s) => s.donated);
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = hydrated && donated;

  useEffect(() => {
    if (!open) return;
    const goHome = () => {
      router.push("/", { transitionTypes: ["nav-back"] });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") goHome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

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
      className="confirm-root fixed inset-0 z-[60] flex items-center justify-center px-5"
      data-open={open ? "true" : "false"}
      inert={!open ? true : undefined}
      aria-hidden={!open}
    >
      <div
        className="confirm-backdrop absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="confirm-panel relative w-full max-w-sm rounded-xl bg-[var(--surface)] px-5 py-5 text-center shadow-[0_16px_48px_rgba(42,33,28,0.22)] ring-1 ring-[var(--border)] outline-none"
      >
        <div
          className="gold-rule mx-auto mb-4 h-px w-full max-w-[8rem] bg-[var(--ceremonial)]/70"
          aria-hidden
        />
        <h2
          id={titleId}
          className="font-display text-2xl leading-tight text-[var(--foreground)]"
        >
          Thank you
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-base leading-relaxed text-[var(--muted-fg)]"
        >
          You walked every place, and you helped the parish. That means a lot.
        </p>
        <div className="mt-5">
          <PrimaryButton href="/" direction="back">
            Home
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
