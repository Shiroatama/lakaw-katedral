"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { CloseIcon } from "@/components/icons";
import { TextBtn } from "@/components/ui";
import { sendThroughGate } from "@/lib/access/route-gate";
import { parseScanPayload } from "@/lib/qr/parse-scan";
import {
  ALLOW_SKIP,
  evaluateScan,
  getNextExpectedPoi,
  getPoiBySlug,
  isJourneyStarted,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

type ScannerStatus =
  | { kind: "starting" }
  | { kind: "ready" }
  | { kind: "denied" }
  | { kind: "unsupported" }
  | { kind: "error"; message: string }
  | { kind: "rejected"; message: string }
  | { kind: "early"; message: string }
  | { kind: "found" };

function describe(status: ScannerStatus): {
  label: string;
  note: string;
  tone: "" | "is-warn" | "is-bad";
  ok: boolean;
} {
  switch (status.kind) {
    case "starting":
      return { label: "Starting", note: "Starting the camera.", tone: "", ok: false };
    case "ready":
      return {
        label: "Scanning",
        note: "Point your phone at the QR code on the sign.",
        tone: "",
        ok: false,
      };
    case "found":
      return { label: "Code found", note: "Opening the place.", tone: "", ok: true };
    case "rejected":
      return { label: "Scanning", note: status.message, tone: "is-bad", ok: false };
    case "early":
      return { label: "Not yet", note: status.message, tone: "is-warn", ok: false };
    case "denied":
      return {
        label: "Camera is off",
        note: "Allow the camera for this site, or scan with your phone's camera app instead.",
        tone: "is-warn",
        ok: false,
      };
    case "unsupported":
      return {
        label: "No camera",
        note: "This browser cannot use the camera here. Open the QR with your phone's camera app instead.",
        tone: "is-warn",
        ok: false,
      };
    case "error":
      return { label: "Camera problem", note: status.message, tone: "is-bad", ok: false };
  }
}

/**
 * Full-bleed camera QR reader. A valid code for the next place opens it (or
 * goes through login and pay first). A code for any other unsolved place
 * stays on the camera with a warm note, so nobody gets stuck.
 */
export function QrScanner() {
  const router = useRouter();
  const journeyReady = useJourneyHydrated();
  const progress = useJourneyStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState<ScannerStatus>({ kind: "starting" });

  const next = journeyReady ? getNextExpectedPoi(progress, nagaTour) : null;

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      // Defer so the effect body does not set state synchronously.
      const id = window.setTimeout(
        () => setStatus({ kind: "unsupported" }),
        0,
      );
      return () => window.clearTimeout(id);
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

          const store = useJourneyStore.getState();
          const outcome = evaluateScan(poi, store, nagaTour);

          // Not the next place: stay here and say where to go.
          if (outcome.kind === "start_here") {
            setStatus({
              kind: "early",
              message: isJourneyStarted(store)
                ? `That is place ${poi.order}. Your next place is ${outcome.expected.title}.`
                : "Start at the entrance first. Scan the code at the main door.",
            });
            return;
          }

          handledRef.current = true;
          controlsRef.current?.stop();
          controlsRef.current = null;
          setStatus({ kind: "found" });

          if (sendThroughGate({ push: router.replace }, poi, parsed.href)) {
            return;
          }
          router.replace(parsed.href);
        },
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus((current) =>
          current.kind === "starting" ? { kind: "ready" } : current,
        );
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
            err instanceof Error ? err.message : "The camera could not start.",
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

  const { label, note, tone, ok } = describe(status);

  return (
    <main className="view scan" aria-label="Scan">
      <video
        ref={videoRef}
        className="scan-video"
        muted
        playsInline
        autoPlay
        aria-label="Camera preview for QR scanning"
      />
      <div className="scan-wash" aria-hidden="true" />

      <button
        type="button"
        className="scan-close"
        aria-label="Close"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push("/walk");
        }}
      >
        <CloseIcon />
      </button>

      <div className="scan-stage" role="status" aria-live="polite">
        <div className="finder" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className={`found${ok ? " is-ok" : ""}`}>{label}</p>
        <p className={`scan-note ${tone}`.trim()}>{note}</p>
      </div>

      <div className="scan-foot">
        {ALLOW_SKIP && next ? (
          <TextBtn href={`/s/${next.slug}`}>Skip</TextBtn>
        ) : null}
      </div>
    </main>
  );
}
