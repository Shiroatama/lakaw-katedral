"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_MARK } from "@/components/brand-mark";
import { CoinsIcon, PinCheckIcon } from "@/components/icons";
import { sendThroughGate } from "@/lib/access/route-gate";
import {
  ALLOW_SKIP,
  getNextExpectedPoi,
  getPlaceState,
  getPoiById,
  getPoints,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";
import type { Poi } from "@/lib/tour";

const NOTICE_MS = 6000;

/**
 * Walk tab: the compound map with all places. Tap a done place to reread it.
 * Tap the next place to go there. Later places answer with a warm "not yet".
 */
export function WalkView() {
  const router = useRouter();
  const ready = useJourneyHydrated();
  const progress = useJourneyStore();
  const setEarlyScanGate = useJourneyStore((s) => s.setEarlyScanGate);
  const [tip, setTip] = useState<string | null>(null);

  const total = nagaTour.pois.length;
  const complete = ready && isJourneyComplete(progress, nagaTour);
  const next = ready ? getNextExpectedPoi(progress, nagaTour) : null;
  const points = ready ? getPoints(progress) : 0;

  // A scan or link for a later place sends visitors here. Say where to go.
  const earlyId = ready ? progress.earlyScanExpectedId : null;
  const earlyPoi = earlyId ? getPoiById(earlyId) : undefined;
  const earlyNotice = earlyPoi
    ? `Not that one yet. Next up: ${earlyPoi.title}.`
    : null;
  const notice = tip ?? earlyNotice;

  useEffect(() => {
    if (!earlyId) return;
    const id = window.setTimeout(() => setEarlyScanGate(null), NOTICE_MS);
    return () => window.clearTimeout(id);
  }, [earlyId, setEarlyScanGate]);

  useEffect(() => {
    if (!tip) return;
    const id = window.setTimeout(() => setTip(null), NOTICE_MS);
    return () => window.clearTimeout(id);
  }, [tip]);

  function goNext(poi: Poi) {
    setEarlyScanGate(null);
    const target = ALLOW_SKIP
      ? `/s/${poi.slug}`
      : poi.order === 1
        ? isJourneyStarted(progress)
          ? "/scan"
          : "/onboarding"
        : "/handoff";
    if (sendThroughGate(router, poi, target)) return;
    router.push(target);
  }

  function onPin(poi: Poi) {
    const state = getPlaceState(poi, progress, nagaTour);
    if (state === "done") {
      router.push(`/s/${poi.slug}`);
      return;
    }
    if (state === "next") {
      goNext(poi);
      return;
    }
    setEarlyScanGate(null);
    setTip(
      next
        ? `Place ${poi.order} comes later. Next up: ${next.title}.`
        : "You have walked every place.",
    );
  }

  return (
    <>
      <div className="map-bar">
        <Image
          className="map-logo"
          src={BRAND_MARK}
          width={940}
          height={516}
          alt="Lakaw Katedral"
          unoptimized
          priority
        />
        <div className="map-bar-end">
          <div
            className="map-currency"
            title="Points"
            aria-label={`${points} points`}
          >
            <CoinsIcon className="map-currency-coins" />
            <span>{points}</span>
          </div>
        </div>
      </div>

      <div className="map-stage">
        <div className="plan">
          <Image
            src="/img/cathedral-compound.webp"
            width={560}
            height={720}
            alt="Map of the cathedral grounds."
            unoptimized
            priority
          />
          {ready
            ? nagaTour.pois.map((poi) => {
                const state = getPlaceState(poi, progress, nagaTour);
                const classes = ["pin"];
                if (state === "done") classes.push("pin-done");
                if (state === "next") classes.push("pin-active");
                if (state === "locked") classes.push("pin-locked");
                return (
                  <button
                    key={poi.id}
                    type="button"
                    className={classes.join(" ")}
                    style={{
                      left: `${(poi.map.x / 280) * 100}%`,
                      top: `${(poi.map.y / 360) * 100}%`,
                    }}
                    aria-label={
                      state === "done"
                        ? `Reread place ${poi.order}, ${poi.shortTitle}`
                        : state === "next"
                          ? `Go to place ${poi.order}, ${poi.shortTitle}`
                          : `Place ${poi.order}, ${poi.shortTitle}, not yet`
                    }
                    onClick={() => onPin(poi)}
                  >
                    {state === "done" ? <PinCheckIcon /> : poi.order}
                  </button>
                );
              })
            : null}
          {notice ? (
            <p className="map-notice" role="status">
              {notice}
            </p>
          ) : null}
          {complete && !notice ? (
            <p className="map-notice" role="status">
              You walked all {total} places.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
