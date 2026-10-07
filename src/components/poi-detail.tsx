import Image from "next/image";
import type { Poi } from "@/lib/tour";

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
      <div className="flex flex-col gap-6">
        {/* Edge to edge, from the top of the screen. Page padding is cancelled
            here; the story below stays in the padded column. */}
        <div className="relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] aspect-[4/3] overflow-hidden bg-[var(--stone-light)]">
          {/* Served as-is (not via /_next/image) so the service worker can precache it for offline use. */}
          <Image
            src={poi.heroImage}
            alt={poi.title}
            fill
            unoptimized
            className="hero-settle object-cover"
            sizes="100vw"
            priority={poi.order === 1}
          />
        </div>
        {banner}
        <div className="flex flex-col gap-2">
          <header className="fade-up" style={delay(120)}>
            <h1 className="font-display text-3xl leading-tight text-[var(--foreground)]">
              {poi.title}
            </h1>
          </header>

          <p
            className="fade-up text-base leading-relaxed text-[var(--foreground)]/90"
            style={delay(220)}
          >
            {poi.about}
          </p>
        </div>

        {poi.fact ? (
          <aside
            className="fade-up rounded-xl bg-[var(--foreground)] px-5 py-4 text-[var(--accent-fg)]"
            style={delay(320)}
          >
            <h2 className="text-base font-bold">Interesting fact</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--accent-fg)]/90">
              {poi.fact}
            </p>
          </aside>
        ) : null}

        <section className="fade-up flex flex-col gap-2" style={delay(420)}>
          <h2 className="text-lg font-bold text-[var(--foreground)]">History</h2>
          <p className="text-base leading-relaxed text-[var(--foreground)]/90">
            {poi.history}
          </p>
        </section>
      </div>
      {dock}
    </article>
  );
}
