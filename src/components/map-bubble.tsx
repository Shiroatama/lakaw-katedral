"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ALLOW_SKIP,
  getAreaMapByPoiId,
  getAreaMapForOrder,
  getNextExpectedPoi,
  getPoiById,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { CathedralMap } from "@/components/cathedral-map";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  QrCodeIcon,
} from "@/components/icons";
import {
  readMapMarkersSeen,
  writeMapMarkersSeen,
} from "@/lib/tour/map-markers-seen";
import { useMapHeadSlot } from "@/components/fullscreen-button";
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
  /** Sheet only (no floating head). Used when a parent opens the map without a trigger. */
  hideTrigger?: boolean;
  /**
   * Open on the compound overview; skip auto drill-in to the featured place.
   * Used on Home so visitors see the whole grounds first.
   */
  compoundFirst?: boolean;
  /**
   * Home before the walk: orientation only. No Scan / Skip, and the body
   * urges the dock CTA (beginLabel) instead of "go scan" directions.
   */
  hideActions?: boolean;
  /** Dock start CTA label, used in orientation copy when hideActions. */
  beginLabel?: string;
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

/** Wait for map ↔ percent swap to settle before the next step. */
const HEAD_SWAP_MS = 360;
/** Count + ring fill after the percent is showing. */
const RING_ADVANCE_MS = 2000;
/** Mid-walk: hold the landed percent before swapping back to the map. */
const HEAD_HOLD_MS = 2000;
/** Last place: hold 100% before swapping to the check. */
const FINISH_PERCENT_HOLD_MS = 1000;
/** Last place: show the check before swapping back to the map. */
const FINISH_CHECK_HOLD_MS = 2000;

type HeadMode = "map" | "percent" | "check";

/** Gentle ease so the ring reads as steady progress, not a snap. */
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Floating map head (top-right, beside fullscreen) with a progress ring.
 * Opens a sheet above the dock: compound overview or an area map with 3–5
 * pins (compound → area → QR), either where you are now or directions to the
 * next place, plus trial-mode Skip.
 *
 * The head portals into the fullscreen bar slot; the sheet portals to <body>
 * and is driven by `data-open`. See `.sheet-*` in globals.css.
 */
