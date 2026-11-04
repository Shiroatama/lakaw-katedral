"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getEntrancePoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";
import { CathedralMap } from "@/components/cathedral-map";
import { ArrowRightIcon } from "@/components/icons";
import { PageTransition } from "@/components/page-transition";
import { PrimaryButton, StickyActionBar } from "@/components/ui";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

/**
 * Orientation after the start-walk handoff: directions, compound map with only
 * place 1, entrance photo callout, and scan / skip CTAs.
 */
export function Onboarding() {
  const router = useRouter();
  const journeyReady = useJourneyHydrated();
  const progress = useJourneyStore();
  const entrance = getEntrancePoi(nagaTour);
  const started = isJourneyStarted(progress);
  const complete = isJourneyComplete(progress, nagaTour);

  useEffect(() => {
    if (!journeyReady) return;
    if (complete) {
      router.replace("/");
      return;
    }
    if (started) {
      router.replace("/");
    }
  }, [journeyReady, started, complete, router]);

  useEffect(() => {
    router.prefetch("/scan");
    router.prefetch(`/s/${entrance.slug}`);
  }, [router, entrance.slug]);

  if (!journeyReady || started || complete) {
    return <main className="flex flex-1 flex-col" />;
  }

  return (
    <PageTransition>
      <main className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 pb-[calc(var(--action-bar-space)+0.5rem)]">
          <header className="fade-up pt-3" style={delay(80)}>
            <h1 className="font-display text-3xl leading-none text-[var(--foreground)]">
              Start at the entrance
            </h1>
            <p className="mt-1.5 text-base leading-snug text-[var(--foreground)]/90">
              Go to the front door of the Cathedral, then scan the QR code next
              to it.
            </p>
          </header>

          <div className="fade-up relative" style={delay(160)}>
            <CathedralMap
              variant="compound"
              onlyOrders={[1]}
              highlightNext
              tip="Start here. Scan the QR at the main door."
            />

            {/* Entrance photo inset, lower left. */}
            <div className="entrance-callout pointer-events-none absolute bottom-[3%] left-[2.5%] z-10 w-[40%] max-w-[10.5rem]">
              <div className="rounded-2xl bg-[var(--surface)] p-1.5 shadow-[0_8px_24px_rgba(42,33,28,0.22)] ring-1 ring-[var(--border)]">
                <figure className="overflow-hidden rounded-[0.85rem]">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={entrance.heroImage}
                      alt="The Cathedral Entrance"
                      fill
                      unoptimized
                      priority
                      className="object-cover object-center"
                      sizes="40vw"
                    />
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>

        <StickyActionBar>
          <div className="flex items-center gap-2">
            <PrimaryButton href="/scan" icon="qr" className="min-w-0 flex-1">
              Scan the entrance QR
            </PrimaryButton>
            <Link
              href={`/s/${entrance.slug}`}
              transitionTypes={["nav-forward"]}
              className="inline-flex h-14 shrink-0 items-center justify-center gap-1 rounded-md border border-dashed border-[var(--stone)] bg-transparent px-3 text-sm font-medium text-[var(--stone)] transition-[transform,background-color] duration-200 ease-[var(--ease-out)] hover:bg-[var(--background)] active:scale-[0.98]"
              aria-label={`Skip the scan: open place ${entrance.order}`}
            >
              Skip
              <ArrowRightIcon className="h-[0.95em] w-[0.95em]" />
            </Link>
          </div>
        </StickyActionBar>
      </main>
    </PageTransition>
  );
}
