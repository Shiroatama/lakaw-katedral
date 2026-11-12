"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Btn, TextBtn } from "@/components/ui";
import { useJourneyStore } from "@/lib/tour";
import { useHydrated } from "@/lib/use-hydrated";

/** Quiet destructive action: clears progress after a confirm, then returns home. */
export function StartOver({ className = "" }: { className?: string }) {
  const router = useRouter();
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

  // Manage focus while the dialog is open. Land on Go back so Enter does not
  // wipe progress by accident.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      panelRef.current
        ?.querySelector<HTMLElement>("button.btn")
        ?.focus({ preventScroll: true });
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  function confirmStartOver() {
    setOpen(false);
    reset();
    router.push("/");
  }

  const dialog = (
    <div
      className="confirm-root fixed inset-0 z-50 flex items-center justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
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
        className="confirm-panel relative max-h-full w-full max-w-sm overflow-y-auto rounded-[22px] bg-[var(--background)] px-4 pb-4 pt-8 text-center shadow-[0_16px_48px_rgba(42,33,28,0.22)] outline-none"
      >
        <h2
          id={titleId}
          className="font-display text-[28px] leading-tight text-[var(--foreground)]"
        >
          Start again?
        </h2>
        <p
          id={descriptionId}
          className="mt-2 font-[family-name:var(--font-body)] text-base leading-snug text-[var(--muted-fg)]"
        >
          Your steps so far will be erased.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Btn onClick={() => setOpen(false)}>Go back</Btn>
          <TextBtn
            onClick={confirmStartOver}
            className="!text-[var(--danger)]"
          >
            Start over
          </TextBtn>
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
        className={`text-btn ${className}`.trim()}
      >
        Start over
      </button>
      {hydrated ? createPortal(dialog, document.body) : null}
    </>
  );
}
