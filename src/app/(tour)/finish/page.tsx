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
import { StewardCredit } from "@/components/steward-credit";
import { ThankYouModal } from "@/components/thank-you-modal";
import { PageTransition } from "@/components/page-transition";
import { PrimaryButton } from "@/components/ui";
import { useHydrated } from "@/lib/use-hydrated";

const NEXT_IDEAS = [
  {
    title: "Light a candle",
    body: "Go to the candle stand near the side altar on your left as you face the front. Light one small candle for someone you love or remember.",
    image: "/img/prayer.webp",
    alt: "People praying quietly inside the cathedral",
    objectPosition: "object-[center_30%]",
  },
  {
    title: "Sit for a minute",
    body: "Find a wooden bench in the long middle hall. Sit down. Rest. People have walked these stone floors since 1843.",
    image: "/img/dome.webp",
    alt: "Looking up at the cathedral dome",
    objectPosition: "object-center",
  },
  {
    title: "Say a short prayer",
    body: "Walk toward the front, near the main altar, or find a quiet spot along the side wall. Speak to God in your own words, then go when you are ready.",
    image: "/img/statue.webp",
    alt: "View toward the cathedral and plaza",
    objectPosition: "object-[center_20%]",
  },
] as const;

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
  const complete = isJourneyComplete(ending, nagaTour);

  if (!hydrated) {
    return <main className="flex flex-1 flex-col" />;
  }

  if (!complete) {
    return (
      <PageTransition>
        <main className="flex flex-1 flex-col justify-center gap-6 py-10 text-center">
          <div className="space-y-2">
            <h1 className="font-display text-3xl">
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

  return (
    <>
      <PageTransition>
        <main className="flex flex-1 flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <StewardCredit variant="sticky" />
          <div className="flex flex-col gap-6">
            {/* Shorter window: image stays full scale, top/bottom are clipped. */}
            <div className="relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] aspect-[2/1] overflow-hidden bg-[var(--stone-light)]">
              <div className="absolute inset-x-0 top-1/2 aspect-[4/3] -translate-y-1/2">
                <Image
                  src="/img/finish-prize-side-pilgrim.jpg"
                  alt="A pilgrim at the parish side office under a covered walk, holding a small prize"
                  fill
                  unoptimized
                  priority
                  className="hero-settle object-cover object-[center_35%]"
                  sizes="(max-width: 512px) 100vw, 512px"
                />
              </div>
            </div>
            <section
              className="fade-up space-y-2"
              aria-labelledby="surprise-prize-heading"
            >
              <h1
                id="surprise-prize-heading"
                className="font-display text-3xl leading-tight text-[var(--foreground)]"
              >
                Your surprise prize
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-[var(--muted-fg)]">
                You finished the walk. Ask someone at the parish for the small
                surprise prize the church has for you.
              </p>
            </section>
            {/* Same gap-6 above and below so the rule sits midway. */}
            <div className="border-t border-[var(--border)]" aria-hidden />
            <section
              className="fade-up"
              aria-labelledby="parish-gift-heading"
            >
              <ParishGift />
            </section>
          </div>

          <section
            className="fade-up mt-16 space-y-5 border-t border-[var(--border)] pt-10"
            aria-labelledby="next-ideas-heading"
          >
            <div className="space-y-1">
              <h2
                id="next-ideas-heading"
                className="font-display text-2xl text-[var(--foreground)]"
              >
                While you are here
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-fg)]">
                If you have time, try one of these.
              </p>
            </div>

            <ul className="space-y-6">
              {NEXT_IDEAS.map((idea) => (
                <li key={idea.title}>
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[var(--stone-light)]">
                      <Image
                        src={idea.image}
                        alt={idea.alt}
                        fill
                        unoptimized
                        className={`object-cover ${idea.objectPosition}`}
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl leading-snug text-[var(--foreground)]">
                        {idea.title}
                      </h3>
                      <p className="mt-1.5 text-base leading-relaxed text-[var(--foreground)]/90">
                        {idea.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="fade-up mt-10 flex justify-center">
            <StartOver />
          </div>
        </main>
      </PageTransition>
      <ThankYouModal />
    </>
  );
}
