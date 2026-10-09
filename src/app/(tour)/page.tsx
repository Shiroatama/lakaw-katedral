"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  getNextExpectedPoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  showHomeAtOnce,
  useJourneyStore,
} from "@/lib/tour";
import { PageTransition } from "@/components/page-transition";
import { StartOver } from "@/components/start-over";
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

/** Quiet institutional crest + name. Upper left; not a badge or promo chip. */
function StewardCredit() {
  const { steward } = nagaTour;
  const breakAt = steward.name.lastIndexOf(" ");
  const line1 = steward.name.slice(0, breakAt);
  const line2 = steward.name.slice(breakAt + 1);

  return (
    <div
      className="fade-up absolute left-0 top-0 z-10 px-5 pt-[max(0.85rem,env(safe-area-inset-top))]"
      style={delay(80)}
    >
      {/*
        Flex items-center is enough for the boxes. Ruwudu’s em-box is much taller
        than the painted caps, so without text-box trim the letters sit high and
        look top-aligned against the crest.
      */}
      <div className="flex items-center gap-2">
        <Image
          src={steward.logo}
          alt=""
          width={36}
          height={36}
          unoptimized
          priority
          className="size-9 shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
        />
        <span className="flex flex-col gap-[0.15em] font-display text-sm leading-none text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
          <span className="[text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
            {line1}
          </span>
          <span className="[text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
            {line2}
          </span>
        </span>
      </div>
    </div>
  );
}

function HomeHero({
  src,
  alt,
  instant = false,
  headline,
  finishLabel,
  startLabel,
  children,
}: {
  src: string;
  alt: string;
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
          {/* Soft top wash so the crest stays readable on bright sky. */}
          <div
            className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent"
            aria-hidden
          />
        </div>

        <StewardCredit />

        <div className="relative z-10 flex flex-1 flex-col justify-end px-7 pb-2 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
          <h1
            className="fade-up font-display text-[2.35rem] leading-[1.1] tracking-tight text-white sm:text-5xl"
            style={delay(200)}
          >
            Lakaw Katedral
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
          Thank you for walking with us. You can help the parish if you like.
        </p>
        <div className="fade-up mt-5" style={delay(450)}>
          <StartOver />
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
            ? `Your next place is ${next.title}. Tap Find place ${next.order} to see how to get there.`
            : "Tap the map to see where to go."}
        </p>
        <div className="fade-up mt-5" style={delay(450)}>
          <StartOver />
        </div>
      </>
    );
  } else {
    body = <FreshStartCopy />;
  }

  return (
    <HomeHero
      src={src}
      alt={alt}
      instant={instant}
      headline={headline}
      finishLabel={finishLabel}
      startLabel={startLabel}
    >
      {body}
    </HomeHero>
  );
}
