"use client";

import {
  getNextExpectedPoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { PageTransition } from "@/components/page-transition";
import { StopDock } from "@/components/stop-dock";
import { useHydrated } from "@/lib/use-hydrated";

/** Deep-link fallback: the map opens as a sheet from the dock's map button. */
export default function MapPage() {
  const hydrated = useHydrated();
  const progress = useJourneyStore();
  const next = getNextExpectedPoi(progress, nagaTour);
  const complete = isJourneyComplete(progress, nagaTour);

  return (
    <PageTransition>
      <main className="flex flex-1 flex-col justify-center gap-4 px-1 py-6">
        <div className="space-y-2 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Where to go
          </h1>
          {hydrated ? (
            <p className="fade-in text-[var(--muted-fg)]">
              {complete
                ? "You finished the walk."
                : !next
                  ? "Tap the map button to see the map."
                  : isJourneyStarted(progress)
                    ? `Next place: ${next.title}. Tap the map button to see how to get there.`
                    : "Start at the main entrance. Tap the map button any time."}
            </p>
          ) : null}
        </div>
        {hydrated ? <StopDock defaultOpen /> : null}
      </main>
    </PageTransition>
  );
}
