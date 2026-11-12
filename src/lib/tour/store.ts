"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nagaTour } from "./content";
import {
  applyQuestSuccess,
  applyScanOutcome,
  createInitialProgress,
  evaluateScan,
  getNextExpectedPoi,
} from "./route-rules";
import type { JourneyProgress, Poi, ScanOutcome } from "./types";

type JourneyStore = JourneyProgress & {
  /** Outcome of the most recent stop visit. In memory only, never persisted. */
  lastOutcome: ScanOutcome | null;
  /**
   * After opening a place too early mid-walk. In memory only.
   * Walk shows warm copy for this expected place id.
   */
  earlyScanExpectedId: string | null;
  hydrateTourVersion: () => void;
  scanPoi: (poi: Poi) => ScanOutcome;
  /**
   * Mark a place complete once its quest is solved. Only the next unsolved
   * place can be completed. The sheet checks the answer with `isQuestCorrect`.
   */
  completePoi: (poi: Poi) => boolean;
  markDonated: () => void;
  /** Remember a too-early visit so Walk can explain where to go. */
  setEarlyScanGate: (expectedId: string | null) => void;
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
      earlyScanExpectedId: null,

      hydrateTourVersion: () => {
        const state = get();
        if (
          state.tourId !== nagaTour.id ||
          state.tourVersion !== nagaTour.version
        ) {
          set({
            ...createInitialProgress(nagaTour),
            lastOutcome: null,
            earlyScanExpectedId: null,
          });
        }
      },

      scanPoi: (poi) => {
        const state = get();
        const outcome = evaluateScan(poi, state, nagaTour);
        set({
          ...applyScanOutcome(state, outcome),
          lastOutcome: outcome,
        });
        return outcome;
      },

      completePoi: (poi) => {
        const state = get();
        const expected = getNextExpectedPoi(state, nagaTour);
        if (!expected || expected.id !== poi.id) return false;
        set(applyQuestSuccess(state, poi, nagaTour));
        return true;
      },

      markDonated: () => set({ donated: true }),

      setEarlyScanGate: (expectedId) => {
        set({ earlyScanExpectedId: expectedId });
      },

      reset: () => {
        showHomeAtOnce = true;
        set({
          ...createInitialProgress(nagaTour),
          lastOutcome: null,
          earlyScanExpectedId: null,
        });
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
