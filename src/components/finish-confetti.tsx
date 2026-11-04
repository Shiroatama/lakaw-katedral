"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Warm celebrate palette. Stronger than the quiet UI neutrals so the burst
 * reads festive; still keyed to terracotta, gold, and leaf green.
 */
const FINISH_COLORS = [
  "#b85c38", // terracotta
  "#e07a4a", // bright clay
  "#d4a017", // rich gold
  "#f0c75e", // sun gold
  "#5f8a55", // leaf green
  "#e8a07a", // warm peach
] as const;

/** Party palette for the correct-answer sticker beat. */
const CORRECT_COLORS = [
  "#a864fd", // violet
  "#29cdff", // cyan
  "#78ff44", // lime
  "#ff718d", // coral pink
  "#fdff6a", // lemon
] as const;

export type ConfettiPalette = "finish" | "correct";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Side-to-center burst via canvas-confetti (same plugin Preline documents).
 * @see https://preline.co/docs/components/confetti.html
 */
export function fireFinishConfetti(palette: ConfettiPalette = "finish") {
  if (typeof window === "undefined" || prefersReducedMotion()) return;

  const colors =
    palette === "correct" ? [...CORRECT_COLORS] : [...FINISH_COLORS];

  const defaults = {
    particleCount: palette === "correct" ? 90 : 70,
    spread: palette === "correct" ? 70 : 58,
    startVelocity: 48,
    gravity: 0.95,
    ticks: 220,
    colors,
    disableForReducedMotion: true,
  };

  void confetti({
    ...defaults,
    angle: 60,
    origin: { x: 0, y: 0.55 },
  });
  void confetti({
    ...defaults,
    angle: 120,
    origin: { x: 1, y: 0.55 },
  });

  if (palette === "correct") {
    void confetti({
      ...defaults,
      particleCount: 40,
      spread: 100,
      startVelocity: 36,
      origin: { x: 0.5, y: 0.4 },
    });
  }
}

/** Fires confetti when `active` becomes true, or when `burstKey` changes. */
export function FinishConfetti({
  active,
  burstKey = 0,
  palette = "finish",
}: {
  active: boolean;
  burstKey?: number;
  palette?: ConfettiPalette;
}) {
  useEffect(() => {
    if (!active) return;
    fireFinishConfetti(palette);
  }, [active, burstKey, palette]);

  return null;
}
