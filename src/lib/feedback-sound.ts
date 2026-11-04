/**
 * Shared Web Audio + Vibration helpers for short celebrate / handoff beats.
 * Safe to call from a user gesture. No asset files.
 */

let sharedCtx: AudioContext | null = null;

export function getFeedbackAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

/** Resume a suspended context so later scheduled tones can play after a tap. */
export function unlockFeedbackAudio() {
  const ctx = getFeedbackAudioContext();
  if (!ctx || ctx.state !== "suspended") return;
  void ctx.resume().catch(() => {});
}

export function playTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  amp.gain.setValueAtTime(0, start);
  amp.gain.linearRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function vibratePattern(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    // Vibration can throw on some locked-down WebViews; ignore.
  }
}

export function withAudioContext(run: (ctx: AudioContext) => void) {
  const ctx = getFeedbackAudioContext();
  if (!ctx) return;

  const kickOff = () => run(ctx);

  if (ctx.state === "suspended") {
    void ctx.resume().then(kickOff).catch(() => {});
    return;
  }

  kickOff();
}
