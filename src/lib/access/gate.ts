import type { Poi } from "@/lib/tour/types";

/** Places 1–3 stay free. Place 4 and after need a login and a paid walk. */
export const FREE_PLACE_COUNT = 3;

/** Price for the rest of the walk, in Philippine pesos. */
export const WALK_PRICE_PESOS = 50;

export const LOGIN_PATH = "/login";
export const PAY_PATH = "/pay";
export const PROFILE_PATH = "/you";

/**
 * Internal builds can unlock the paid places without a payment provider.
 * Always on in development. In a production build, set
 * NEXT_PUBLIC_TEMP_PAY_UNLOCK=true to keep it (internal testing only).
 * Remove once SukiPay confirms payments; the post-pay path stays the same.
 */
export const TEMP_PAY_UNLOCK =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_TEMP_PAY_UNLOCK === "true";

export type WalkAccess = {
  loggedIn: boolean;
  /** True after a confirmed payment (or the internal temp unlock). */
  paid: boolean;
};

export type WalkGate = "open" | "login" | "pay";

export function isFreePlace(poi: Pick<Poi, "order">): boolean {
  return poi.order <= FREE_PLACE_COUNT;
}

/**
 * Free places always open. Later places need a saved login, then a confirmed
 * SukiPay payment. Login alone does not open them.
 */
export function walkGate(poi: Pick<Poi, "order">, access: WalkAccess): WalkGate {
  if (isFreePlace(poi)) return "open";
  if (!access.loggedIn) return "login";
  if (!access.paid) return "pay";
  return "open";
}

export function gatePath(gate: WalkGate): typeof LOGIN_PATH | typeof PAY_PATH | null {
  if (gate === "login") return LOGIN_PATH;
  if (gate === "pay") return PAY_PATH;
  return null;
}
