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
  headline,
  finishLabel,
  children,
}: {
  src: string;
  alt: string;
  /** Skip the entrance fade. Used when Start over has already reset the walk. */
  instant?: boolean;
  /** Optional line under the brand (site name, or a resume headline). */
  headline?: string;
  finishLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <PageTransition>
      <main
        className={`relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] flex min-h-dvh flex-1 flex-col bg-black${instant ? " instant-arrival" : ""}`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            unoptimized
            className="hero-settle object-cover"
            sizes="100vw"
          />
          {/* Soft mid fade, then solid black so bottom copy stays readable. */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black from-[12%] via-black/75 via-[42%] to-transparent to-[72%]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end px-7 pb-2 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
          <h1
            className="fade-up font-[family-name:var(--font-display)] text-[2.35rem] leading-[1.1] tracking-tight text-white sm:text-5xl"
            style={delay(200)}
          >
            Lakaw Katedral
          </h1>
          {headline ? (
            <p
              className="fade-up mt-3 font-[family-name:var(--font-display)] text-xl leading-snug text-white/90 sm:text-2xl"
              style={delay(280)}
            >
              {headline}
            </p>
          ) : null}
          {children}
        </div>

        <div className="relative z-10">
          <StopDock finishLabel={finishLabel} />
        </div>
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
        src="/img/home-facade.webp"
        alt={nagaTour.siteName}
        instant={showHomeAtOnce}
        headline={nagaTour.siteName}
      >
        <p
          className="fade-up mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80"
          style={delay(350)}
        >
          {nagaTour.intro} Scan the QR code at the door, or tap Start.
        </p>
      </HomeHero>
    );
  }

  const journeyComplete =
    progress.finishedAt !== null || isJourneyComplete(progress, nagaTour);
  const inProgress = isJourneyStarted(progress) && !journeyComplete;
  const next = getNextExpectedPoi(progress, nagaTour);

  if (journeyComplete) {
    return (
      <HomeHero
        src="/img/home-facade.webp"
        alt={nagaTour.siteName}
        headline="You finished the walk"
        finishLabel="Help the parish"
      >
        <p
          className="fade-up mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80"
          style={delay(350)}
        >
          Thank you for walking with us. You can help the parish if you like.
        </p>
        <div className="fade-up mt-5" style={delay(450)}>
          <StartOver />
        </div>
      </HomeHero>
    );
  }

  if (inProgress) {
    return (
      <HomeHero
        src="/img/dome.webp"
        alt="Cathedral dome"
        headline="Keep walking"
      >
        <p
          className="fade-up mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80"
          style={delay(350)}
        >
          {next
            ? `Your next place is ${next.title}. Tap Find place ${next.order} to see how to get there.`
            : "Tap the map to see where to go."}
        </p>
        <div className="fade-up mt-4" style={delay(400)}>
          <OfflineStatus className="text-white/75" />
        </div>
        <div className="fade-up mt-3" style={delay(450)}>
          <StartOver />
        </div>
      </HomeHero>
    );
  }

  return (
    <HomeHero
      src="/img/home-facade.webp"
      alt={nagaTour.siteName}
      instant={showHomeAtOnce}
      headline={nagaTour.siteName}
    >
      <p
        className="fade-up mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80"
        style={delay(350)}
      >
        {nagaTour.intro} Scan the QR code at the door, or tap Start.
      </p>
      <div className="fade-up mt-4" style={delay(400)}>
        <OfflineStatus className="text-white/75" />
      </div>
    </HomeHero>
  );
}
