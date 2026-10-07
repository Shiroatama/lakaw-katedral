"use client";

import Image from "next/image";
import {
  getNextExpectedPoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  showHomeAtOnce,
  useJourneyStore,
} from "@/lib/tour";
import { OfflineStatus } from "@/components/offline-status";
import { PageTransition } from "@/components/page-transition";
import { StartOver } from "@/components/start-over";
import { StopDock } from "@/components/stop-dock";
import { useHydrated } from "@/lib/use-hydrated";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

function HomeHero({
  src,
  alt,
  instant = false,
  children,
}: {
  src: string;
  alt: string;
  /** Skip the entrance fade. Used when Start over has already reset the walk. */
  instant?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <PageTransition>
      <main
        className={`flex flex-1 flex-col gap-6${instant ? " instant-arrival" : ""}`}
      >
        <div className="relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] aspect-[4/3] overflow-hidden bg-[var(--stone-light)]">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            unoptimized
            className="hero-settle object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/55 via-transparent to-transparent"
            aria-hidden
          />
          <div
            className="fade-up absolute inset-x-0 bottom-0 p-5 text-left"
            style={delay(250)}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-fg)]/90">
              Lakaw Katedral
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--accent-fg)]">
              {nagaTour.siteName}
            </h1>
          </div>
        </div>
        {children}
      </main>
    </PageTransition>
  );
}

export default function HomePage() {
  const hydrated = useHydrated();
  const progress = useJourneyStore();

  // Before the client is ready, still render the start CTA. The old
  // hero-only shell looked fine on desktop, but on a phone (or when JS is
  // blocked in dev) it left a dead page with no buttons.
  if (!hydrated) {
    return (
      <HomeHero
        src="/img/home-facade.jpg"
        alt={nagaTour.siteName}
        instant={showHomeAtOnce}
      >
        <p
          className="fade-up text-center text-base leading-relaxed text-[var(--muted-fg)]"
          style={delay(350)}
        >
          {nagaTour.intro} Scan the QR code at the door, or tap Start.
        </p>
        <StopDock />
      </HomeHero>
    );
  }

  const journeyComplete =
    progress.finishedAt !== null || isJourneyComplete(progress, nagaTour);
  const inProgress = isJourneyStarted(progress) && !journeyComplete;
  const next = getNextExpectedPoi(progress, nagaTour);

  if (journeyComplete) {
    return (
      <HomeHero src="/img/home-facade.jpg" alt={nagaTour.siteName}>
        <div className="fade-up space-y-3 text-center" style={delay(350)}>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            You finished the walk!
          </h2>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-[var(--muted-fg)]">
            Thank you for walking with us. You can help the parish if you like.
          </p>
        </div>
        <div className="fade-up" style={delay(450)}>
          <StartOver />
        </div>
        <StopDock finishLabel="Help the parish" />
      </HomeHero>
    );
  }

  if (inProgress) {
    return (
      <HomeHero src="/img/dome.jpg" alt="Cathedral dome">
        <div className="fade-up space-y-3 text-center" style={delay(350)}>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Keep walking
          </h2>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-[var(--muted-fg)]">
            {next
              ? `Your next place is ${next.title}. Tap Find place ${next.order} to see how to get there.`
              : "Tap the map to see where to go."}
          </p>
        </div>
        <OfflineStatus />
        <div className="fade-up" style={delay(450)}>
          <StartOver />
        </div>
        <StopDock />
      </HomeHero>
    );
  }

  return (
    <HomeHero
      src="/img/home-facade.jpg"
      alt={nagaTour.siteName}
      instant={showHomeAtOnce}
    >
      <p
        className="fade-up text-center text-base leading-relaxed text-[var(--muted-fg)]"
        style={delay(350)}
      >
        {nagaTour.intro} Scan the QR code at the door, or tap Start.
      </p>
      <OfflineStatus />
      <StopDock />
    </HomeHero>
  );
}
