"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { attemptLogin, type SavedAccount } from "./account";
import type { WalkAccess } from "./gate";

type AccessStore = {
  account: SavedAccount | null;
  /**
   * True after a confirmed payment. The real provider (SukiPay) and the
   * internal temp unlock both call `confirmPayment`.
   */
  paid: boolean;
  /**
   * Where to go after login and pay (a place or the handoff). In memory only.
   */
  returnTo: string | null;
  saveLogin: (
    email: string,
    password: string,
  ) => Promise<"ok" | "other-email" | "wrong-password">;
  confirmPayment: () => void;
  setReturnTo: (path: string | null) => void;
};

export const useAccessStore = create<AccessStore>()(
  persist(
    (set, get) => ({
      account: null,
      paid: false,
      returnTo: null,
      saveLogin: async (email, password) => {
        const result = await attemptLogin(get().account, email, password);
        if (!result.ok) return result.reason;
        set({ account: result.account });
        return "ok";
      },
      confirmPayment: () => set({ paid: true }),
      setReturnTo: (path) => set({ returnTo: path }),
    }),
    {
      name: "lakaw-katedral-access",
      partialize: (state) => ({
        account: state.account,
        paid: state.paid,
      }),
    },
  ),
);

export function readWalkAccess(state: {
  account: SavedAccount | null;
  paid: boolean;
}): WalkAccess {
  return { loggedIn: state.account !== null, paid: state.paid };
}
