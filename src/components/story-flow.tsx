import Image from "next/image";
import type { Poi } from "@/lib/tour";

type StoryFlowProps = {
  poi: Poi;
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

type Beat = {
  image: string;
  text: string;
};

function beatsFor(poi: Poi): Beat[] {
  const count = Math.min(poi.aboutMore.length, poi.storyImages.length);
  return Array.from({ length: count }, (_, index) => ({
    image: poi.storyImages[index],
    text: poi.aboutMore[index],
  }));
}

/**
 * Photo-led story under the short lead. Alternating full-bleed frames and
 * short copy, with soft settle / drift motion. Not interactive; editorial only.
 */
export function StoryFlow({ poi }: StoryFlowProps) {
  const beats = beatsFor(poi);

  if (beats.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {beats.map((beat, index) => {
        const odd = index % 2 === 1;
        const base = 280 + index * 140;

        return (
          <section
            key={`${beat.image}-${index}`}
            className="story-beat flex flex-col gap-4"
            data-side={odd ? "right" : "left"}
          >
            <div
              className={`fade-up relative overflow-hidden bg-[var(--stone-light)] ${
                odd ? "aspect-video -mr-5 ml-7" : "aspect-video -mx-5"
              }`}
              style={delay(base)}
            >
              <Image
                src={beat.image}
                alt=""
                fill
                unoptimized
                className={`story-drift object-cover ${odd ? "story-drift--alt" : ""}`}
                sizes="100vw"
              />
            </div>
            <p
              className={`fade-up max-w-[34ch] text-base leading-relaxed text-[var(--foreground)]/90 ${
                odd ? "ml-auto text-right" : ""
              }`}
              style={delay(base + 80)}
            >
              {beat.text}
            </p>
          </section>
        );
      })}
    </div>
  );
}
