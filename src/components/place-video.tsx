"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  CloseIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  UnmuteIcon,
  VideoFullScreenIcon,
} from "@/components/icons";

const CONTROLS_HIDE_MS = 3000;

export type PlaceVideoFrame = "landscape" | "portrait";

type PlaceVideoProps = {
  src: string;
  poster: string;
  label: string;
  /** Landscape is 16:9. Portrait is 9:16. */
  frame: PlaceVideoFrame;
  children?: ReactNode;
};

/**
 * Looping hero video for a place. Sound starts off.
 * Full screen rotates a landscape clip so the wide picture fills a portrait phone.
 */
export function PlaceVideo({
  src,
  poster,
  label,
  frame,
  children,
}: PlaceVideoProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestId = useRef(0);
  /** True only after this player actually entered the browser full-screen layer. */
  const usingFullscreen = useRef(false);
  const [open, setOpen] = useState(false);
  /** Overlay on document.body when the browser will not full-screen the hero. */
  const [lifted, setLifted] = useState(false);
  const [muted, setMuted] = useState(true);
  const portraitViewport = useSyncExternalStore(
    subscribePortrait,
    portraitSnapshot,
    () => true,
  );
  const rotateLandscape = open && frame === "landscape" && portraitViewport;
  const [playing, setPlaying] = useState(true);
  const [controlsOn, setControlsOn] = useState(true);
  const [controlsTick, setControlsTick] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekingRef = useRef(false);
  /** Pause from scroll-out; resume on re-entry only for these, not user pauses. */
  const pausedByViewport = useRef(false);

  const close = useCallback(() => {
    requestId.current += 1;
    usingFullscreen.current = false;
    setOpen(false);
    setLifted(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, []);

  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeRef.current();
    }
    document.addEventListener("keydown", onKey);

    const video = videoRef.current;
    if (video) void video.play().catch(() => {});

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, lifted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    setMuted(true);
    pausedByViewport.current = false;
    void video.play().catch(() => {});
  }, [src]);

  useEffect(() => {
    if (open) return;
    const shell = shellRef.current;
    const video = videoRef.current;
    if (!shell || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!pausedByViewport.current) return;
          pausedByViewport.current = false;
          void video.play().catch(() => {});
          return;
        }
        if (video.paused) return;
        pausedByViewport.current = true;
        video.pause();
      },
      { threshold: 0 },
    );
    observer.observe(shell);
    return () => observer.disconnect();
  }, [open, lifted, src]);

  useEffect(() => {
    const hide = window.setTimeout(() => {
      if (seekingRef.current) return;
      setControlsOn(false);
    }, CONTROLS_HIDE_MS);
    return () => window.clearTimeout(hide);
  }, [controlsTick]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    const readTime = () => {
      if (!seekingRef.current) setCurrentTime(video.currentTime || 0);
      if (Number.isFinite(video.duration)) setDuration(video.duration);
    };
    video.addEventListener("timeupdate", readTime);
    video.addEventListener("loadedmetadata", readTime);
    video.addEventListener("durationchange", readTime);
    video.addEventListener("seeked", readTime);
    const initialRead = window.setTimeout(readTime, 0);
    return () => {
      window.clearTimeout(initialRead);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", readTime);
      video.removeEventListener("loadedmetadata", readTime);
      video.removeEventListener("durationchange", readTime);
      video.removeEventListener("seeked", readTime);
    };
  }, [open, lifted, src]);

  useEffect(() => {
    const shell = shellRef.current;

    function onFullscreenChange() {
      if (document.fullscreenElement || !usingFullscreen.current) return;
      usingFullscreen.current = false;
      requestId.current += 1;
      setOpen(false);
      setLifted(false);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
      usingFullscreen.current = false;
      if (shell && document.fullscreenElement === shell) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  async function enter() {
    const shell = shellRef.current;
    const video = videoRef.current;
    if (!shell) return;

    const id = requestId.current + 1;
    requestId.current = id;
    revealControls();
    setOpen(true);
    if (video) void video.play().catch(() => {});

    let entered = false;
    try {
      if (document.fullscreenElement !== shell) {
        await shell.requestFullscreen();
      }
      entered = document.fullscreenElement === shell;
    } catch {
      entered = false;
    }
    usingFullscreen.current = entered;

    if (requestId.current !== id) return;
    if (!entered) setLifted(true);
  }

  function revealControls() {
    setControlsOn(true);
    setControlsTick((tick) => tick + 1);
  }

  function togglePlay() {
    revealControls();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pausedByViewport.current = false;
      void video.play().catch(() => setPlaying(false));
      return;
    }
    pausedByViewport.current = false;
    video.pause();
  }

  function seekTo(next: number) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(next)) return;
    video.currentTime = next;
    setCurrentTime(next);
  }

  function toggleMute() {
    revealControls();
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) void video.play().catch(() => {});
  }

  const shell = (
    <div
      ref={shellRef}
      className={
        open
          ? "fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black"
          : "absolute inset-0"
      }
    >
      <div
        className={stageClassName(open, frame, rotateLandscape)}
        onClick={revealControls}
      >
        <video
          ref={videoRef}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${open ? "" : "hero-settle"}`}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
        </video>

        <div
          inert={controlsOn ? undefined : true}
          className={`absolute inset-0 z-20 transition-opacity duration-300 ${
            controlsOn ? "" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent"
            aria-hidden
          />
          {open ? (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent"
              aria-hidden
            />
          ) : null}

          {open ? (
            <MediaButton
              label="Close"
              onClick={close}
              className="absolute top-3 left-3"
            >
              <CloseIcon className="h-5 w-5" />
            </MediaButton>
          ) : null}

          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
            <MediaButton
              label={playing ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {playing ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5 translate-x-px" />
              )}
            </MediaButton>

            <SeekBar
              current={currentTime}
              duration={duration}
              onSeekStart={() => {
                seekingRef.current = true;
                revealControls();
              }}
              onSeek={seekTo}
              onSeekEnd={() => {
                seekingRef.current = false;
                revealControls();
              }}
            />

            <MediaButton
              label={muted ? "Unmute" : "Mute"}
              onClick={toggleMute}
            >
              {muted ? (
                <MuteIcon className="h-5 w-5" />
              ) : (
                <UnmuteIcon className="h-5 w-5" />
              )}
            </MediaButton>
            {open ? null : (
              <MediaButton label="Full screen" onClick={() => void enter()}>
                <VideoFullScreenIcon className="h-5 w-5" />
              </MediaButton>
            )}
          </div>
        </div>
      </div>

      {open ? null : children}
    </div>
  );

  if (lifted && open) return createPortal(shell, document.body);
  return shell;
}

