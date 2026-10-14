"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Warm celebrate palette. Stronger than the quiet UI neutrals so the burst
 * reads festive; still keyed to terracotta, gold, and leaf green.
 */
const COLORS = [
  "#b85c38", // terracotta
  "#e07a4a", // bright clay
  "#d4a017", // rich gold
  "#f0c75e", // sun gold
  "#5f8a55", // leaf green
  "#e8a07a", // warm peach
] as const;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Side-to-center burst via canvas-confetti (same plugin Preline documents).
 * @see https://preline.co/docs/components/confetti.html
 */
export function fireFinishConfetti() {
  if (typeof window === "undefined" || prefersReducedMotion()) return;

  const defaults = {
    particleCount: 70,
    spread: 58,
    startVelocity: 48,
    gravity: 0.95,
    ticks: 220,
    colors: [...COLORS],
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
}

/** Fires confetti when `active` becomes true, or when `burstKey` changes. */
export function FinishConfetti({
  active,
  burstKey = 0,
}: {
  active: boolean;
  burstKey?: number;
}) {
  useEffect(() => {
    if (!active) return;
    fireFinishConfetti();
  }, [active, burstKey]);

  return null;
}
