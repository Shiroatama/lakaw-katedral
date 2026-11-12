"use client";

import { useSyncExternalStore } from "react";
import { useAccessStore } from "./store";

/** True after the access store has finished reading localStorage. */
export function useAccessHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useAccessStore.persist.onFinishHydration(onStoreChange),
    () => useAccessStore.persist.hasHydrated(),
    () => false,
  );
}
