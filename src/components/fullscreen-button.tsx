"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ExitFullScreenIcon,
  FullScreenIcon,
} from "@/components/icons";
import {
  isAppFullscreen,
  toggleAppFullscreen,
} from "@/lib/fullscreen";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Permanent floating control in the upper-right: enter/leave browser
 * fullscreen when the browser supports it.
 */
export function FullscreenButton() {
  const hydrated = useHydrated();
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const root = document.documentElement as HTMLElement & {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => void | Promise<void>;
    };
    setSupported(
      typeof root.requestFullscreen === "function" ||
        typeof root.webkitRequestFullscreen === "function",
    );
    setActive(isAppFullscreen());

    function sync() {
      setActive(isAppFullscreen());
    }
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  if (!hydrated || !supported) return null;

  const label = active ? "Exit full screen" : "Enter full screen";

  const controls = (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[45]">
      <div className="mx-auto flex w-full max-w-lg justify-end px-5 md:max-w-4xl">
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={toggleAppFullscreen}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--foreground)]/80 text-[var(--background)] shadow-sm backdrop-blur-md transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {active ? (
            <ExitFullScreenIcon className="h-5 w-5" />
          ) : (
            <FullScreenIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );

  return createPortal(controls, document.body);
}
