import Image from "next/image";
import type { Poi } from "@/lib/tour";
import { nagaTour, placeCtaName } from "@/lib/tour";
import { StopDock } from "@/components/stop-dock";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

type StartHereProps = {
  poi: Poi;
  /** The place they should solve next (entrance, or a later stop). */
  expected: Poi;
  /** Walk has not begun yet; CTA goes to Home. Otherwise continue at expected. */
  unstarted: boolean;
};

/**
 * Soft gate when someone opens a place that is not next to solve.
 * Place first (short crop, title, about), then a sans editorial caption
 * (place N of M + short intro), then Start the walk (Home) or Continue at
 * the expected place.
 */
export function StartHere({ poi, expected, unstarted }: StartHereProps) {
  const placeCount = nagaTour.pois.length;

  return (
    <article className="flex flex-1 flex-col">
      <div className="flex flex-col gap-5 pb-[calc(var(--action-bar-space)+0.5rem)]">
        {/* Shorter window only: image stays full scale, top/bottom are clipped. */}
        <div
          className="fade-up relative -mx-5 -mt-[max(1rem,env(safe-area-inset-top))] aspect-[2/1] overflow-hidden bg-[var(--stone-light)]"
          style={delay(80)}
        >
          <div className="absolute inset-x-0 top-1/2 aspect-[4/3] -translate-y-1/2">
            <Image
              src={poi.heroImage}
              alt={poi.title}
              fill
              unoptimized
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <header className="fade-up" style={delay(160)}>
            <h1 className="font-display text-3xl leading-tight text-[var(--foreground)]">
              {poi.title}
            </h1>
          </header>
          <p
            className="fade-up text-base leading-relaxed text-[var(--foreground)]/90"
            style={delay(240)}
          >
            {poi.about}
          </p>
        </div>

        <aside
          className="fade-up border-l-[3px] border-[var(--accent)] py-1 pl-4"
          style={delay(320)}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
            This is place {poi.order} of {placeCount}
          </p>
          {unstarted ? (
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--foreground)]/90">
              <p>
                Lakaw Katedral is a short walk through {placeCount} places in
                this Cathedral. Did you know this house of God has stood at the
                heart of Bicol for more than 400 years, through earthquakes,
                typhoons, and fire?
              </p>
              <p>
                Do you want to know why it is called a cathedral, and not just
                a big church? Ready to walk from the door and learn more about
                this Cathedral and its story? Finish every place and the church
                has a small surprise prize waiting for you.
              </p>
              <p className="text-[var(--muted-fg)]">
                Tap Start the walk below.
              </p>
            </div>
          ) : (
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--foreground)]/90">
              <p>
                You found this place a little early. Finish the quest at the{" "}
                {placeCtaName(expected)} first, then come back here.
              </p>
              <p className="text-[var(--muted-fg)]">
                The walk goes in order. Tap Continue at the{" "}
                {placeCtaName(expected)} below when you are ready.
              </p>
            </div>
          )}
        </aside>
      </div>

      {unstarted ? (
        <StopDock startGate hideMap />
      ) : (
        <StopDock continueTo={expected} hideMap />
      )}
    </article>
  );
}
