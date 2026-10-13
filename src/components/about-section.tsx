"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/icons";

type AboutSectionProps = {
  about: string;
  aboutMore: string[];
  /** Stagger delay for the fade-up on first paint. */
  delayMs?: number;
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

/**
 * Short about always visible; longer history behind Read more / Show less
 * so the quest stays near the first screen. Open and close both animate.
 */
export function AboutSection({
  about,
  aboutMore,
  delayMs = 220,
}: AboutSectionProps) {
  const [open, setOpen] = useState(false);
  const hasMore = aboutMore.length > 0;

  return (
    <div className="fade-up flex flex-col gap-2" style={delay(delayMs)}>
      <p className="text-base leading-relaxed text-[var(--foreground)]/90">
        {about}
      </p>
      {hasMore ? (
        <>
          <div className="about-more" data-open={open ? "true" : "false"}>
            <div className="about-more-inner">
              <div className="flex flex-col gap-2">
                {aboutMore.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-base leading-relaxed text-[var(--foreground)]/90"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="about-more-toggle"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Show less" : "Read more"}
            {open ? (
              <ChevronUpIcon className="h-3.5 w-3.5" />
            ) : (
              <ChevronDownIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </>
      ) : null}
    </div>
  );
}
