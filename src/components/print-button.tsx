"use client";

export function PrintButton({ children = "Print" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-fg)] shadow-[0_4px_16px_rgba(184,92,56,0.35)] transition-[transform,filter] duration-200 ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97]"
    >
      {children}
    </button>
  );
}
