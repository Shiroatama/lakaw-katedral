"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  isJourneyComplete,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { FinishSuccessModal } from "@/components/finish-success-modal";
import { ParishGift } from "@/components/parish-gift";
import { StartOver } from "@/components/start-over";
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
  const donated = useJourneyStore((s) => s.donated);
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
        <main className="flex flex-1 flex-col gap-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
          <div className="fade-up">
            <aside className="overflow-hidden rounded-xl bg-[var(--surface)]">
              <div className="relative aspect-[5/2] bg-[var(--stone-light)]">
                <Image
                  src="/img/give-people.webp"
                  alt="People in the cathedral raising their hands in prayer"
                  fill
                  unoptimized
                  className="object-cover object-center"
                  sizes="(max-width: 512px) 100vw, 512px"
                  priority
                />
              </div>
              <div className="px-5 py-4">
                <ParishGift />
              </div>
            </aside>
          </div>

          <section
            className="fade-up space-y-3"
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

            <ul className="space-y-3">
              {NEXT_IDEAS.map((idea) => (
                <li key={idea.title}>
                  <aside className="overflow-hidden rounded-xl bg-[var(--surface)]">
                    <div className="relative aspect-[5/2] bg-[var(--stone-light)]">
                      <Image
                        src={idea.image}
                        alt={idea.alt}
                        fill
                        unoptimized
                        className={`object-cover ${idea.objectPosition}`}
                        sizes="(max-width: 512px) 100vw, 512px"
                      />
                    </div>
                    <div className="space-y-1.5 px-4 py-4">
                      <h3 className="font-display text-lg leading-snug text-[var(--foreground)]">
                        {idea.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--muted-fg)]">
                        {idea.body}
                      </p>
                    </div>
                  </aside>
                </li>
              ))}
            </ul>
          </section>

          <div className="fade-up flex justify-center">
            <StartOver />
          </div>
        </main>
      </PageTransition>
      <FinishSuccessModal open={!donated} />
      <ThankYouModal />
    </>
  );
}
