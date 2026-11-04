import {
  playTone,
  vibratePattern,
  withAudioContext,
} from "@/lib/feedback-sound";

/**
 * Four short pulses aligned with C5 → E5 → G5 → C6
 * (notes at 0 / 90 / 180 / 280 ms).
 */
function playCorrectHaptic() {
  vibratePattern([30, 60, 30, 60, 35, 65, 55]);
}

/** Bright major arpeggio + matching haptic, timed with the CORRECT sticker. */
export function playCorrectSound() {
  playCorrectHaptic();

  withAudioContext((ctx) => {
    const t0 = ctx.currentTime + 0.02;
    // C5 → E5 → G5 → C6
    playTone(ctx, 523.25, t0, 0.22, 0.18);
    playTone(ctx, 659.25, t0 + 0.09, 0.24, 0.16);
    playTone(ctx, 783.99, t0 + 0.18, 0.28, 0.14);
    playTone(ctx, 1046.5, t0 + 0.28, 0.45, 0.12);
  });
}
