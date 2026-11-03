import Image from "next/image";
import type { Poi } from "@/lib/tour";
import { PlaceVideo } from "@/components/place-video";
import { StewardCredit } from "@/components/steward-credit";

type HeroMediaProps = {
  poi: Poi;
  /** CSS aspect ratio utility for stills, e.g. aspect-video (16:9). */
  aspectClassName?: string;
  priority?: boolean;
};

/**
 * Full-bleed place hero. A video uses `poi.heroVideoFrame`: landscape is
 * 16:9, portrait is 3:4 so the dock stays clear of the player. Otherwise
 * the still. Served from /public so Serwist can precache it.
 */
export function HeroMedia({
  poi,
  aspectClassName = "aspect-[4/3]",
  priority = false,
}: HeroMediaProps) {
  const frameClass = !poi.heroVideo
    ? aspectClassName
    : poi.heroVideoFrame === "portrait"
      ? "aspect-[3/4]"
      : "aspect-video";

  return (
    <div
      className={`relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] overflow-hidden bg-[var(--stone-light)] ${frameClass}`}
    >
      {poi.heroVideo ? (
        <PlaceVideo
          src={poi.heroVideo}
          poster={poi.heroVideoPoster ?? poi.heroImage}
          label={poi.title}
          frame={poi.heroVideoFrame ?? "landscape"}
        >
          {poi.order === 1 ? (
            <>
              {/* Soft top wash so the crest stays readable on bright sky. */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/45 to-transparent"
                aria-hidden
              />
              <StewardCredit />
            </>
          ) : null}
        </PlaceVideo>
      ) : (
        <Image
          src={poi.heroImage}
          alt={poi.title}
          fill
          unoptimized
          className="hero-settle object-cover"
          sizes="100vw"
          priority={priority}
        />
      )}
    </div>
  );
}
