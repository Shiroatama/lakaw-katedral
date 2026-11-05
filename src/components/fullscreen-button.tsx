"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type RefCallback,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ExitFullScreenIcon,
  FullScreenIcon,
} from "@/components/icons";
import {
  isAppFullscreen,
  toggleAppFullscreen,
} from "@/lib/fullscreen";
import { useHydrated } from "@/lib/use-hydrated";

/** DOM node that hosts the floating map head (right of fullscreen). */
export const MapHeadSlotContext = createContext<HTMLElement | null>(null);

export function useMapHeadSlot() {
  return useContext(MapHeadSlotContext);
}

type FullscreenButtonProps = {
  /** Receives the empty slot where the map head portals in. */
  mapSlotRef?: RefCallback<HTMLDivElement | null>;
};

/**
 * Permanent floating controls in the upper-right: fullscreen on the left,
 * map head slot on the right (same size as fullscreen when filled).
 */
export function FullscreenButton({ mapSlotRef }: FullscreenButtonProps) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);
  /** Scan uses its own close control; hide the floating chrome there. */
  const hidden = pathname === "/scan";

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

  if (!hydrated || hidden) return null;

  const label = active ? "Exit full screen" : "Enter full screen";

  const controls = (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[45]">
      <div className="mx-auto flex w-full max-w-lg items-center justify-end gap-2 px-5 md:max-w-4xl">
        {supported ? (
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={toggleAppFullscreen}
            className="pointer-events-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)]/80 text-[var(--background)] shadow-sm backdrop-blur-md transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {active ? (
              <ExitFullScreenIcon className="h-5 w-5" />
            ) : (
              <FullScreenIcon className="h-5 w-5" />
            )}
          </button>
        ) : null}
        <div
          ref={mapSlotRef}
          className="flex shrink-0 items-center justify-center"
        />
      </div>
    </div>
  );

  return createPortal(controls, document.body);
}
