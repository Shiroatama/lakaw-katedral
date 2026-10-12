import Image from "next/image";
import type { Poi } from "@/lib/tour";
import { nagaTour } from "@/lib/tour";
import { StopDock } from "@/components/stop-dock";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

/**
 * Soft gate when someone opens place 2+ before the walk has begun.
 * Place first (short crop + about), then a dark welcome card, then the usual
 * map head + begin-at-entrance dock.
 */
export function StartHere({ poi }: { poi: Poi }) {
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
          className="fade-up rounded-xl bg-[var(--foreground)] px-5 py-4 text-[var(--accent-fg)]"
          style={delay(320)}
          role="status"
        >
          <h2 className="text-base font-bold">This walk is made for you</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--accent-fg)]/90">
            <p>
              Lakaw Katedral is a short walk through this Cathedral. At each
              place, you read a story and look closely.
            </p>
            <p>
              To start, go to the main door and scan the QR there. There are{" "}
              {placeCount} places. Tap the map to find the door.
            </p>
          </div>
        </aside>
      </div>

      <StopDock startGate startLabel="Begin at the entrance" />
    </article>
  );
}
