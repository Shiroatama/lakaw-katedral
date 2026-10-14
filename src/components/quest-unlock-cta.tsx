"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  FootstepsIcon,
} from "@/components/icons";

/** Ink wipe + label rewrite; keep in sync with `.quest-unlock-*` in globals.css. */
const UNLOCK_TOTAL_MS = 800;

type UnlockIcon = "walk" | "check" | "next" | "none";

type QuestUnlockCtaProps = {
  /**
   * `animating` runs ink fill + type rewrite; `live` is the unlocked
   * terracotta CTA (no replay).
   */
  phase: "animating" | "live";
  fromLabel?: string;
  toLabel: string;
  toIcon?: UnlockIcon;
  href?: string;
  onClick?: () => void;
  onUnlocked?: () => void;
};

function UnlockLabel({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: UnlockIcon;
}) {
  if (icon === "none") return <>{children}</>;
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span>{children}</span>
      {icon === "next" ? (
        <ArrowRightIcon className="h-[1.1em] w-[1.1em]" />
      ) : null}
      {icon === "walk" ? (
        <FootstepsIcon className="h-[1.1em] w-[1.1em]" />
      ) : null}
      {icon === "check" ? (
        <CheckIcon className="h-[1.1em] w-[1.1em]" />
      ) : null}
    </span>
  );
}

/**
 * Dock CTA bridge after a correct answer. Starts with the map celebrate:
 * terracotta ink fills left to right and the label rewrites to Next / Finish.
 */
export function QuestUnlockCta({
  phase,
  fromLabel = "Solve the quest first",
  toLabel,
  toIcon = "walk",
  href,
  onClick,
  onUnlocked,
}: QuestUnlockCtaProps) {
  const [live, setLive] = useState(phase === "live");
  const onUnlockedRef = useRef(onUnlocked);
  onUnlockedRef.current = onUnlocked;

  useEffect(() => {
    if (phase === "live") {
      setLive(true);
      return;
    }
    setLive(false);
    const id = window.setTimeout(() => {
      setLive(true);
      onUnlockedRef.current?.();
    }, UNLOCK_TOTAL_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  const animating = phase === "animating";
  const interactive = live || phase === "live";
  const className =
    "quest-unlock relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-md px-5 text-base font-semibold";

  const body = (
    <>
      <span className="quest-unlock-ink" aria-hidden />
      <span className="quest-unlock-labels relative z-10">
        <span
          className={`quest-unlock-from${animating ? " is-out" : ""}`}
          aria-hidden={animating || interactive}
        >
          {fromLabel}
        </span>
        <span
          className={`quest-unlock-to${animating || interactive ? " is-in" : ""}`}
          aria-hidden={!animating && !interactive}
        >
          <UnlockLabel icon={toIcon}>{toLabel}</UnlockLabel>
        </span>
      </span>
    </>
  );

  if (interactive && href) {
    return (
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        className={`${className} is-live`}
        data-phase="live"
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${className}${interactive ? " is-live" : ""}`}
      data-phase={interactive ? "live" : phase}
      disabled={!interactive}
      onClick={interactive ? onClick : undefined}
      aria-label={interactive ? toLabel : fromLabel}
    >
      {body}
    </button>
  );
}
