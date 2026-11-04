"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BRAND_MARK, BrandMark } from "@/components/brand-mark";
import { FullscreenButton } from "@/components/fullscreen-button";
import { requestAppFullscreen } from "@/lib/fullscreen";
import {
  playWalkIntroBrandSound,
  playWalkIntroCompleteSound,
  playWalkIntroSound,
} from "@/lib/walk-intro-sound";

const PARTNER_LOGOS = [
  {
    src: "/brand/ryne-media.webp",
    alt: "Ryne Media",
    width: 1024,
    height: 453,
    className: "h-auto w-[min(9.5rem,42vw)]",
  },
  {
    src: "/brand/bald-puppies.webp",
    alt: "Bald Puppies Solutions Inc.",
    width: 559,
    height: 563,
    className: "h-auto w-[min(5rem,24vw)]",
  },
] as const;

/** Progress starts while the circular reveal is still opening (CSS enter is 3 s). */
const COUNT_START_MS = 500;
const COUNT_MS = 2800;
/** Ease-in power: the count starts slow and gets faster toward 100. */
const COUNT_POWER = 2.5;

const PULSE_MS = 640;
/** Partners fade fully out before the title appears (match CSS). */
const STAGE_OUT_MS = 420;
const TITLE_IN_MS = 520;
/** Quiet hold with only Lakaw Katedral on screen. */
const TITLE_HOLD_MS = 1100;
/** Title and terracotta leave together. */
const EXIT_MS = 480;

type Phase = "count" | "pulse" | "clear" | "title" | "exit";

/** `href` is null for a preview that returns to the current page. */
type IntroTarget = { href: string | null };

/** Metal-grind sparks at the leading edge of the progress bar. */
const GRIND_SPARKS = [
  { gx: "6px", gy: "-12px", gr: "-28deg", gd: "0ms" },
  { gx: "10px", gy: "-7px", gr: "12deg", gd: "70ms" },
  { gx: "5px", gy: "4px", gr: "32deg", gd: "40ms" },
  { gx: "12px", gy: "2px", gr: "-8deg", gd: "110ms" },
  { gx: "8px", gy: "-16px", gr: "22deg", gd: "150ms" },
  { gx: "14px", gy: "-3px", gr: "-42deg", gd: "90ms" },
] as const;

const WalkIntroContext = createContext<(href: string | null) => void>(
  () => {},
);

export function useWalkIntro() {
  return useContext(WalkIntroContext);
}

/**
 * Full-screen handoff after Start the walk: a terracotta screen fades in,
 * partner marks count to 100, pulse, then Lakaw Katedral holds and zooms out
 * with the background into onboarding (then the entrance scan).
 */