export function MapBubble({
  open: openControlled,
  onOpenChange,
  focus: focusControlled,
  onFocusChange,
  defaultOpen = false,
  hideTrigger = false,
  compoundFirst = false,
  hideActions = false,
  beginLabel = "Start the walk",
  onTriggerOpen,
}: MapBubbleProps) {
  const router = useRouter();
  const titleId = useId();
  const hydrated = useHydrated();
  const mapHeadSlot = useMapHeadSlot();
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const [focusInternal, setFocusInternal] = useState<MapFocus>(
    defaultOpen ? "next" : "here",
  );
  const [mapVariant, setMapVariant] = useState<"compound" | "place">(
    "compound",
  );
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
  /** Staggered marker pop-in: only on the first map open. */
  const [animateMarkers, setAnimateMarkers] = useState(false);
  const open = openControlled ?? openInternal;
  const focus = focusControlled ?? focusInternal;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const markersIntroPlayed = useRef(false);
  /** Back to compound: keep overview until focus/featured changes. */
  const stayOnCompound = useRef(false);

  const progress = useJourneyStore();
  const earlyScanExpectedId = useJourneyStore((s) => s.earlyScanExpectedId);
  const setEarlyScanGate = useJourneyStore((s) => s.setEarlyScanGate);
  const total = nagaTour.pois.length;
  const done = Math.min(progress.completed.length, total);
  const next = getNextExpectedPoi(progress, nagaTour);
  const earlyExpected = earlyScanExpectedId
    ? (getPoiById(earlyScanExpectedId) ?? null)
    : null;
  const here = progress.lastScannedPoiId
    ? (getPoiById(progress.lastScannedPoiId) ?? null)
    : null;
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);

  // Sequenced on completion (nothing starts in parallel).
  // Mid-walk: map → percent → count (~2s) → hold (~2s) → map.
  // Last place: map → percent → count to 100% (~2s) → hold 100% (~1s) →
  // check (~2s) → map.
  const targetPct = total === 0 ? 0 : done / total;
  const prevDone = useRef(done);
  const ringPctRef = useRef(targetPct);
  const [ringPct, setRingPct] = useState(targetPct);
  const [headMode, setHeadMode] = useState<HeadMode>("map");
  useEffect(() => {
    const to = total === 0 ? 0 : done / total;
    if (done <= prevDone.current) {
      prevDone.current = done;
      ringPctRef.current = to;
      setRingPct(to);
      return;
    }
    const from = ringPctRef.current;
    const finishing = done >= total;
    prevDone.current = done;
    setRingPct(from);
    ringPctRef.current = from;
    setHeadMode("percent");

    let cancelled = false;
    let frame = 0;
    const timers: number[] = [];

    const afterCount = () => {
      if (cancelled) return;
      if (finishing) {
        timers.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setHeadMode("check");
            timers.push(
              window.setTimeout(() => {
                if (!cancelled) setHeadMode("map");
              }, FINISH_CHECK_HOLD_MS),
            );
          }, FINISH_PERCENT_HOLD_MS),
        );
        return;
      }
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setHeadMode("map");
        }, HEAD_HOLD_MS),
      );
    };

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / RING_ADVANCE_MS);
          const value = from + (to - from) * easeInOut(t);
          ringPctRef.current = value;
          setRingPct(value);
          if (t < 1) {
            frame = window.requestAnimationFrame(tick);
            return;
          }
          afterCount();
        };
        frame = window.requestAnimationFrame(tick);
      }, HEAD_SWAP_MS),
    );

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      for (const id of timers) window.clearTimeout(id);
    };
  }, [done, total]);
  const showingPercent = headMode === "percent";
  const showingCheck = headMode === "check";
  const displayPercent = Math.round(ringPct * 100);

  // Prefer "you are here" when we know the place; otherwise fall back to next.
  const showingHere = focus === "here" && here !== null;
  const featured = showingHere ? here : next;

  function showCompound() {
    setMapVariant("compound");
    setActiveAreaId(null);
  }

  function showArea(areaId: string) {
    stayOnCompound.current = false;
    setAnimateMarkers(false);
    setActiveAreaId(areaId);
    setMapVariant("place");
  }

  function showAreaForOrder(order: number) {
    const area = getAreaMapForOrder(order);
    if (area) showArea(area.id);
  }

  function backToCompound() {
    stayOnCompound.current = true;
    showCompound();
  }

  function setOpen(nextOpen: boolean) {
    if (openControlled === undefined) setOpenInternal(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      stayOnCompound.current = false;
      showCompound();
      setAnimateMarkers(false);
      if (earlyScanExpectedId) setEarlyScanGate(null);
    }
  }

  const featuredId = featured?.id ?? null;

  // New focus target: allow auto drill-in again.
  useEffect(() => {
    stayOnCompound.current = false;
  }, [featuredId, focus]);

  // Wayfinding / here: open the area map that contains that stop.
  // Home stays on compound first; taps still drill into a place map.
  useEffect(() => {
    if (!open) return;
    if (stayOnCompound.current || compoundFirst) {
      showCompound();
      return;
    }
    if (!featuredId) {
      showCompound();
      return;
    }
    const area = getAreaMapByPoiId(featuredId);
    if (area) {
      showArea(area.id);
    } else {
      showCompound();
    }
  }, [open, featuredId, focus, compoundFirst]);

  useEffect(() => {
    if (!open) return;
    if (markersIntroPlayed.current || readMapMarkersSeen()) {
      setAnimateMarkers(false);
      return;
    }
    markersIntroPlayed.current = true;
    writeMapMarkersSeen();
    setAnimateMarkers(true);
  }, [open]);

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
      if (event.key === "Escape") setOpen(false);
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

  // Match the floating fullscreen control (h-11 / 44px).
  const size = 44;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ringPct);

  const sheet = (
    <div
      className="sheet-root pointer-events-none fixed inset-0 z-40"
      data-open={open}
      data-markers-animate={animateMarkers ? "true" : "false"}
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className="sheet-backdrop pointer-events-auto absolute inset-0 bg-[var(--foreground)]/35 backdrop-blur-[2px]"
        aria-label="Close map"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-panel sheet-panel--no-head pointer-events-auto absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] top-[calc(var(--top-chrome-space)+0.55rem)] mx-auto flex w-[calc(100%-1.5rem)] max-w-lg flex-col rounded-xl bg-[var(--surface)] px-5 pb-5 pt-4 shadow-[0_12px_40px_rgba(42,33,28,0.28)] ring-1 ring-[var(--border)] outline-none md:max-w-4xl"
      >
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
                  {hideActions
                    ? "Ready to begin"
                    : started
                      ? "Next place"
                      : "Start here"}{" "}
                  · {featured.order} of {total}
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
            className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl leading-none text-[var(--foreground)] transition-transform duration-200 ease-[var(--ease-out)] active:scale-90"
            aria-label="Close map"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-auto space-y-4 overflow-y-auto overscroll-contain pb-2">
          {earlyExpected ? (
            <aside
              className="sheet-item rounded-md border-l-[3px] border-[var(--accent)] bg-[var(--background)] px-3 py-2.5"
              style={{ "--i": 0 } as React.CSSProperties}
              role="status"
            >
              <p className="text-sm leading-relaxed text-[var(--foreground)]/90">
                You are a little early. Finish the quest at{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {earlyExpected.title}
                </span>{" "}
                first, then scan the next QR.
              </p>
            </aside>
          ) : null}

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
            <div className="relative">
              {mapVariant === "place" ? (
                <button
                  type="button"
                  onClick={backToCompound}
                  className="absolute left-2 top-2 z-10 inline-flex min-h-8 items-center gap-1 rounded-sm bg-[var(--surface)]/85 px-2 text-[11px] font-medium text-[var(--foreground)] ring-1 ring-[var(--border)]/60 backdrop-blur-[1px] transition-[transform,background-color] duration-200 ease-[var(--ease-out)] active:scale-95"
                  aria-label="Back to compound map"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  Back
                </button>
              ) : null}
              <CathedralMap
                highlightNext={!complete && !showingHere && featured !== null}
                variant={mapVariant}
                areaId={activeAreaId ?? undefined}
                onBeforeNavigate={() => setOpen(false)}
                onEnterPlace={(order) => {
                  showAreaForOrder(order);
                }}
              />
            </div>
          </div>

          {hideActions && featured && !complete ? (
            <p
              className="sheet-item text-base leading-relaxed text-[var(--foreground)]/90"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              Use this map to find your way. At each place, read and look. Tap{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {beginLabel}
              </span>{" "}
              when you are ready.
            </p>
          ) : !showingHere && featured && !complete ? (
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

        {!complete && !showingHere && !hideActions ? (
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
                className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-base font-semibold text-[var(--accent-fg)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97]"
              >
                <QrCodeIcon className="h-[1.1em] w-[1.1em] shrink-0" />
                Scan the next QR
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

  const trigger =
    hideTrigger || !mapHeadSlot ? null : (
      <button
        ref={triggerRef}
        type="button"
        onClick={openFromTrigger}
        data-head={headMode}
        className="map-progress-head pointer-events-auto relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)]/80 text-[var(--background)] shadow-sm backdrop-blur-md transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={
          open
            ? "Close map"
            : showingCheck
              ? `Walk complete. You have seen all ${total} places.`
              : showingPercent
                ? `Progress ${displayPercent} percent. You have seen ${done} of ${total} places.`
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
            stroke="currentColor"
            strokeOpacity={0.28}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#29F412"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {showingPercent ? (
          <span
            className="map-progress-pct relative z-10 font-semibold tabular-nums"
            aria-hidden
          >
            {displayPercent}%
          </span>
        ) : showingCheck ? (
          <CheckIcon className="map-progress-icon relative z-10 h-5 w-5 text-[var(--success-on-dark)]" />
        ) : (
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="map-progress-icon relative z-10"
            aria-hidden
          >
            <path d="M9 18l-5 2V6l5-2 6 2 5-2v14l-5 2-6-2z" />
            <path d="M9 4v14" />
            <path d="M15 6v14" />
          </svg>
        )}
      </button>
    );

  return (
    <>
      {trigger && mapHeadSlot
        ? createPortal(trigger, mapHeadSlot)
        : null}
      {hydrated ? createPortal(sheet, document.body) : null}
    </>
  );
}
