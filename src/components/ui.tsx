"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FootstepsIcon,
  QrCodeIcon,
} from "@/components/icons";
import { useHydrated } from "@/lib/use-hydrated";

/** Match `.sheet-root` visibility hold so the dock stays above the fading blur. */
const SHEET_CLOSE_MS = 320;

type ProgressBarProps = {
  total: number;
  completed: number;
  currentOrder?: number;
};

export function ProgressBar({
  total,
  completed,
  currentOrder,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(completed, 0), total);
  const pct = total === 0 ? 0 : (clamped / total) * 100;
  const label =
    currentOrder !== undefined
      ? `Place ${currentOrder} of ${total}`
      : `${clamped} of ${total} places`;

  return (
    <div role="status" aria-label={`Progress ${clamped} of ${total}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--muted-fg)]">
        <span>{label}</span>
        <span>
          {clamped}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--stone-light)]">
        <div
          className="bar-fill h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-[var(--ease-out)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** @deprecated Prefer progress on the map bubble */
export function ProgressDots(props: ProgressBarProps) {
  return <ProgressBar {...props} />;
}

/**
 * Fixed bottom dock: optional map chat-head on the left, primary action on the
 * right (Messenger-style). Progress lives on the map circle.
 *
 * When `map` is passed, its column is a fixed h-14 w-14 so the CTA width stays
 * stable (including Home).
 *
 * Dock and map sheet both portal to <body> so z-index competes with the blur
 * backdrop (page ViewTransition wrappers would otherwise trap the dock under it).
 */
export function StickyActionBar({
  map,
  children,
  /** When false, dock is omitted from the shared view-transition snapshot. */
  shareTransition = true,
  /**
   * Lift above the map sheet backdrop so the map head + primary CTA stay
   * sharp and tappable while the rest of the screen is blurred. Stays lifted
   * through the close fade so the dock does not slip under the blur mid-animation.
   */
  elevated = false,
}: {
  map?: React.ReactNode;
  children?: React.ReactNode;
  shareTransition?: boolean;
  elevated?: boolean;
}) {
  const hydrated = useHydrated();
  const [lifted, setLifted] = useState(elevated);
  const hasActions = Boolean(children);
  const hasMap = map != null;

  useEffect(() => {
    if (elevated) {
      setLifted(true);
      return;
    }
    const id = window.setTimeout(() => setLifted(false), SHEET_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [elevated]);

  const dock = (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 ${lifted ? "z-50" : "z-30"}`}
      style={
        shareTransition ? { viewTransitionName: "stop-dock" } : undefined
      }
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-lg items-center gap-3 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {hasMap ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center">
            {map}
          </div>
        ) : null}
        {hasActions ? (
          <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div
        className="shrink-0"
        style={{ height: "var(--action-bar-space, 5.5rem)" }}
        aria-hidden
      />
      {hydrated ? createPortal(dock, document.body) : dock}
    </>
  );
}

/** Which way a link moves the page transition. Forward goes deeper into the walk. */
type Direction = "forward" | "back";

const transitionFor = (direction: Direction) => [`nav-${direction}`];

const buttonMotion =
  "transition-[transform,filter,background-color] duration-200 ease-[var(--ease-out)] hover:-translate-y-px active:translate-y-0 active:scale-[0.97]";

type ButtonIcon = "next" | "back" | "walk" | "check" | "qr" | "none";

function ButtonLabel({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: ButtonIcon;
}) {
  if (icon === "none") return children;
  return (
    <span className="inline-flex items-center justify-center gap-2">
      {icon === "back" ? <ArrowLeftIcon className="h-[1.1em] w-[1.1em]" /> : null}
      {icon === "qr" ? <QrCodeIcon className="h-[1.1em] w-[1.1em]" /> : null}
      <span>{children}</span>
      {icon === "next" ? <ArrowRightIcon className="h-[1.1em] w-[1.1em]" /> : null}
      {icon === "walk" ? <FootstepsIcon className="h-[1.1em] w-[1.1em]" /> : null}
      {icon === "check" ? <CheckIcon className="h-[1.1em] w-[1.1em]" /> : null}
    </span>
  );
}

export function PrimaryButton({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  direction = "forward",
  icon,
  disabled = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  className?: string;
  direction?: Direction;
  /** Trailing/leading mark. Defaults to next/back from direction; submit stays plain. Use walk for begin / find-place, check for finish. */
  icon?: ButtonIcon;
  disabled?: boolean;
}) {
  const resolvedIcon: ButtonIcon =
    icon ?? (type === "submit" ? "none" : direction === "back" ? "back" : "next");
  const base = `inline-flex min-h-14 w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-fg)] hover:brightness-95 active:brightness-90 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 disabled:bg-[var(--stone-light)] disabled:text-[var(--muted-fg)] disabled:hover:brightness-100 ${buttonMotion}`;
  const label = <ButtonLabel icon={resolvedIcon}>{children}</ButtonLabel>;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        transitionTypes={transitionFor(direction)}
        className={`${base} ${className}`.trim()}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${className}`.trim()}
    >
      {label}
    </button>
  );
}

export function SecondaryButton({
  children,
  href,
  onClick,
  direction = "forward",
  icon,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  direction?: Direction;
  icon?: ButtonIcon;
}) {
  const resolvedIcon: ButtonIcon =
    icon ?? (direction === "back" ? "back" : "none");
  const className = `inline-flex min-h-12 w-full items-center justify-center rounded-md border border-[var(--border)] bg-transparent px-5 text-base font-medium text-[var(--foreground)] hover:bg-[var(--surface)] ${buttonMotion}`;
  const label = <ButtonLabel icon={resolvedIcon}>{children}</ButtonLabel>;

  if (href) {
    return (
      <Link
        href={href}
        transitionTypes={transitionFor(direction)}
        className={className}
      >
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}