function SeekBar({
  current,
  duration,
  onSeekStart,
  onSeek,
  onSeekEnd,
}: {
  current: number;
  duration: number;
  onSeekStart: () => void;
  onSeek: (seconds: number) => void;
  onSeekEnd: () => void;
}) {
  const ratio = duration > 0 ? Math.min(1, current / duration) : 0;
  const filled = `${ratio * 100}%`;

  return (
    <div
      className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="w-9 shrink-0 text-xs font-medium tabular-nums text-white">
        {formatClock(current)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={duration > 0 ? Math.min(current, duration) : 0}
        disabled={duration <= 0}
        aria-label="Seek"
        aria-valuetext={`${formatClock(current)} of ${formatClock(duration)}`}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full disabled:opacity-50 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        style={{
          background: `linear-gradient(to right, #fff ${filled}, rgb(255 255 255 / 0.35) ${filled})`,
        }}
        onPointerDown={onSeekStart}
        onPointerUp={onSeekEnd}
        onPointerCancel={onSeekEnd}
        onInput={(event) => onSeek(Number(event.currentTarget.value))}
      />
      <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-white">
        {formatClock(duration)}
      </span>
    </div>
  );
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

function MediaButton({
  label,
  onClick,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
      {children}
    </button>
  );
}

function stageClassName(
  open: boolean,
  frame: PlaceVideoFrame,
  rotateLandscape: boolean,
) {
  if (!open) return "absolute inset-0";
  if (rotateLandscape) return "relative h-[100dvw] w-[100dvh] rotate-90";
  if (frame === "portrait") {
    return "relative h-[min(100dvh,calc(100dvw*16/9))] w-[min(100dvw,calc(100dvh*9/16))]";
  }
  return "relative h-[min(100dvh,calc(100dvw*9/16))] w-[min(100dvw,calc(100dvh*16/9))]";
}

function subscribePortrait(onChange: () => void) {
  const query = window.matchMedia("(orientation: portrait)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function portraitSnapshot() {
  return window.matchMedia("(orientation: portrait)").matches;
}
