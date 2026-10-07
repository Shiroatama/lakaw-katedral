"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useJourneyStore } from "@/lib/tour";

/** Quiet destructive action: clears progress after a confirm, then returns home. */
export function StartOver() {
  const router = useRouter();
  const pathname = usePathname();
  const reset = useJourneyStore((s) => s.reset);

  // Home is the next screen. Have it ready so the swap does not wait on a fetch.
  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => {
        if (
          window.confirm(
            "Start again? Your steps so far will be erased.",
          )
        ) {
          reset();
          // Already home: the store update is the whole change.
          // Elsewhere: swap at once. A back transition holds the new
          // screen for about half a second while progress is still clearing.
          if (pathname !== "/") {
            router.push("/");
          }
        }
      }}
      className="mx-auto block min-h-12 px-4 text-sm text-[var(--danger)] underline underline-offset-2 transition-opacity duration-200 hover:opacity-70 active:opacity-50"
    >
      Start over
    </button>
  );
}
