"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nagaTour } from "./content";
import {
  applyObservationSuccess,
  applyScanOutcome,
  createInitialProgress,
  evaluateScan,
  getNextExpectedPoi,
  isObservationCorrect,
} from "./route-rules";
import type { JourneyProgress, Poi, ScanOutcome } from "./types";
import { clearFinishSuccessSeen } from "./finish-success";

type JourneyStore = JourneyProgress & {
  /** Outcome of the most recent stop visit. In memory only, never persisted. */
  lastOutcome: ScanOutcome | null;
  hydrateTourVersion: () => void;
  scanPoi: (poi: Poi) => ScanOutcome;
  /** Mark a place complete when the observation key is correct. */
  completePoi: (poi: Poi, answer: string) => boolean;
  markDonated: () => void;
  reset: () => void;
};

/**
 * True after Start over, until the next full page load.
 * Home reads this so the fresh start screen is visible immediately,
 * instead of fading in for half a second.
 */
export let showHomeAtOnce = false;

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      ...createInitialProgress(nagaTour),
      lastOutcome: null,

      hydrateTourVersion: () => {
        const state = get();
        if (
          state.tourId !== nagaTour.id ||
          state.tourVersion !== nagaTour.version
        ) {
          set({ ...createInitialProgress(nagaTour), lastOutcome: null });
        }
      },

      scanPoi: (poi) => {
        const state = get();
        const outcome = evaluateScan(poi, state, nagaTour);
        set({
          ...applyScanOutcome(state, outcome, nagaTour),
          lastOutcome: outcome,
        });
        return outcome;
      },

      completePoi: (poi, answer) => {
        if (!isObservationCorrect(poi, answer)) return false;
        const state = get();
        const expected = getNextExpectedPoi(state, nagaTour);
        if (!expected || expected.id !== poi.id) return false;
        set(applyObservationSuccess(state, poi, nagaTour));
        return true;
      },

      markDonated: () => set({ donated: true }),

      reset: () => {
        showHomeAtOnce = true;
        clearFinishSuccessSeen();
        set({ ...createInitialProgress(nagaTour), lastOutcome: null });
      },
    }),
    {
      name: "lakaw-katedral-journey",
      partialize: (state) => ({
        tourId: state.tourId,
        tourVersion: state.tourVersion,
        startedAt: state.startedAt,
        completed: state.completed,
        lastScannedPoiId: state.lastScannedPoiId,
        finishedAt: state.finishedAt,
        donated: state.donated,
      }),
    },
  ),
);
