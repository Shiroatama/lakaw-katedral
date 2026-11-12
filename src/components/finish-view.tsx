"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartOver } from "@/components/start-over";
import { Btn } from "@/components/ui";
import {
  isJourneyComplete,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

/** Short bridge after the last place: the prize cue, then into Parish. */
export function FinishView() {
  const router = useRouter();
  const ready = useJourneyHydrated();
  const progress = useJourneyStore();
  const complete =
    progress.finishedAt !== null || isJourneyComplete(progress, nagaTour);

  useEffect(() => {
    if (ready && !complete) router.replace("/walk");
  }, [ready, complete, router]);

  useEffect(() => {
    router.prefetch("/parish");
  }, [router]);

  if (!ready || !complete) {
    return <main className="view not-ready" />;
  }

  return (
    <main className="view finish" aria-label="Finish">
      <div className="finish-body">
        <div className="finish-hero">
          <Image
            src="/img/finish-prize-side-pilgrim.jpg"
            width={1200}
            height={900}
            alt="A pilgrim at the parish side office holding a small prize"
            unoptimized
            priority
          />
        </div>
        <div className="finish-copy">
          <h1>You finished the walk</h1>
          <p>
            Ask at the parish office for the small surprise prize. Then help
            the parish if you like.
          </p>
        </div>
        <div className="finish-actions">
          <Btn href="/parish">Help the parish</Btn>
          <StartOver />
        </div>
      </div>
    </main>
  );
}
