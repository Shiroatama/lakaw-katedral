import Image from "next/image";
import { nagaTour } from "@/lib/tour";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

type StewardCreditProps = {
  /**
   * `overlay`: absolute on a dark hero (home / video).
   * `sticky`: pinned bar on place and finish pages.
   */
  variant?: "overlay" | "sticky";
};

/** Quiet institutional crest + name. Upper left; not a badge or promo chip. */
export function StewardCredit({ variant = "overlay" }: StewardCreditProps) {
  const { steward } = nagaTour;
  const breakAt = steward.name.lastIndexOf(" ");
  const line1 = steward.name.slice(0, breakAt);
  const line2 = steward.name.slice(breakAt + 1);

  const mark = (
    <div className="flex items-center gap-2">
      <Image
        src={steward.logo}
        alt=""
        width={503}
        height={868}
        unoptimized
        priority
        className="h-11 w-auto shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
      />
      <span className="flex flex-col gap-[0.15em] font-display text-sm leading-none text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        {/*
          Flex items-center is enough for the boxes. Ruwudu’s em-box is much taller
          than the painted caps, so without text-box trim the letters sit high and
          look top-aligned against the crest.
        */}
        <span className="[text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
          {line1}
        </span>
        <span className="[text-box-trim:trim-both] [text-box-edge:cap_alphabetic]">
          {line2}
        </span>
      </span>
    </div>
  );

  if (variant === "sticky") {
    // Zero-height sticky: pins without reserving space or adding top padding.
    // `top` keeps it clear of the notch while stuck; layout padding places it
    // on first paint.
    return (
      <div className="pointer-events-none sticky top-[max(0.85rem,env(safe-area-inset-top))] z-30 h-0 -mx-5 px-5">
        {mark}
      </div>
    );
  }

  return (
    <div
      className="fade-up pointer-events-none absolute left-0 top-0 z-10 px-5 pt-[max(0.85rem,env(safe-area-inset-top))]"
      style={delay(80)}
    >
      {mark}
    </div>
  );
}
