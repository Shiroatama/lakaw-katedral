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
import { ThankYouModal } from "@/components/thank-you-modal";
import { PageTransition } from "@/components/page-transition";
import { PrimaryButton } from "@/components/ui";
import { useHydrated } from "@/lib/use-hydrated";

const NEXT_IDEAS = [
  {
    title: "Light a candle",
    body: "Leave a small light for someone you love or remember.",
    image: "/img/prayer.webp",
    alt: "People praying quietly in a church pew",
    objectPosition: "object-[center_30%]",
  },
  {
    title: "Sit in a pew",
    body: "Rest for a minute. People have walked these stone floors since 1843.",
    image: "/img/dome.webp",
    alt: "Looking up at the cathedral dome",
    objectPosition: "object-center",
  },
  {
    title: "Say a short prayer",
    body: "Take a quiet moment before you go back outside.",
    image: "/img/statue.webp",
    alt: "Statue inside the cathedral",
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

  if (!hydrated) {
    return <main className="flex flex-1 flex-col" />;
  }

  if (!isJourneyComplete(ending, nagaTour)) {
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
        <main className="flex flex-1 flex-col gap-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-0">
          <header className="fade-up -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] bg-[var(--background)]">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--stone-light)]">
                {/* Served as-is (not via /_next/image) so the service worker can precache it. */}
                <Image
                  src="/img/finish-welcome.webp"
                  alt="Naga Metropolitan Cathedral and the plaza in front of it"
                  fill
                  unoptimized
                  className="hero-settle object-cover object-center"
                  sizes="100vw"
                  priority
                />
              </div>
              <div
                className="pop-in absolute bottom-0 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-[var(--success)] text-white shadow-[0_8px_24px_rgba(79,107,74,0.35)] ring-4 ring-[var(--background)]"
                style={{ "--delay": "80ms" } as React.CSSProperties}
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="space-y-2 px-5 pb-6 pt-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--success)]">
                Walk complete
              </p>
              <h1 className="font-display text-3xl leading-tight text-[var(--foreground)]">
                We are glad you came
              </h1>
              <p className="mx-auto max-w-sm text-base leading-relaxed text-[var(--muted-fg)]">
                Thank you for learning about the Cathedral. We hope the walk
                stays with you.
              </p>
            </div>
            <div
              className="mx-5 h-px bg-[var(--border)]"
              aria-hidden
            />
          </header>

          <div className="fade-up">
            <ParishGift footer={<StartOver />} />
          </div>

          <section
            className="fade-up space-y-4"
            aria-labelledby="next-ideas-heading"
          >
            <div className="space-y-1.5">
              <h2
                id="next-ideas-heading"
                className="font-display text-xl text-[var(--foreground)]"
              >
                What you can do next
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-fg)]">
                Stay a little longer if you want. Here are a few quiet ideas.
              </p>
            </div>

            <ul className="space-y-3">
              {NEXT_IDEAS.map((idea) => (
                <li key={idea.title}>
                  <aside className="overflow-hidden rounded-xl bg-[var(--surface)]">
                    <div className="relative aspect-[5/2] bg-[var(--stone-light)]">
                      {/* Served as-is (not via /_next/image) so the service worker can precache it. */}
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
        </main>
      </PageTransition>
      <ThankYouModal />
    </>
  );
}
