import Image from "next/image";
import type { Poi } from "@/lib/tour";

type HeroMediaProps = {
  poi: Poi;
  /** CSS aspect ratio utility, e.g. aspect-video (16:9) or aspect-[4/3]. */
  aspectClassName?: string;
  priority?: boolean;
};

/**
 * Full-bleed place hero. Uses a muted looping video when `poi.heroVideo` is
 * set; otherwise the still. Served from /public so Serwist can precache it.
 */
export function HeroMedia({
  poi,
  aspectClassName = "aspect-[4/3]",
  priority = false,
}: HeroMediaProps) {
  return (
    <div
      className={`relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] overflow-hidden bg-[var(--stone-light)] ${aspectClassName}`}
    >
      {poi.heroVideo ? (
        <video
          className="hero-settle absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poi.heroImage}
          aria-label={poi.title}
        >
          <source src={poi.heroVideo} type="video/mp4" />
        </video>
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
