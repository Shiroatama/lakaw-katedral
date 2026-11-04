import {
  playTone,
  vibratePattern,
  withAudioContext,
} from "@/lib/feedback-sound";

/**
 * Slower, deeper pulses for the walk handoff
 * (aligned with G3 → C4 → E4 → G4).
 */
function playWalkIntroHaptic() {
  vibratePattern([45, 110, 50, 120, 55, 140, 80]);
}

/**
 * Warm rising fifths for Start the walk. Softer and lower than the
 * correct-answer chime so the terracotta handoff feels ceremonial.
 */
export function playWalkIntroSound() {
  playWalkIntroHaptic();

  withAudioContext((ctx) => {
    const t0 = ctx.currentTime + 0.03;
    // G3 → C4 → E4 → G4
    playTone(ctx, 196.0, t0, 0.42, 0.14, "triangle");
    playTone(ctx, 261.63, t0 + 0.16, 0.48, 0.13, "triangle");
    playTone(ctx, 329.63, t0 + 0.34, 0.55, 0.11, "sine");
    playTone(ctx, 392.0, t0 + 0.54, 0.7, 0.1, "sine");
  });
}

/** Bright resolve when the intro count hits 100%. */
export function playWalkIntroCompleteSound() {
  vibratePattern([40, 50, 70]);

  withAudioContext((ctx) => {
    const t0 = ctx.currentTime + 0.02;
    // C5 → G5
    playTone(ctx, 523.25, t0, 0.28, 0.14, "triangle");
    playTone(ctx, 783.99, t0 + 0.08, 0.4, 0.12, "sine");
  });
}

/** Soft brand swell when Lakaw Katedral appears. */
export function playWalkIntroBrandSound() {
  vibratePattern([55, 90, 80]);

  withAudioContext((ctx) => {
    const t0 = ctx.currentTime + 0.02;
    // G4 → C5 → E5
    playTone(ctx, 392.0, t0, 0.45, 0.11, "triangle");
    playTone(ctx, 523.25, t0 + 0.14, 0.55, 0.12, "sine");
    playTone(ctx, 659.25, t0 + 0.3, 0.7, 0.1, "sine");
  });
}
