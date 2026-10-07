"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ALLOW_SKIP,
  getNextExpectedPoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { CathedralMap } from "@/components/cathedral-map";
import { useHydrated } from "@/lib/use-hydrated";

type MapBubbleProps = {
  /** Controlled open state (optional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Open on first render (e.g. deep link to /map) */
  defaultOpen?: boolean;
};

/** Split a landmark into numbered steps (one sentence per step). */
function landmarkSteps(landmark: string): string[] {
  return landmark
    .split(/(?<=\.)\s+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

/**
 * Circular map launcher with a progress ring. Opens the wayfinding sheet:
 * where the next place is (in words), the floor plan, and, in trial mode, a
 * button to skip the QR scan.
 *
 * The sheet is always mounted (portaled to <body>) and driven by `data-open`,
 * so it slides and fades both in and out. See `.sheet-*` in globals.css.
 */
export function MapBubble({
  open: openControlled,
  onOpenChange,
  defaultOpen = false,
}: MapBubbleProps) {
  const router = useRouter();
  const titleId = useId();
  const hydrated = useHydrated();
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const open = openControlled ?? openInternal;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const progress = useJourneyStore();
  const total = nagaTour.pois.length;
  const done = Math.min(progress.completed.length, total);
  const next = getNextExpectedPoi(progress, nagaTour);
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);

  function setOpen(nextOpen: boolean) {
    if (openControlled === undefined) setOpenInternal(nextOpen);
    onOpenChange?.(nextOpen);
  }

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (openControlled === undefined) setOpenInternal(false);
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openControlled, onOpenChange]);

  // Lock page scroll and manage focus while the sheet is open.
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
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Progress ring geometry
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total === 0 ? 0 : done / total;
  const dashOffset = circumference * (1 - pct);

  const sheet = (
    <div
      className="sheet-root fixed inset-0 z-40"
      data-open={open}
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className="sheet-backdrop absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-[2px]"
        aria-label="Close map"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-panel absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-md bg-[var(--background)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_rgba(42,33,28,0.18)] outline-none"
      >
        <div
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border)]"
          aria-hidden
        />
        <div className="sheet-item mb-3 flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]"
          >
            Where to go
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-lg text-[var(--foreground)] ring-1 ring-[var(--border)] transition-transform duration-200 ease-[var(--ease-out)] active:scale-90"
            aria-label="Close map"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
          {complete || !next ? (
            <>
              <p
                className="sheet-item text-base text-[var(--muted-fg)]"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                You finished! You have seen every place.
              </p>
              <div
                className="sheet-item"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                <CathedralMap highlightNext={false} />
              </div>
            </>
          ) : (
            <>
              <header
                className="sheet-item space-y-1"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                  {started ? "Next place" : "Start here"} · {next.order} of{" "}
                  {total}
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--foreground)]">
                  {next.title}
                </h3>
              </header>

              <div
                className="sheet-item"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                <CathedralMap />
              </div>

              <section
                className="sheet-item space-y-2"
                style={{ "--i": 3 } as React.CSSProperties}
                aria-label="Directions"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                  Directions
                </h4>
                <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-[var(--foreground)]/90">
                  {landmarkSteps(next.landmark).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="text-sm text-[var(--muted-fg)]">
                  Scan the QR code there to read the story.
                </p>
              </section>
            </>
          )}
        </div>

        {!complete ? (
          <div
            className="sheet-item shrink-0 space-y-1.5 border-t border-[var(--border)] pt-3"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/scan", { transitionTypes: ["nav-forward"] });
              }}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-fg)] shadow-[0_4px_16px_rgba(184,92,56,0.35)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97]"
            >
              Scan with this phone
            </button>
            {ALLOW_SKIP && started && next ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/s/${next.slug}`, {
                      transitionTypes: ["nav-forward"],
                    });
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-dashed border-[var(--stone)] bg-transparent px-5 text-base font-medium text-[var(--stone)] transition-[transform,background-color] duration-200 ease-[var(--ease-out)] hover:bg-[var(--surface)] active:scale-[0.98]"
                >
                  Skip the scan: open place {next.order}
                </button>
                <p className="text-center text-xs text-[var(--muted-fg)]">
                  For testing only. This button will go away.
                </p>
              </>
            ) : (
              <p className="text-center text-xs text-[var(--muted-fg)]">
                Or open the code with your phone&apos;s camera app.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] shadow-[0_4px_16px_rgba(42,33,28,0.18)] ring-1 ring-[var(--border)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(42,33,28,0.22)] active:scale-95"
        aria-label={`Open map. You have seen ${done} of ${total} places.`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--stone-light)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="ring-fill transition-[stroke-dashoffset] duration-700 ease-[var(--ease-out)]"
            style={{ "--ring-circ": circumference } as React.CSSProperties}
          />
        </svg>
        <span className="relative z-10 flex flex-col items-center leading-none">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
            Map
          </span>
          <span className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
            <span key={done} className="count-pop">
              {done}
            </span>
            /{total}
          </span>
        </span>
      </button>

      {hydrated ? createPortal(sheet, document.body) : null}
    </>
  );
}
