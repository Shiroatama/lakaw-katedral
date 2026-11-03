"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  getNextExpectedPoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  nextPlaceCtaLabel,
  showHomeAtOnce,
  useJourneyStore,
} from "@/lib/tour";
import { BrandMark } from "@/components/brand-mark";
import { PageTransition } from "@/components/page-transition";
import { StartOver } from "@/components/start-over";
import { StewardCredit } from "@/components/steward-credit";
import { StopDock } from "@/components/stop-dock";
import { useHydrated } from "@/lib/use-hydrated";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

function FreshStartCopy() {
  const { hook, teasers, fact } = nagaTour.intro;
  const factText = fact.split("\n").filter(Boolean).join(" ");

  return (
    <p
      className="fade-up mx-auto mt-3 max-w-sm text-base leading-relaxed text-white/80"
      style={delay(300)}
    >
      {hook} {factText} {teasers}
    </p>
  );
}

function HomeHero({
  src,
  alt,
  videoSrc,
  instant = false,
  headline,
  finishLabel,
  startLabel,
  children,
}: {
  src: string;
  alt: string;
  /** Portrait loop for the fresh start. Poster stays on `src`. */
  videoSrc?: string;
  /** Skip the entrance fade. Used when Start over has already reset the walk. */
  instant?: boolean;
  /** Optional line under the brand (resume / complete headlines). */
  headline?: string;
  finishLabel?: string;
  startLabel?: string;
  children?: ReactNode;
}) {
  return (
    <PageTransition>
      <main
        className={`relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] flex min-h-dvh flex-1 flex-col bg-black${instant ? " instant-arrival" : ""}`}
      >
        <div className="absolute inset-0 overflow-hidden">
          {videoSrc ? (
            <video
              className="hero-settle absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={src}
              aria-label={alt}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              priority
              unoptimized
              className="hero-settle object-cover"
              sizes="100vw"
            />
          )}
          {/* Soft mid fade, then solid black so bottom copy stays readable. */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black from-[12%] via-black/75 via-[42%] to-transparent to-[72%]"
            aria-hidden
          />
          {/* Soft top wash so the crest stays readable on bright sky. */}
          <div
            className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent"
            aria-hidden
          />
        </div>

        <StewardCredit />

        <div className="relative z-10 flex flex-1 flex-col justify-end px-7 pb-2 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
          <h1 className="fade-up" style={delay(200)}>
            <BrandMark
              priority
              className="mx-auto h-auto w-[min(9.5rem,46vw)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] sm:w-[11.5rem]"
            />
          </h1>
          {headline ? (
            <p
              className="fade-up mt-3 font-display text-xl leading-snug text-white/90 sm:text-2xl"
              style={delay(280)}
            >
              {headline}
            </p>
          ) : null}
          {children}
        </div>

        <div className="relative z-10">
          <StopDock finishLabel={finishLabel} startLabel={startLabel} />
        </div>
      </main>
    </PageTransition>
  );
}

export default function HomePage() {
  const hydrated = useHydrated();
  const progress = useJourneyStore();

  // Hold resume/complete until persisted state is ready so SSR and the first
  // client paint match. Keep a single HomeHero tree so hydrate does not remount
  // the hero and replay entrance animations (looks like a double fade).
  const journeyComplete =
    hydrated &&
    (progress.finishedAt !== null || isJourneyComplete(progress, nagaTour));
  const inProgress =
    hydrated && isJourneyStarted(progress) && !journeyComplete;
  const next = hydrated ? getNextExpectedPoi(progress, nagaTour) : null;

  let src = "/img/home-facade.webp";
  let alt = nagaTour.siteName;
  let videoSrc: string | undefined;
  let instant = showHomeAtOnce;
  let headline: string | undefined;
  let finishLabel: string | undefined;
  let startLabel: string | undefined;
  let body: ReactNode;

  if (journeyComplete) {
    headline = "You finished the walk";
    finishLabel = "Help the parish";
    body = (
      <>
        <p
          className="fade-up mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80"
          style={delay(350)}
        >
          Thank you for walking with us. Ask at the parish for your small
          surprise prize, and help the parish if you like.
        </p>
        <div className="fade-up mt-5" style={delay(450)}>
          <StartOver className="text-white/70 hover:text-white" />
        </div>
      </>
    );
  } else if (inProgress) {
    src = "/img/dome.webp";
    alt = "Cathedral dome";
    headline = "Keep walking";
    instant = false;
    body = (
      <>
        <p
          className="fade-up mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80"
          style={delay(350)}
        >
          {next
            ? next.order === 1
              ? `You still have a quest at the entrance. Tap "${nextPlaceCtaLabel(next)}" when you are ready.`
              : `Your next place is ${next.title}. Tap "${nextPlaceCtaLabel(next)}" to see how to get there.`
            : "Tap the map to see where to go."}
        </p>
        <div className="fade-up mt-5" style={delay(450)}>
          <StartOver className="text-white/70 hover:text-white" />
        </div>
      </>
    );
  } else {
    src = "/img/entrance.webp";
    videoSrc = "/video/entrance.mp4";
    body = <FreshStartCopy />;
  }

  return (
    <HomeHero
      src={src}
      alt={alt}
      videoSrc={videoSrc}
      instant={instant}
      headline={headline}
      finishLabel={finishLabel}
      startLabel={startLabel}
    >
      {body}
    </HomeHero>
  );
}
