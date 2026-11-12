type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Leave the full-screen video. */
export function CloseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

/** Back chevron for place, handoff, and gate top bars. */
export function ChevronLeftIcon({ className = "h-[22px] w-[22px]" }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.2} className={className}>
      <path d="M15 6 9 12l6 6" />
    </svg>
  );
}

/** Map pin for the "N of 16" chip. */
export function MapPinIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}

/** Two gold coins for the points stub on Walk. */
export function CoinsIcon({ className = "h-5 w-[26px]" }: IconProps) {
  return (
    <svg viewBox="0 0 26 20" aria-hidden="true" className={className}>
      <ellipse cx="9" cy="12" rx="7.2" ry="6.2" fill="#b8922e" />
      <ellipse cx="9" cy="11" rx="7.2" ry="6.2" fill="#e0b84a" stroke="#8a6a1e" strokeWidth="1" />
      <ellipse cx="9" cy="11" rx="4.2" ry="3.6" fill="none" stroke="#c4922e" strokeWidth="1" />
      <ellipse cx="17" cy="10" rx="7.2" ry="6.2" fill="#b8922e" />
      <ellipse cx="17" cy="9" rx="7.2" ry="6.2" fill="#f0d48a" stroke="#8a6a1e" strokeWidth="1" />
      <ellipse cx="17" cy="9" rx="4.2" ry="3.6" fill="none" stroke="#c4922e" strokeWidth="1" />
    </svg>
  );
}

/** Horizontal three-dot menu trigger. */
export function MoreHorizontalIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

/** Check mark for a done pin. */
export function PinCheckIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path
        d="M3 8.2 6.4 11.5 13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
