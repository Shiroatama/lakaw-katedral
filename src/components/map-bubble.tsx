"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ALLOW_SKIP,
  getNextExpectedPoi,
  getPoiById,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { CathedralMap } from "@/components/cathedral-map";
import { ArrowRightIcon, QrCodeIcon } from "@/components/icons";
import { useHydrated } from "@/lib/use-hydrated";

/** What the sheet highlights: where you stand, or where to go next. */
export type MapFocus = "here" | "next";

type MapBubbleProps = {
  /** Controlled open state (optional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled focus: here = current place, next = wayfinding */
  focus?: MapFocus;
  onFocusChange?: (focus: MapFocus) => void;
  /** Open on first render (e.g. deep link to /map) */
  defaultOpen?: boolean;
  /** Sheet only (no chat-head). Used on home so the map never appears in the dock. */
  hideTrigger?: boolean;
  /**
   * Called when the chat-head is tapped. Parent should open with focus "here".
   * When omitted, the bubble opens itself with focus "here".
   */
  onTriggerOpen?: () => void;
};

/** Split a landmark into numbered steps (one sentence per step). */
function landmarkSteps(landmark: string): string[] {
  return landmark
    .split(/(?<=\.)\s+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

/**
 * Circular map chat-head with a progress ring. Opens a sheet above the dock:
 * floor plan, either where you are now (chat-head) or directions to the next
 * place (Find place N), plus trial-mode Skip.
 *
 * The sheet is always mounted (portaled to <body>) and driven by `data-open`.
 * See `.sheet-*` in globals.css.
 */
export function MapBubble({
  open: openControlled,
  onOpenChange,
  focus: focusControlled,
  onFocusChange,
  defaultOpen = false,
  hideTrigger = false,
  onTriggerOpen,
}: MapBubbleProps) {
  const router = useRouter();
  const titleId = useId();
  const hydrated = useHydrated();
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const [focusInternal, setFocusInternal] = useState<MapFocus>(
    defaultOpen ? "next" : "here",
  );
  const open = openControlled ?? openInternal;
  const focus = focusControlled ?? focusInternal;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const progress = useJourneyStore();
  const total = nagaTour.pois.length;
  const done = Math.min(progress.completed.length, total);
  const next = getNextExpectedPoi(progress, nagaTour);
  const here = progress.lastScannedPoiId
    ? (getPoiById(progress.lastScannedPoiId) ?? null)
    : null;
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);

  // Prefer "you are here" when we know the place; otherwise fall back to next.
  const showingHere = focus === "here" && here !== null;
  const featured = showingHere ? here : next;

  function setOpen(nextOpen: boolean) {
    if (openControlled === undefined) setOpenInternal(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function setFocus(nextFocus: MapFocus) {
    if (focusControlled === undefined) setFocusInternal(nextFocus);
    onFocusChange?.(nextFocus);
  }

  function openFromTrigger() {
    if (open) {
      setOpen(false);
      return;
    }
    if (onTriggerOpen) {
      onTriggerOpen();
      return;
    }
    setFocus("here");
    setOpen(true);
  }

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
      if (!hideTrigger) triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open, hideTrigger]);

  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total === 0 ? 0 : done / total;
  const dashOffset = circumference * (1 - pct);

  const sheet = (
    <div
      className="sheet-root pointer-events-none fixed inset-0 z-40"
      data-open={open}
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className="sheet-backdrop pointer-events-auto absolute inset-x-0 top-0 bottom-[var(--action-bar-space)] bg-[var(--foreground)]/35 backdrop-blur-[2px]"
        aria-label="Close map"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`sheet-panel pointer-events-auto absolute inset-x-3 bottom-[calc(var(--action-bar-space)+0.55rem)] mx-auto flex max-h-[calc(100dvh-max(0.75rem,env(safe-area-inset-top))-var(--action-bar-space)-0.55rem)] w-[calc(100%-1.5rem)] max-w-lg flex-col rounded-xl bg-[var(--surface)] px-5 pb-5 pt-4 shadow-[0_12px_40px_rgba(42,33,28,0.28)] ring-1 ring-[var(--border)] outline-none${hideTrigger ? " sheet-panel--no-head" : ""}`}
      >
        {hideTrigger ? null : (
          <svg
            className="sheet-tail"
            viewBox="0 0 32 20"
            fill="none"
            aria-hidden
          >
            {/* Soft chat-bubble tail: wide base, rounded tip (not pointy). */}
            <path
              d="M1 0H31C25 1.5 21 13.5 16 18C11 13.5 7 1.5 1 0Z"
              fill="var(--surface)"
            />
            <path
              d="M1 0C7 1.5 11 13.5 16 18C21 13.5 25 1.5 31 0"
              stroke="var(--border)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <div className="sheet-item mb-3 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {complete || !featured ? (
              <h2
                id={titleId}
                className="font-display text-2xl text-[var(--foreground)]"
              >
                You finished
              </h2>
            ) : showingHere ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                  You are here
                </p>
                <h2
                  id={titleId}
                  className="font-display text-2xl leading-tight text-[var(--foreground)]"
                >
                  {featured.title}
                </h2>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                  {started ? "Next place" : "Start here"} · {featured.order} of{" "}
                  {total}
                </p>
                <h2
                  id={titleId}
                  className="font-display text-2xl leading-tight text-[var(--foreground)]"
                >
                  {featured.title}
                </h2>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-lg text-[var(--foreground)] ring-1 ring-[var(--border)] transition-transform duration-200 ease-[var(--ease-out)] active:scale-90"
            aria-label="Close map"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-auto space-y-4 overflow-y-auto overscroll-contain pb-2">
          {complete || !featured ? (
            <p
              className="sheet-item text-base text-[var(--muted-fg)]"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              You have seen every place.
            </p>
          ) : null}

          <div
            className="sheet-item"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <CathedralMap
              highlightNext={!complete && !showingHere && featured !== null}
            />
          </div>

          {!showingHere && featured && !complete ? (
            <section
              className="sheet-item space-y-2"
              style={{ "--i": 3 } as React.CSSProperties}
              aria-label="Directions"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                Directions
              </h4>
              <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-[var(--foreground)]/90">
                {landmarkSteps(featured.landmark).map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>Scan the QR code there to read the story.</li>
              </ol>
            </section>
          ) : null}
        </div>

        {!complete && !showingHere ? (
          <div
            className="sheet-item shrink-0 space-y-1.5 pt-3"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/scan", { transitionTypes: ["nav-forward"] });
                }}
                className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-base font-semibold text-[var(--accent-fg)] shadow-[0_4px_16px_rgba(184,92,56,0.35)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97]"
              >
                <QrCodeIcon className="h-[1.1em] w-[1.1em] shrink-0" />
                Scan with this phone
              </button>
              {ALLOW_SKIP && next ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/s/${next.slug}`, {
                      transitionTypes: ["nav-forward"],
                    });
                  }}
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-1 rounded-md border border-dashed border-[var(--stone)] bg-transparent px-3 text-sm font-medium text-[var(--stone)] transition-[transform,background-color] duration-200 ease-[var(--ease-out)] hover:bg-[var(--background)] active:scale-[0.98]"
                  aria-label={`Skip the scan: open place ${next.order}`}
                >
                  Skip
                  <ArrowRightIcon className="h-[0.95em] w-[0.95em]" />
                </button>
              ) : null}
            </div>
            {!ALLOW_SKIP || !next ? (
              <p className="text-center text-xs text-[var(--muted-fg)]">
                Or open the code with your phone&apos;s camera app.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {hideTrigger ? null : (
        <button
          ref={triggerRef}
          type="button"
          onClick={openFromTrigger}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] shadow-[0_4px_16px_rgba(42,33,28,0.18)] ring-1 ring-[var(--border)] transition-[box-shadow] duration-200 ease-[var(--ease-out)] hover:shadow-[0_8px_22px_rgba(42,33,28,0.22)] active:scale-95"
          aria-label={
            open
              ? "Close map"
              : `Open map. You have seen ${done} of ${total} places.`
          }
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
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative z-10 text-[var(--foreground)]"
            aria-hidden
          >
            <path d="M9 18l-5 2V6l5-2 6 2 5-2v14l-5 2-6-2z" />
            <path d="M9 4v14" />
            <path d="M15 6v14" />
          </svg>
        </button>
      )}

      {hydrated ? createPortal(sheet, document.body) : null}
    </>
  );
}
