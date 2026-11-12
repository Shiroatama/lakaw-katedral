"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Btn, TextBtn } from "@/components/ui";
import {
  ALLOW_SKIP,
  getEntrancePoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

/**
 * First start only: "Start at the entrance". Compound map with pin 1, the
 * entrance photo, and Scan. Skipped for anyone who is already walking.
 */
export function Onboarding() {
  const router = useRouter();
  const ready = useJourneyHydrated();
  const progress = useJourneyStore();
  const entrance = getEntrancePoi(nagaTour);
  const started = isJourneyStarted(progress);
  const complete = isJourneyComplete(progress, nagaTour);

  useEffect(() => {
    if (!ready) return;
    if (complete || started) router.replace("/walk");
  }, [ready, started, complete, router]);

  useEffect(() => {
    router.prefetch("/scan");
    router.prefetch(`/s/${entrance.slug}`);
  }, [router, entrance.slug]);

  if (!ready || started || complete) {
    return <main className="view not-ready" />;
  }

  return (
    <main className="view onboard" aria-label="Onboarding">
      <div className="onboard-body">
        <h1 className="onboard-title">Start at the entrance</h1>
        <p className="onboard-line">
          Go to the front door of the Cathedral, then scan the QR code next to
          it.
        </p>
        <div className="onboard-map">
          <Image
            src="/img/cathedral-compound.webp"
            width={560}
            height={720}
            alt="Map of the cathedral grounds."
            unoptimized
            priority
          />
          <div
            className="onboard-pin"
            style={{
              left: `${(entrance.map.x / 280) * 100}%`,
              top: `${(entrance.map.y / 360) * 100}%`,
            }}
            aria-hidden="true"
          >
            1
          </div>
          <div className="onboard-callout">
            <div className="onboard-callout-frame">
              <figure>
                <Image
                  src={entrance.heroImage}
                  width={320}
                  height={240}
                  alt="The Cathedral Entrance"
                  unoptimized
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
      <div className="onboard-dock">
        <Btn href="/scan">Scan the entrance QR</Btn>
        {ALLOW_SKIP ? (
          <TextBtn href={`/s/${entrance.slug}`}>Skip</TextBtn>
        ) : null}
      </div>
    </main>
  );
}
