"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { parseScanPayload } from "@/lib/qr/parse-scan";

type ScannerStatus =
  | { kind: "starting" }
  | { kind: "ready" }
  | { kind: "denied" }
  | { kind: "unsupported" }
  | { kind: "error"; message: string }
  | { kind: "rejected"; message: string }
  | { kind: "found" };

/**
 * Full-bleed camera QR reader. On a valid Lakaw stop code, navigates to that
 * stop. Camera stream is stopped on unmount or after a successful read.
 */
export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState<ScannerStatus>({ kind: "starting" });

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

          handledRef.current = true;
          setStatus({ kind: "found" });
          controlsRef.current?.stop();
          controlsRef.current = null;
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

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(42,33,28,0.55)_70%)]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-[var(--accent-fg)]/90 shadow-[0_0_0_9999px_rgba(42,33,28,0.35)]"
        aria-hidden
      />

      <header className="relative z-10 flex items-start justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-fg)]/90">
            Lakaw Katedral
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--accent-fg)]">
            Scan a place
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/", { transitionTypes: ["nav-back"] });
          }}
          className="pointer-events-auto flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface)]/95 px-4 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)]"
        >
          Close
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
    "rounded-md px-4 py-3 text-sm leading-relaxed shadow-[0_8px_24px_rgba(42,33,28,0.28)]";

  switch (status.kind) {
    case "starting":
      return (
        <p className={`${base} bg-[var(--surface)] text-[var(--muted-fg)]`}>
          Starting the camera…
        </p>
      );
    case "ready":
      return (
        <p className={`${base} bg-[var(--surface)] text-[var(--foreground)]`}>
          Point your phone at the QR code on the sign.
        </p>
      );
    case "found":
      return (
        <p className={`${base} bg-[var(--success)] text-[var(--accent-fg)]`}>
          Found it. Opening the story…
        </p>
      );
    case "rejected":
      return (
        <p className={`${base} bg-[var(--surface)] text-[var(--danger)]`}>
          {status.message}
        </p>
      );
    case "denied":
      return (
        <p className={`${base} bg-[var(--surface)] text-[var(--foreground)]`}>
          Camera access is off. Allow the camera for this site, or scan with
          your phone&apos;s camera app instead.
        </p>
      );
    case "unsupported":
      return (
        <p className={`${base} bg-[var(--surface)] text-[var(--foreground)]`}>
          This browser cannot use the camera here. Open the QR with your
          phone&apos;s camera app instead.
        </p>
      );
    case "error":
      return (
        <p className={`${base} bg-[var(--surface)] text-[var(--danger)]`}>
          {status.message}
        </p>
      );
  }
}
