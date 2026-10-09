"use client";

import { useSyncExternalStore } from "react";
import { useJourneyStore } from "./store";

/**
 * True after the journey store has finished reading localStorage.
 * React's own hydrate can finish earlier; UI that depends on progress
 * (map head, Find place N) should wait for this so layout lands once.
 */
export function useJourneyHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useJourneyStore.persist.onFinishHydration(onStoreChange),
    () => useJourneyStore.persist.hasHydrated(),
    () => false,
  );
}
