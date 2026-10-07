"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  isJourneyComplete,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { ParishGift } from "@/components/parish-gift";
import { StartOver } from "@/components/start-over";
import { PageTransition } from "@/components/page-transition";
import { PrimaryButton, ProgressBar } from "@/components/ui";
import { useHydrated } from "@/lib/use-hydrated";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function FinishPage() {
  const hydrated = useHydrated();
  const progress = useJourneyStore();
  const total = nagaTour.pois.length;
  // Keep the ending on screen after Start over clears progress. Otherwise this
  // page flips to "not done yet" for the moment before Home replaces it.
  const endingRef = useRef(progress);
  if (isJourneyComplete(progress, nagaTour)) {
    endingRef.current = progress;
  }
  const ending = endingRef.current;

  if (!hydrated) {
    return <main className="flex flex-1 flex-col" />;
  }

  if (!isJourneyComplete(ending, nagaTour)) {
    return (
      <PageTransition>
        <main className="flex flex-1 flex-col justify-center gap-6 py-10 text-center">
          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl">
              Your walk is not done yet
            </h1>
            <p className="mx-auto max-w-sm text-base leading-relaxed text-[var(--muted-fg)]">
              See all {total} places. Then come back here.
            </p>
          </div>
          <PrimaryButton href="/" direction="back">
            Back to the walk
          </PrimaryButton>
        </main>
      </PageTransition>
    );
  }

  const durationLabel = (() => {
    if (!ending.startedAt || !ending.finishedAt) return null;
    const minutes = Math.max(
      1,
      Math.round(
        (new Date(ending.finishedAt).getTime() -
          new Date(ending.startedAt).getTime()) /
          60000,
      ),
    );
    return `About ${minutes} min.`;
  })();

  return (
    <PageTransition>
      <main className="flex flex-1 flex-col gap-10 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <header className="space-y-5">
          <ProgressBar total={total} completed={total} />
          <div className="fade-up flex flex-col items-center gap-4 text-center" style={delay(200)}>
            <div
              className="pop-in flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]"
              style={delay(350)}
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-fg)]">
                Lakaw Katedral
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--foreground)]">
                Thank you for walking with us
              </h1>
              <p className="mx-auto max-w-sm text-base leading-relaxed text-[var(--muted-fg)]">
                You finished all {total} places at {nagaTour.siteName}.
                {durationLabel ? ` ${durationLabel}` : ""}
              </p>
            </div>
          </div>
        </header>

        <section
          className="fade-up space-y-3"
          aria-labelledby="closing-heading"
          style={delay(650)}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-fg)]">
            Before you go
          </p>
          <aside className="overflow-hidden rounded-xl bg-[var(--surface)]">
            <div className="relative aspect-[5/2] bg-[var(--stone-light)]">
              {/* Served as-is (not via /_next/image) so the service worker can precache it. */}
              <Image
                src="/img/prayer.png"
                alt="People praying quietly in a church pew"
                fill
                unoptimized
                className="object-cover object-[center_30%]"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
            <div className="space-y-1.5 px-4 py-4">
              <h2
                id="closing-heading"
                className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--foreground)]"
              >
                Stay quiet for a moment
              </h2>
              <p className="text-sm leading-relaxed text-[var(--muted-fg)]">
                Sit down, light a candle, or say a short prayer. Pilgrims have
                walked on these same stone floors since 1843.
              </p>
            </div>
          </aside>
        </section>

        <div className="fade-up" style={delay(900)}>
          <ParishGift footer={<StartOver />} />
        </div>
      </main>
    </PageTransition>
  );
}