export function WalkIntroHost({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [target, setTarget] = useState<IntroTarget | null>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("count");
  const [leaving, setLeaving] = useState(false);
  const playing = useRef(false);

  useEffect(() => {
    for (const logo of PARTNER_LOGOS) {
      const img = new window.Image();
      img.src = logo.src;
    }
    const brand = new window.Image();
    brand.src = BRAND_MARK;
  }, []);

  const reset = useCallback(() => {
    playing.current = false;
    setTarget(null);
    setVisible(false);
    setProgress(0);
    setPhase("count");
    setLeaving(false);
  }, []);

  const play = useCallback(
    (href: string | null) => {
      if (playing.current) return;
      requestAppFullscreen();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (href && reduce) {
        router.push(href, { transitionTypes: ["nav-forward"] });
        return;
      }
      playing.current = true;
      playWalkIntroSound();
      if (href) router.prefetch(href);
      setPhase("count");
      setProgress(0);
      setLeaving(false);
      setVisible(false);
      setTarget({ href });
    },
    [router],
  );

  useEffect(() => {
    if (!target) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [target]);

  // Count 0 → 100, then hand off to the pulse beat.
  useEffect(() => {
    if (!visible || !target || phase !== "count") return;
    let frame = 0;
    const begin = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNT_MS);
        const eased = Math.pow(t, COUNT_POWER);
        setProgress(Math.round(eased * 100));
        if (t < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }
        setProgress(100);
        setPhase("pulse");
      };
      frame = requestAnimationFrame(tick);
    }, COUNT_START_MS);
    return () => {
      window.clearTimeout(begin);
      cancelAnimationFrame(frame);
    };
  }, [visible, target, phase]);

  // pulse → clear → title → exit (+ navigate).
  useEffect(() => {
    if (!target) return;
    if (phase === "pulse") {
      playWalkIntroCompleteSound();
      const id = window.setTimeout(() => setPhase("clear"), PULSE_MS);
      return () => window.clearTimeout(id);
    }
    if (phase === "clear") {
      const id = window.setTimeout(() => setPhase("title"), STAGE_OUT_MS);
      return () => window.clearTimeout(id);
    }
    if (phase === "title") {
      playWalkIntroBrandSound();
      const id = window.setTimeout(() => {
        if (target.href) router.push(target.href);
        setPhase("exit");
        setLeaving(true);
      }, TITLE_IN_MS + TITLE_HOLD_MS);
      return () => window.clearTimeout(id);
    }
  }, [phase, target, router]);

  // Tear down as soon as the shared exit finishes. Title and background end together.
  useEffect(() => {
    if (!leaving || phase !== "exit") return;
    const id = window.setTimeout(reset, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [leaving, phase, reset]);

  useEffect(() => {
    if (!target) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [target]);

  return (
    <WalkIntroContext.Provider value={play}>
      {children}
      <FullscreenButton />
      {target
        ? createPortal(
            <WalkIntroOverlay
              visible={visible}
              progress={progress}
              phase={phase}
            />,
            document.body,
          )
        : null}
    </WalkIntroContext.Provider>
  );
}

function WalkIntroOverlay({
  visible,
  progress,
  phase,
}: {
  visible: boolean;
  progress: number;
  phase: Phase;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const brandOut =
    phase === "clear" || phase === "title" || phase === "exit";
  const exiting = phase === "exit";
  const grinding =
    !brandOut && (progress > 0 || phase === "pulse");
  // One motion class only. Keeping --in during exit restarted the fade-in.
  const titleMotion =
    phase === "title"
      ? "walk-intro-title--in"
      : phase === "exit"
        ? "walk-intro-title--exit"
        : "";

  useEffect(() => {
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Tab" || event.key === "Escape") {
        event.preventDefault();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={panelRef}
      role="status"
      tabIndex={-1}
      className={`walk-intro fixed inset-0 z-[60] bg-[var(--accent)] outline-none ${visible && !exiting ? "walk-intro--enter" : ""} ${exiting ? "walk-intro--exit pointer-events-none" : ""}`}
    >
      <p className="sr-only">Loading the walk</p>

      <div
        aria-hidden
        className={`walk-intro-stage absolute inset-0 flex flex-col items-center justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] ${phase === "pulse" ? "walk-intro-stage--pulse" : ""} ${brandOut ? "walk-intro-stage--out" : ""}`}
      >
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          {PARTNER_LOGOS.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              unoptimized
              priority
              className={logo.className}
            />
          ))}
        </div>
        <p className="mt-9 min-w-[5ch] text-center text-3xl font-medium tabular-nums leading-none text-[var(--accent-fg)]">
          {progress}%
        </p>
        <div className="walk-intro-bar relative mt-4 h-2 w-52">
          <div className="h-full overflow-hidden rounded-full bg-[var(--accent-fg)]/25">
            <div
              className="h-full rounded-full bg-[var(--accent-fg)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {grinding ? (
            <div
              className={`walk-intro-grind absolute top-1/2 -translate-y-1/2 ${progress >= 92 || phase === "pulse" ? "walk-intro-grind--hot" : ""}`}
              style={{ left: `${Math.min(progress, 100)}%` }}
            >
              {GRIND_SPARKS.map((spark) => (
                <span
                  key={`${spark.gx}-${spark.gy}-${spark.gd}`}
                  className="walk-intro-grind-bit"
                  style={
                    {
                      "--gx": spark.gx,
                      "--gy": spark.gy,
                      "--gr": spark.gr,
                      "--gd": spark.gd,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
        <p className="walk-intro-loading mt-3 text-sm font-medium tracking-wide">
          Loading...
        </p>
      </div>

      <div
        aria-hidden
        className={`walk-intro-title absolute inset-0 flex items-center justify-center px-6 ${titleMotion}`}
      >
        <div className="walk-intro-mark flex flex-col items-center gap-3">
          <p className="text-sm font-medium tracking-wide text-[var(--accent-fg)]/85">
            Welcome to
          </p>
          <BrandMark
            priority
            className="h-auto w-[min(19rem,82vw)] sm:w-[23rem]"
          />
        </div>
      </div>
    </div>
  );
}
