"use client";

import { useState } from "react";
import {
  getEntrancePoi,
  getNextExpectedPoi,
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  useJourneyStore,
} from "@/lib/tour";
import { MapBubble } from "@/components/map-bubble";
import { PrimaryButton, StickyActionBar } from "@/components/ui";

type StopDockProps = {
  /** Label once every place is visited. */
  finishLabel?: string;
  /** Label before the walk has begun. */
  startLabel?: string;
  /** Open the wayfinding sheet on first render. */
  defaultOpen?: boolean;
};

/**
 * Bottom dock shared by every journey screen. One consistent action:
 *
 * - walk not begun: Start the walk (opens the first story)
 * - stops left:     Find place N (opens wayfinding: landmark + map)
 * - all visited:    Finish
 *
 * "Find place N" deliberately does not open the next story. The next story
 * opens by scanning that stop's QR code.
 */
export function StopDock({
  finishLabel = "Finish",
  startLabel = "Start the walk",
  defaultOpen = false,
}: StopDockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const progress = useJourneyStore();
  const complete = isJourneyComplete(progress, nagaTour);
  const started = isJourneyStarted(progress);
  const next = getNextExpectedPoi(progress, nagaTour);
  const entrance = getEntrancePoi(nagaTour);

  return (
    <StickyActionBar map={<MapBubble open={open} onOpenChange={setOpen} />}>
      {complete || !next ? (
        <PrimaryButton href="/finish">{finishLabel}</PrimaryButton>
      ) : !started ? (
        <PrimaryButton href={`/s/${entrance.slug}`}>{startLabel}</PrimaryButton>
      ) : (
        <PrimaryButton onClick={() => setOpen(true)}>
          Find place {next.order}
        </PrimaryButton>
      )}
    </StickyActionBar>
  );
}
