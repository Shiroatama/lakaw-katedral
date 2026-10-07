"use client";

import { useState } from "react";

type ExpandableTextProps = {
  text: string;
  /** Show "Read more" when the text is longer than this many characters. */
  previewLength?: number;
};

export function ExpandableText({
  text,
  previewLength = 160,
}: ExpandableTextProps) {
  const needsToggle = text.length > previewLength;
  const [expanded, setExpanded] = useState(!needsToggle);

  const preview = (() => {
    if (!needsToggle) return text;
    const slice = text.slice(0, previewLength);
    const lastSpace = slice.lastIndexOf(" ");
    return `${(lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
  })();

  const shown = expanded || !needsToggle ? text : preview;

  return (
    <div>
      <p className="text-base leading-relaxed text-[var(--foreground)]/90">
        {shown}
      </p>
      {needsToggle && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--foreground)]"
        >
          Read more
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
