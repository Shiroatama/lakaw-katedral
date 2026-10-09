import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

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
 * stable. Fresh home omits `map` for a full-width CTA and skips the shared
 * view-transition name so Chrome does not morph full-width → map+CTA.
 *
 * The map sheet is portaled to <body> so it is not trapped in a transform.
 */
export function StickyActionBar({
  map,
  children,
  /** When false, dock is omitted from the shared view-transition snapshot. */
  shareTransition = true,
}: {
  map?: React.ReactNode;
  children?: React.ReactNode;
  shareTransition?: boolean;
}) {
  const hasActions = Boolean(children);
  const hasMap = map != null;

  return (
    <>
      <div
        className="shrink-0"
        style={{ height: "var(--action-bar-space, 5.5rem)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
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
    </>
  );
}

/** Which way a link moves the page transition. Forward goes deeper into the walk. */
type Direction = "forward" | "back";

const transitionFor = (direction: Direction) => [`nav-${direction}`];

const buttonMotion =
  "transition-[transform,filter,box-shadow,background-color] duration-200 ease-[var(--ease-out)] hover:-translate-y-px active:translate-y-0 active:scale-[0.97]";

type ButtonIcon = "next" | "back" | "none";

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
      <span>{children}</span>
      {icon === "next" ? <ArrowRightIcon className="h-[1.1em] w-[1.1em]" /> : null}
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
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  direction?: Direction;
  /** Arrow for page moves. Defaults to next/back from direction; submit stays plain. */
  icon?: ButtonIcon;
}) {
  const resolvedIcon: ButtonIcon =
    icon ?? (type === "submit" ? "none" : direction === "back" ? "back" : "next");
  const base = `inline-flex min-h-14 w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-fg)] shadow-[0_4px_16px_rgba(184,92,56,0.35)] hover:shadow-[0_8px_22px_rgba(184,92,56,0.4)] hover:brightness-95 active:brightness-90 ${buttonMotion}`;
  const label = <ButtonLabel icon={resolvedIcon}>{children}</ButtonLabel>;

  if (href) {
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
    <button type={type} onClick={onClick} className={`${base} ${className}`.trim()}>
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
