"use client";

import { useEffect } from "react";
import { useJourneyStore } from "@/lib/tour";

/** Ensures persisted progress matches the current tour version. */
export function JourneyHydrator({ children }: { children: React.ReactNode }) {
  const hydrateTourVersion = useJourneyStore((s) => s.hydrateTourVersion);

  useEffect(() => {
    hydrateTourVersion();
  }, [hydrateTourVersion]);

  return children;
}
