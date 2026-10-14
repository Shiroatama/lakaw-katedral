"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { RepeatIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";
import { useJourneyStore } from "@/lib/tour";
import { useHydrated } from "@/lib/use-hydrated";

/** Quiet destructive action: clears progress after a confirm, then returns home. */
export function StartOver({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const reset = useJourneyStore((s) => s.reset);
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Home is the next screen. Have it ready so the swap does not wait on a fetch.
  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock page scroll and manage focus while the dialog is open.
  // Land on Go back so Enter does not wipe progress by accident.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      panelRef.current
        ?.querySelector<HTMLElement>('button:not([aria-label="Close"])')
        ?.focus({ preventScroll: true });
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  function confirmStartOver() {
    setOpen(false);
    reset();
    // Already home: the store update is the whole change.
    // Elsewhere: swap at once. A back transition holds the new
    // screen for about half a second while progress is still clearing.
    if (pathname !== "/") {
      router.push("/");
    }
  }

  const dialog = (
    <div
      className="confirm-root fixed inset-0 z-50 flex items-center justify-center px-5"
      data-open={open ? "true" : "false"}
      inert={!open ? true : undefined}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        className="confirm-backdrop absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-[2px]"
        aria-label="Dismiss"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="confirm-panel relative w-full max-w-sm rounded-xl bg-[var(--surface)] px-5 pb-5 pt-10 text-center shadow-[0_16px_48px_rgba(42,33,28,0.22)] ring-1 ring-[var(--border)] outline-none"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center text-3xl leading-none text-[var(--foreground)] transition-transform duration-200 ease-[var(--ease-out)] active:scale-90"
          aria-label="Close"
        >
          ×
        </button>
        <h2
          id={titleId}
          className="font-display text-2xl leading-tight text-[var(--foreground)]"
        >
          Start again?
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-base leading-relaxed text-[var(--muted-fg)]"
        >
          Your steps so far will be erased.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <PrimaryButton onClick={() => setOpen(false)} icon="none">
            Go back
          </PrimaryButton>
          <button
            type="button"
            onClick={confirmStartOver}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium text-[var(--danger)] transition-[transform,background-color,color] duration-200 ease-[var(--ease-out)] hover:bg-[var(--background)] active:scale-[0.97]"
          >
            <RepeatIcon className="h-[1.1em] w-[1.1em]" />
            Start over
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`mx-auto inline-flex min-h-12 items-center justify-center px-4 text-sm transition-colors duration-200 active:opacity-70 ${
          className ||
          "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
        }`.trim()}
      >
        Start over
      </button>
      {hydrated ? createPortal(dialog, document.body) : null}
    </>
  );
}
