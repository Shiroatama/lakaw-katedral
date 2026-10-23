"use client";

import { getOrderedPois, useJourneyStore } from "@/lib/tour";

type CathedralMapProps = {
  highlightNext?: boolean;
  variant?: "interior" | "compound";
};

/** Compound view coordinates (mapped onto the upper-right Cathedral in the aerial compound plan). */
const COMPOUND_POSITIONS: Record<string, { x: number; y: number }> = {
  saints: { x: 199, y: 170 },
  mural: { x: 184, y: 148 },
  cathedra: { x: 199, y: 66 },
};

export function CathedralMap({
  highlightNext = true,
  variant = "interior",
}: CathedralMapProps) {
  const completed = useJourneyStore((s) => s.completed);
  const lastScannedPoiId = useJourneyStore((s) => s.lastScannedPoiId);
  const pois = getOrderedPois();
  const nextPoi = pois.find((poi) => !completed.includes(poi.id)) ?? null;
  const currentPoi = pois.find((p) => p.id === lastScannedPoiId) ?? null;
  const featuredPoi = highlightNext ? nextPoi : currentPoi;

  const getCoords = (poi: (typeof pois)[number]) =>
    variant === "compound"
      ? (COMPOUND_POSITIONS[poi.id] ?? poi.map)
      : poi.map;

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

        {/* Courtyard / outside */}
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

        {pois.map((poi) => {
          const coords = getCoords(poi);
          const isDone = completed.includes(poi.id);
          const isCurrent = lastScannedPoiId === poi.id;
          const isNext = nextPoi?.id === poi.id;
          // Green = here or finished, orange = next, gray = not unlocked.
          const fill =
            isCurrent || isDone
              ? "var(--success)"
              : isNext
                ? "var(--accent)"
                : "var(--muted)";
          const isHighlighted =
            (highlightNext && isNext) || (!highlightNext && isCurrent);

          return (
            <g key={poi.id}>
              {isHighlighted ? (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="17"
                  fill="none"
                  stroke={fill}
                  strokeWidth="2"
                  className="marker-ping"
                />
              ) : null}
              <g
                className="map-marker"
                style={{ "--i": poi.order - 1 } as React.CSSProperties}
              >
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="12"
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth="3"
                  style={{ transition: "fill 400ms var(--ease-out)" }}
                />
                <text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--accent-fg)"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-body), sans-serif"
                >
                  {poi.order}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
