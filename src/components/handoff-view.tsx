"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { MapChip } from "@/components/map-chip";
import { Btn, TextBtn } from "@/components/ui";
import { sendThroughGate } from "@/lib/access/route-gate";
import { useAccessHydrated } from "@/lib/access/use-access-hydrated";
import {
  ALLOW_SKIP,
  COMPOUND_AISLE_X,
  aisleXFor,
  getAreaMapByPoiId,
  getAreaPin,
  getNextExpectedPoi,
  getPreviousPoi,
  isJourneyComplete,
  nagaTour,
  navRoutePoints,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

type Level = "area" | "compound";

const COMPOUND_IMAGE = "/img/cathedral-compound.webp";

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

/**
 * Between places: the next place on its area map, with the route from the
 * place you just finished. Back climbs to the whole grounds. Tap the next pin
 * to drill in, then scan.
 */
export function HandoffView() {
  const router = useRouter();
  const journeyReady = useJourneyHydrated();
  const accessReady = useAccessHydrated();
  const progress = useJourneyStore();
  const [level, setLevel] = useState<Level>("area");
  const gated = useRef(false);

  const ready = journeyReady && accessReady;
  const complete = ready && isJourneyComplete(progress, nagaTour);
  const next = ready ? getNextExpectedPoi(progress, nagaTour) : null;
  const prev = next ? getPreviousPoi(next, nagaTour) : null;
  const area = next ? getAreaMapByPoiId(next.id) : undefined;
  const toArea = next ? getAreaPin(next.id) : undefined;
  const onArea = level === "area" && Boolean(area && toArea);

  useEffect(() => {
    if (!ready || gated.current) return;
    if (complete) {
      gated.current = true;
      router.replace("/finish");
      return;
    }
    if (next) {
      gated.current = true;
      // Places after the free three need login, then pay.
      if (sendThroughGate(router, next, "/handoff")) return;
    }
  }, [ready, complete, next, router]);

  useEffect(() => {
    router.prefetch("/scan");
  }, [router]);

  if (!ready || !next) {
    return <main className="view not-ready" />;
  }

  const total = nagaTour.pois.length;
  const fromArea = prev ? getAreaPin(prev.id) : undefined;
  const sameArea = Boolean(fromArea && toArea && fromArea.area.id === toArea.area.id);

  const image = onArea && area ? area.image : COMPOUND_IMAGE;
  const imageAlt = onArea && area ? area.title : "Map of the cathedral grounds.";
  const label = onArea && area ? area.title : "Cathedral grounds";

  const from = onArea
    ? sameArea && fromArea
      ? { x: fromArea.x, y: fromArea.y }
      : null
    : prev
      ? prev.map
      : null;
  const to = onArea && toArea ? { x: toArea.x, y: toArea.y } : next.map;
  const route =
    from && onArea
      ? navRoutePoints(from, to, aisleXFor(area?.id ?? null))
      : from
        ? navRoutePoints(from, to, COMPOUND_AISLE_X)
        : "";

  function back() {
    if (onArea) {
      setLevel("compound");
      return;
    }
    router.push(prev ? `/s/${prev.slug}` : "/walk");
  }

  function onNextPin() {
    if (!onArea && area && toArea) {
      setLevel("area");
      return;
    }
    router.push("/scan");
  }

  return (
    <main className="view handoff" aria-label="Next place">
      <MapChip order={next.order} total={total} />

      <div className="topbar">
        <button
          type="button"
          className="place-back"
          aria-label="Back"
          onClick={back}
        >
          <ChevronLeftIcon />
        </button>
        <p className="count">{label}</p>
      </div>

      <div className="handoff-body">
        <h1 className="sr-only-label">{next.title}</h1>
        <p className="handoff-walk">{next.landmark}</p>
        <div className="handoff-map-stage">
          <div className="handoff-map">
            <Image
              key={image}
              src={image}
              width={560}
              height={720}
              alt={imageAlt}
              unoptimized
              priority
            />
            <svg className="handoff-svg" viewBox="0 0 280 360" aria-hidden="true">
              {route ? (
                <>
                  <polyline
                    points={route}
                    fill="none"
                    stroke="var(--surface)"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.82}
                  />
                  <polyline
                    points={route}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5 7"
                    opacity={0.85}
                  />
                </>
              ) : null}
            </svg>
            <div className="handoff-pins">
              {from && prev ? (
                <div
                  className="handoff-pin is-from"
                  style={{ left: pct(from.x, 280), top: pct(from.y, 360) }}
                  aria-hidden="true"
                >
                  {prev.order}
                </div>
              ) : null}
              <button
                type="button"
                className="handoff-pin is-next"
                style={{ left: pct(to.x, 280), top: pct(to.y, 360) }}
                aria-label={
                  !onArea && area && toArea
                    ? `Open area map for place ${next.order}`
                    : `Scan QR for place ${next.order}`
                }
                onClick={onNextPin}
              >
                {next.order}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="handoff-dock">
        <Btn href="/scan">Scan QR</Btn>
        {ALLOW_SKIP ? (
          <TextBtn href={`/s/${next.slug}`}>Skip</TextBtn>
        ) : null}
      </div>
    </main>
  );
}
