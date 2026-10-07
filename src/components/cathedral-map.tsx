"use client";

import { getOrderedPois, useJourneyStore } from "@/lib/tour";

type CathedralMapProps = {
  highlightNext?: boolean;
};

export function CathedralMap({ highlightNext = true }: CathedralMapProps) {
  const completed = useJourneyStore((s) => s.completed);
  const lastScannedPoiId = useJourneyStore((s) => s.lastScannedPoiId);
  const pois = getOrderedPois();
  const nextPoi = pois.find((p) => !completed.includes(p.id)) ?? null;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 280 360"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Simple map of Naga Metropolitan Cathedral"
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
        </defs>

        {/* Courtyard / outside */}
        <rect width="280" height="360" fill="var(--background)" rx="16" />

        {/* Building mass: Latin-cross basilica */}
        <g filter="url(#softShadow)">
          {/* Nave + aisles */}
          <path
            d="M70 95
               H100 V55 H180 V95 H210
               V300
               H180 V320 H100 V300 H70 Z"
            fill="var(--stone-light)"
            stroke="var(--stone)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Sanctuary / apse */}
          <path
            d="M100 55 Q140 18 180 55 Z"
            fill="var(--stone-light)"
            stroke="var(--stone)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Inner nave floor */}
        <rect
          x="108"
          y="88"
          width="64"
          height="200"
          fill="var(--surface)"
          opacity="0.9"
        />

        {/* Column rhythm */}
        {[110, 150, 190, 230].map((y) => (
          <g key={y}>
            <circle cx="118" cy={y} r="3.5" fill="var(--stone)" opacity="0.45" />
            <circle cx="162" cy={y} r="3.5" fill="var(--stone)" opacity="0.45" />
          </g>
        ))}

        {/* Altar platform */}
        <rect
          x="118"
          y="62"
          width="44"
          height="18"
          rx="2"
          fill="var(--ceremonial)"
          opacity="0.35"
        />
        <text
          x="140"
          y="74"
          textAnchor="middle"
          fill="var(--muted-fg)"
          fontSize="9"
          fontFamily="var(--font-body), sans-serif"
        >
          Altar
        </text>

        {/* Entrance threshold */}
        <rect
          x="118"
          y="300"
          width="44"
          height="14"
          rx="2"
          fill="var(--accent)"
          opacity="0.28"
        />
        <text
          x="140"
          y="342"
          textAnchor="middle"
          fill="var(--muted-fg)"
          fontSize="10"
          fontFamily="var(--font-body), sans-serif"
        >
          Entrance
        </text>

        {/* Walking route */}
        <polyline
          points={pois.map((p) => `${p.map.x},${p.map.y}`).join(" ")}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 6"
          opacity="0.55"
        />

        {pois.map((poi) => {
          const isDone = completed.includes(poi.id);
          const isCurrent = lastScannedPoiId === poi.id;
          const isNext = highlightNext && nextPoi?.id === poi.id;
          const labelX = poi.map.x + 46;
          const fill = isDone
            ? "var(--success)"
            : isCurrent
              ? "var(--foreground)"
              : isNext
                ? "var(--accent)"
                : "var(--stone)";

          return (
            <g key={poi.id}>
              {isNext ? (
                <circle
                  cx={poi.map.x}
                  cy={poi.map.y}
                  r="16"
                  fill="none"
                  stroke="var(--accent)"
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
                  r="11"
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth="2.5"
                  style={{ transition: "fill 400ms var(--ease-out)" }}
                />
                <text
                  x={poi.map.x}
                  y={poi.map.y + 4}
                  textAnchor="middle"
                  fill="var(--accent-fg)"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-body), sans-serif"
                >
                  {poi.order}
                </text>
              </g>
              <text
                className="map-label"
                style={{ "--i": poi.order - 1 } as React.CSSProperties}
                x={labelX}
                y={poi.map.y + 4}
                fill="var(--foreground)"
                fontSize="11"
                fontFamily="var(--font-body), sans-serif"
              >
                {poi.shortTitle}
                {isCurrent ? " · here" : ""}
                {isNext && !isCurrent ? " · next" : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
