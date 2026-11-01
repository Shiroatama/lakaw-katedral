import type { Poi } from "@/lib/tour";
import { HeroMedia } from "@/components/hero-media";
import { ObservationKeyForm } from "@/components/observation-key";
import { StoryFlow } from "@/components/story-flow";

type PoiDetailProps = {
  poi: Poi;
  banner?: React.ReactNode;
  /** Bottom dock (map launcher + primary action). */
  dock?: React.ReactNode;
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export function PoiDetail({ poi, banner, dock }: PoiDetailProps) {
  return (
    <article className="flex flex-1 flex-col">
      <div className="flex flex-col gap-8 pb-2">
        {/* Edge to edge, from the top of the screen. Page padding is cancelled
            here; the story below stays in the padded column. */}
        <HeroMedia
          poi={poi}
          aspectClassName="aspect-video"
          priority={poi.order === 1}
        />
        {banner}
        <div className="flex flex-col gap-4">
          <header className="fade-up" style={delay(120)}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-fg)]">
              Place {poi.order}
            </p>
            <h1 className="font-display text-3xl leading-tight text-[var(--foreground)] sm:text-4xl">
              {poi.title}
            </h1>
          </header>

          <p
            className="fade-up text-lg leading-relaxed text-[var(--foreground)]/90"
            style={delay(200)}
          >
            {poi.about}
          </p>
        </div>

        <StoryFlow poi={poi} />

        <div className="fade-up" style={delay(360)}>
          <ObservationKeyForm poi={poi} />
        </div>
      </div>
      {dock}
    </article>
  );
}
