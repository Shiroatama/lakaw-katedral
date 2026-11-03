"use client";

import { getOrderedPois, useJourneyStore } from "@/lib/tour";

type CathedralMapProps = {
  highlightNext?: boolean;
  variant?: "interior" | "compound";
  /** Compound markers 1–3 open the interior floor plan. */
  onEnterInterior?: (order: number) => void;
};

type MapMarker = {
  order: number;
  x: number;
  y: number;
  /** Links to a real tour place when the walk covers it. */
  poiId?: string;
  /** Tapping opens the interior floor plan (MVP places 1–3). */
  opensInterior?: boolean;
};

/**
 * Compound overview pins in walking order (SVG viewBox 280×360):
 * cathedral entrance → up the hall → sanctuary end → left exit →
 * upper left → lower left → middle lower → center right.
 * Places 1–3 still open the interior floor plan.
 */
const COMPOUND_MARKERS: MapMarker[] = [
  { order: 1, x: 200, y: 178, poiId: "saints", opensInterior: true },
  { order: 2, x: 198, y: 128, poiId: "mural", opensInterior: true },
  { order: 3, x: 200, y: 58, poiId: "cathedra", opensInterior: true },
  { order: 4, x: 162, y: 68 }, // left exit
  { order: 5, x: 120, y: 52 },
  { order: 6, x: 78, y: 42 }, // upper left
  { order: 7, x: 48, y: 72 },
  { order: 8, x: 42, y: 125 },
  { order: 9, x: 45, y: 180 },
  { order: 10, x: 48, y: 235 }, // lower left
  { order: 11, x: 62, y: 290 },
  { order: 12, x: 110, y: 310 }, // middle lower
  { order: 13, x: 155, y: 305 },
  { order: 14, x: 195, y: 270 },
  { order: 15, x: 215, y: 230 },
  { order: 16, x: 228, y: 195 }, // center right
];

export function CathedralMap({
  highlightNext = true,
  variant = "compound",
  onEnterInterior,
}: CathedralMapProps) {
  const completed = useJourneyStore((s) => s.completed);
  const lastScannedPoiId = useJourneyStore((s) => s.lastScannedPoiId);
  const pois = getOrderedPois();
  const nextPoi = pois.find((poi) => !completed.includes(poi.id)) ?? null;
  const currentPoi = pois.find((p) => p.id === lastScannedPoiId) ?? null;
  const featuredPoi = highlightNext ? nextPoi : currentPoi;

  const interiorMarkers: MapMarker[] = pois.map((poi) => ({
    order: poi.order,
    x: poi.map.x,
    y: poi.map.y,
    poiId: poi.id,
  }));

  // Interior only: finished places, the one you are in, and the next stop
  // once the current quest is done. Later places stay hidden.
  const revealedInteriorMarkers = interiorMarkers.filter((marker) => {
    const poi = pois.find((p) => p.id === marker.poiId);
    if (!poi) return false;
    const isDone = completed.includes(poi.id);
    const isCurrent = lastScannedPoiId === poi.id;
    const isNext = nextPoi?.id === poi.id;
    return isDone || isCurrent || isNext;
  });

  const markers =
    variant === "compound" ? COMPOUND_MARKERS : revealedInteriorMarkers;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 280 360"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={
          featuredPoi
            ? `Map of Naga Metropolitan Cathedral. Place ${featuredPoi.order}, ${featuredPoi.shortTitle}, is highlighted.`
            : "Map of Naga Metropolitan Cathedral"
        }
      >
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#2a211c"
              floodOpacity="0.08"
            />
          </filter>
          <clipPath id="mapFrame">
            <rect width="280" height="360" rx="16" />
          </clipPath>
        </defs>

        <rect width="280" height="360" fill="var(--background)" rx="16" />

        <image
          href={
            variant === "compound"
              ? "/img/cathedral-compound.webp"
              : "/img/cathedral-interior.webp"
          }
          width="280"
          height="360"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#mapFrame)"
        />

        {variant === "interior" ? (
          <text
            x="140"
            y="357"
            textAnchor="middle"
            fill="var(--muted-fg)"
            fontSize="10"
            fontFamily="var(--font-body), sans-serif"
          >
            Entrance
          </text>
        ) : null}

        {markers.map((marker) => {
          const poi = marker.poiId
            ? pois.find((p) => p.id === marker.poiId)
            : undefined;
          const isDone = poi ? completed.includes(poi.id) : false;
          const isCurrent = poi ? lastScannedPoiId === poi.id : false;
          const isNext = poi ? nextPoi?.id === poi.id : false;
          // Green = here or finished, orange = next, gray = not unlocked / later place.
          const fill =
            isCurrent || isDone
              ? "var(--success)"
              : isNext
                ? "var(--accent)"
                : "var(--muted)";
          const isHighlighted =
            Boolean(poi) &&
            ((highlightNext && isNext) || (!highlightNext && isCurrent));
          const canEnter =
            variant === "compound" &&
            marker.opensInterior &&
            typeof onEnterInterior === "function";

          const body = (
            <>
              {isHighlighted ? (
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r="17"
                  fill="none"
                  stroke={fill}
                  strokeWidth="2"
                  className="marker-ping"
                />
              ) : null}
              <g
                className="map-marker"
                style={{ "--i": marker.order - 1 } as React.CSSProperties}
              >
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r="12"
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth="3"
                  style={{ transition: "fill 400ms var(--ease-out)" }}
                />
                <text
                  x={marker.x}
                  y={marker.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--accent-fg)"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-body), sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {marker.order}
                </text>
              </g>
            </>
          );

          if (!canEnter) {
            return <g key={marker.order}>{body}</g>;
          }

          return (
            <g
              key={marker.order}
              role="button"
              tabIndex={0}
              aria-label={`Open interior map for place ${marker.order}`}
              style={{ cursor: "pointer" }}
              onClick={() => onEnterInterior(marker.order)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onEnterInterior(marker.order);
                }
              }}
            >
              {body}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
