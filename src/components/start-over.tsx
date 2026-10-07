"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { RepeatIcon } from "@/components/icons";
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
  const cancelRef = useRef<HTMLButtonElement>(null);
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
      cancelRef.current?.focus({ preventScroll: true });
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
      data-open={open}
      inert={!open}
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
        className="confirm-panel relative w-full max-w-sm rounded-xl bg-[var(--surface)] px-5 py-5 shadow-[0_16px_48px_rgba(42,33,28,0.22)] ring-1 ring-[var(--border)] outline-none"
      >
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
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={confirmStartOver}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--danger)] px-5 text-base font-semibold text-white transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97] active:brightness-90"
          >
            <RepeatIcon className="h-[1.1em] w-[1.1em]" />
            Start over
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-transparent px-5 text-base font-medium text-[var(--foreground)] transition-[transform,background-color] duration-200 ease-[var(--ease-out)] hover:bg-[var(--background)] active:scale-[0.97]"
          >
            Go back
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
        className={`mx-auto inline-flex min-h-12 items-center justify-center gap-1.5 px-4 text-sm text-[var(--danger)] transition-opacity duration-200 hover:opacity-70 active:opacity-50 ${className}`.trim()}
      >
        <RepeatIcon className="h-3.5 w-3.5" />
        <span className="underline underline-offset-2">Start over</span>
      </button>
      {hydrated ? createPortal(dialog, document.body) : null}
    </>
  );
}
