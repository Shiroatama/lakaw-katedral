"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { CloseIcon } from "@/components/icons";
import { parseScanPayload } from "@/lib/qr/parse-scan";
import {
  evaluateScan,
  getPoiBySlug,
  isJourneyStarted,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";

type ScannerStatus =
  | { kind: "starting" }
  | { kind: "ready" }
  | { kind: "denied" }
  | { kind: "unsupported" }
  | { kind: "error"; message: string }
  | { kind: "rejected"; message: string }
  | { kind: "found" };

/**
 * Full-bleed camera QR reader. On a valid Lakaw stop code, routes by journey
 * rules: allowed place opens its story; unstarted + too early goes Home;
 * started + too early opens the map with a warm tip.
 */
export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState<ScannerStatus>({ kind: "starting" });
  /**
   * Reserve room for the portaled fullscreen control by default so close never
   * lands under it on first paint; clear the gap if fullscreen is unsupported.
   */
  const [fullscreenSlot, setFullscreenSlot] = useState(true);

  useEffect(() => {
    const root = document.documentElement as HTMLElement & {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => void | Promise<void>;
    };
    setFullscreenSlot(
      typeof root.requestFullscreen === "function" ||
        typeof root.webkitRequestFullscreen === "function",
    );
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus({ kind: "unsupported" });
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const reader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts: 250,
    });

    reader
      .decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        video,
        (result) => {
          if (cancelled || handledRef.current || !result) return;

          const parsed = parseScanPayload(result.getText());
          if (!parsed.ok) {
            setStatus({
              kind: "rejected",
              message:
                parsed.reason === "unknown"
                  ? "That code is not one of our places."
                  : "Point at a Lakaw Katedral QR code.",
            });
            return;
          }

          const poi = getPoiBySlug(parsed.slug);
          if (!poi) {
            setStatus({
              kind: "rejected",
              message: "That code is not one of our places.",
            });
            return;
          }

          handledRef.current = true;
          controlsRef.current?.stop();
          controlsRef.current = null;

          const store = useJourneyStore.getState();
          const outcome = evaluateScan(poi, store, nagaTour);

          if (outcome.kind === "start_here") {
            if (!isJourneyStarted(store)) {
              setStatus({ kind: "found" });
              router.replace("/", { transitionTypes: ["nav-back"] });
              return;
            }
            setStatus({ kind: "found" });
            store.setEarlyScanGate(outcome.expected.id);
            router.replace("/map", { transitionTypes: ["nav-forward"] });
            return;
          }

          setStatus({ kind: "found" });
          router.replace(parsed.href, { transitionTypes: ["nav-forward"] });
        },
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus({ kind: "ready" });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus({ kind: "denied" });
          return;
        }
        setStatus({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "The camera could not start.",
        });
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      const stream = video.srcObject;
      if (stream instanceof MediaStream) {
        for (const track of stream.getTracks()) track.stop();
        video.srcObject = null;
      }
    };
  }, [router]);

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col bg-[var(--foreground)]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        autoPlay
        aria-label="Camera preview for QR scanning"
      />

      {/* Brand wash: stone vignette + soft top/bottom fades for chrome. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(42,33,28,0.42)_62%,rgba(42,33,28,0.72)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[var(--foreground)]/70 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--foreground)]/75 to-transparent"
        aria-hidden
      />

      {/* Viewfinder: corner brackets in ceremonial gold, not a full box. */}
      <div
        className="scan-viewfinder pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 sm:h-64 sm:w-64"
        aria-hidden
      >
        <span className="scan-corner scan-corner--tl" />
        <span className="scan-corner scan-corner--tr" />
        <span className="scan-corner scan-corner--bl" />
        <span className="scan-corner scan-corner--br" />
      </div>

      <header className="relative z-10 flex items-start justify-between gap-3 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 pt-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ceremonial)]">
            Lakaw Katedral
          </p>
          <h1 className="mt-1 font-display text-3xl leading-none text-[var(--accent-fg)]">
            Scan a place
          </h1>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/", { transitionTypes: ["nav-back"] });
          }}
          className={`pointer-events-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface)]/95 text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)] backdrop-blur-md transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-105 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]${fullscreenSlot ? " mr-14" : ""}`}
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>

      <div
        className="relative z-10 mt-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        role="status"
        aria-live="polite"
      >
        <StatusBanner status={status} />
      </div>
    </div>
  );
}

function StatusBanner({ status }: { status: ScannerStatus }) {
  const base =
    "rounded-xl px-4 py-3.5 text-sm leading-relaxed shadow-[0_12px_32px_rgba(42,33,28,0.28)] ring-1";

  switch (status.kind) {
    case "starting":
      return (
        <p
          className={`${base} bg-[var(--surface)] text-[var(--muted-fg)] ring-[var(--border)]`}
        >
          Starting the camera…
        </p>
      );
    case "ready":
      return (
        <p
          className={`${base} bg-[var(--surface)] text-[var(--foreground)] ring-[var(--border)]`}
        >
          Point your phone at the QR code on the sign.
        </p>
      );
    case "found":
      return (
        <p
          className={`${base} bg-[var(--success)] text-[var(--accent-fg)] ring-[var(--success)]`}
        >
          Found it. Opening the story…
        </p>
      );
    case "rejected":
      return (
        <p
          className={`${base} bg-[var(--surface)] text-[var(--danger)] ring-[var(--border)]`}
        >
          {status.message}
        </p>
      );
    case "denied":
      return (
        <p
          className={`${base} bg-[var(--surface)] text-[var(--foreground)] ring-[var(--border)]`}
        >
          Camera access is off. Allow the camera for this site, or scan with
          your phone&apos;s camera app instead.
        </p>
      );
    case "unsupported":
      return (
        <p
          className={`${base} bg-[var(--surface)] text-[var(--foreground)] ring-[var(--border)]`}
        >
          This browser cannot use the camera here. Open the QR with your
          phone&apos;s camera app instead.
        </p>
      );
    case "error":
      return (
        <p
          className={`${base} bg-[var(--surface)] text-[var(--danger)] ring-[var(--border)]`}
        >
          {status.message}
        </p>
      );
  }
}
