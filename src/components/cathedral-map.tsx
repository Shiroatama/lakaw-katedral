"use client";

import { getOrderedPois, useJourneyStore } from "@/lib/tour";

type CathedralMapProps = {
  highlightNext?: boolean;
  variant?: "vector" | "interior";
};

/** Squared twin-tower footprint from the aerial top view. */
const FOOTPRINT =
  "M105 42 H175 L187 56 V84 H204 V122 H192 V270 H214 V326 H176 V338 H104 V326 H66 V270 H88 V122 H76 V84 H93 V56 Z";

export function CathedralMap({
  highlightNext = true,
  variant = "vector",
}: CathedralMapProps) {
  const completed = useJourneyStore((s) => s.completed);
  const lastScannedPoiId = useJourneyStore((s) => s.lastScannedPoiId);
  const pois = getOrderedPois();
  const nextPoi = pois.find((poi) => !completed.includes(poi.id)) ?? null;
  const currentPoi = pois.find((p) => p.id === lastScannedPoiId) ?? null;
  const featuredPoi = highlightNext ? nextPoi : currentPoi;

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

        {variant === "interior" ? (
          <image
            href="/img/cathedral-painted-interior.jpg"
            width="280"
            height="360"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#mapFrame)"
          />
        ) : (
          <>
            <g filter="url(#softShadow)">
              <path
                d={FOOTPRINT}
                fill="#E8D8C8"
                stroke="var(--stone)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>
          </>
        )}

        <text
          x="140"
          y="352"
          textAnchor="middle"
          fill="var(--muted-fg)"
          fontSize="10"
          fontFamily="var(--font-body), sans-serif"
        >
          Entrance
        </text>

        {/* Walking route */}
        {variant === "interior" ? (
          <polyline
            points={pois.map((p) => `${p.map.x},${p.map.y}`).join(" ")}
            fill="none"
            stroke="var(--surface)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.82"
          />
        ) : null}
        <polyline
          points={pois.map((p) => `${p.map.x},${p.map.y}`).join(" ")}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 7"
          opacity="0.62"
        />

        {pois.map((poi) => {
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
                  cx={poi.map.x}
                  cy={poi.map.y}
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
                  cx={poi.map.x}
                  cy={poi.map.y}
                  r="12"
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth="3"
                  style={{ transition: "fill 400ms var(--ease-out)" }}
                />
                <text
                  x={poi.map.x}
                  y={poi.map.y}
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
