"use client";

import type { Poi } from "@/lib/tour/types";
import { gatePath, walkGate } from "./gate";
import { readWalkAccess, useAccessStore } from "./store";

/**
 * If `poi` is behind the login or pay gate, remember where to return and
 * send the visitor to the gate. Returns true when it redirected.
 */
export function sendThroughGate(
  router: { push: (href: string) => void },
  poi: Pick<Poi, "order">,
  returnTo: string,
): boolean {
  const store = useAccessStore.getState();
  const path = gatePath(walkGate(poi, readWalkAccess(store)));
  if (!path) return false;
  store.setReturnTo(returnTo);
  router.push(path);
  return true;
}
