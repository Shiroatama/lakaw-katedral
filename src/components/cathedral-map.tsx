"use client";

import { useRouter } from "next/navigation";
import { getOrderedPois, useJourneyStore } from "@/lib/tour";

type CathedralMapProps = {
  highlightNext?: boolean;
  variant?: "interior" | "compound";
  /** Compound markers for indoor places open the interior floor plan. */
  onEnterInterior?: (order: number) => void;
  /**
   * When set, only these place orders are drawn (compound onboarding uses
   * `[1]` so only the entrance pin shows).
   */
  onlyOrders?: number[];
  /** Short tip drawn near the first shown marker (onboarding). */
  tip?: string;
  /** Runs before scan / revisit navigation (e.g. close the map sheet). */
  onBeforeNavigate?: () => void;
};

type MapMarker = {
  order: number;
  x: number;
  y: number;
  /** Links to a real tour place when the walk covers it. */
  poiId?: string;
  /** Tapping opens the interior floor plan (indoor places only). */
  opensInterior?: boolean;
};

/**
 * Compound overview pins in walking order (SVG viewBox 280×360):
 * cathedral entrance → up the hall → sanctuary end → pedestal bells →
 * candle garden → bell pavilion → Quadricentennial Dome → Porta Mariae →
 * lower left → middle lower → center right.
 * Indoor places (1–3) open the interior floor plan. Places 4–8 stay outdoors.
 */
const COMPOUND_MARKERS: MapMarker[] = [
  { order: 1, x: 200, y: 178, poiId: "saints", opensInterior: true },
  { order: 2, x: 198, y: 128, poiId: "mural", opensInterior: true },
  { order: 3, x: 200, y: 58, poiId: "cathedra", opensInterior: true },
  { order: 4, x: 162, y: 68, poiId: "bells" }, // pedestal heritage bells
  { order: 5, x: 120, y: 52, poiId: "candles" }, // Candle Garden / Campana de la Paz
  { order: 6, x: 78, y: 42, poiId: "pavilion" }, // Bell Pavilion
  { order: 7, x: 48, y: 72, poiId: "dome" }, // Quadricentennial Dome (plaza rotunda)
  { order: 8, x: 42, y: 125, poiId: "porta" }, // Porta Mariae
  { order: 9, x: 45, y: 180 },
  { order: 10, x: 48, y: 235 }, // lower left
  { order: 11, x: 62, y: 290 },
  { order: 12, x: 110, y: 310 }, // middle lower
  { order: 13, x: 155, y: 305 },
  { order: 14, x: 195, y: 270 },
  { order: 15, x: 215, y: 230 },
  { order: 16, x: 228, y: 195 }, // center right
];

const INTERIOR_POI_IDS = new Set(
  COMPOUND_MARKERS.filter((m) => m.opensInterior && m.poiId).map(
    (m) => m.poiId as string,
  ),
);

/** Indoor walk stops that use the cathedral floor plan (places 1–3). */
export function isInteriorPlace(poiId: string): boolean {
  return INTERIOR_POI_IDS.has(poiId);
}

/** Center aisle on the interior floor plan (entrance and Cathedra sit here). */
const INTERIOR_AISLE_X = 140;
/** Nave spine on the compound overview (places 1–3 sit along it). */
const COMPOUND_AISLE_X = 200;

/**
 * Axis-aligned walk path (90° bends only). Prefers the aisle so the line
 * does not cut diagonally through walls: up/down the aisle, then across.
 */
function navRoutePoints(
  from: { x: number; y: number },
  to: { x: number; y: number },
  aisleX: number,
): string {
  if (from.x === to.x || from.y === to.y) {
    return `${from.x},${from.y} ${to.x},${to.y}`;
  }

  // Two possible L corners: vertical-first or horizontal-first.
  const viaAisleThenAcross = { x: from.x, y: to.y };
  const viaAcrossThenAisle = { x: to.x, y: from.y };
  const aisleScore = (p: { x: number }) => Math.abs(p.x - aisleX);
  const bend =
    aisleScore(viaAisleThenAcross) <= aisleScore(viaAcrossThenAisle)
      ? viaAisleThenAcross
      : viaAcrossThenAisle;

  return `${from.x},${from.y} ${bend.x},${bend.y} ${to.x},${to.y}`;
}

export function CathedralMap({
  highlightNext = true,
  variant = "compound",
  onEnterInterior,
  onlyOrders,
  tip,
  onBeforeNavigate,
}: CathedralMapProps) {
  const router = useRouter();
  const completed = useJourneyStore((s) => s.completed);
  const lastScannedPoiId = useJourneyStore((s) => s.lastScannedPoiId);
  const pois = getOrderedPois();
  const nextPoi = pois.find((poi) => !completed.includes(poi.id)) ?? null;
  const currentPoi = pois.find((p) => p.id === lastScannedPoiId) ?? null;
  const featuredPoi = highlightNext ? nextPoi : currentPoi;

  const interiorMarkers: MapMarker[] = pois
    .filter((poi) => INTERIOR_POI_IDS.has(poi.id))
    .map((poi) => ({
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

  const baseMarkers =
    variant === "compound" ? COMPOUND_MARKERS : revealedInteriorMarkers;
  const markers =
    onlyOrders && onlyOrders.length > 0
      ? baseMarkers.filter((marker) => onlyOrders.includes(marker.order))
      : baseMarkers;
  const tipMarker = tip ? markers[0] : undefined;

  // One dashed hop only: last finished place → next place. Never draw ahead
  // to place 3 while the walker is still heading to place 2.
  const fromPoi = nextPoi
    ? (pois.find((poi) => poi.order === nextPoi.order - 1) ?? null)
    : null;
  const fromMarker = fromPoi
    ? (markers.find((marker) => marker.poiId === fromPoi.id) ?? null)
    : null;
  const toMarker = nextPoi
    ? (markers.find((marker) => marker.poiId === nextPoi.id) ?? null)
    : null;
  const showNavLine =
    !onlyOrders &&
    Boolean(fromMarker && toMarker) &&
    Boolean(fromPoi && completed.includes(fromPoi.id));
  const aisleX =
    variant === "interior" ? INTERIOR_AISLE_X : COMPOUND_AISLE_X;
  const navPoints =
    showNavLine && fromMarker && toMarker
      ? navRoutePoints(fromMarker, toMarker, aisleX)
      : null;

  return (
    <div className={`w-full${onlyOrders ? " map-live" : ""}`}>
      <svg
        viewBox="0 0 280 360"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={
          onlyOrders?.length === 1 && tip
            ? `Map of Naga Metropolitan Cathedral. Place 1, the entrance, is marked. ${tip}`
            : featuredPoi
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

        {navPoints ? (
          <g aria-hidden>
            <polyline
              points={navPoints}
              fill="none"
              stroke="var(--surface)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.82"
            />
            <polyline
              points={navPoints}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 7"
              opacity="0.72"
            />
          </g>
        ) : null}

        {tipMarker && tip ? (
          <MapTip x={tipMarker.x} y={tipMarker.y} text={tip} />
        ) : null}

        {markers.map((marker) => {
          const poi = marker.poiId
            ? pois.find((p) => p.id === marker.poiId)
            : undefined;
          const isDone = poi ? completed.includes(poi.id) : false;
          const isCurrent = poi ? lastScannedPoiId === poi.id : false;
          const isNext = poi ? nextPoi?.id === poi.id : false;
          const forceHighlight = Boolean(onlyOrders?.includes(marker.order));
          // Green = here or finished, orange = next, gray = not unlocked / later place.
          const fill =
            isCurrent || isDone
              ? "var(--success)"
              : isNext || forceHighlight
                ? "var(--accent)"
                : "var(--muted)";
          // Pulse = next place to scan (or onboarding entrance).
          const isPulsing =
            forceHighlight ||
            (Boolean(poi) && highlightNext && isNext);
          // "You are here" ring when the sheet focuses the current place.
          const isHereRing =
            Boolean(poi) && !highlightNext && isCurrent && !isPulsing;
          // Compound indoor pins open the interior first. Scan is only from
          // the interior (or from compound for outdoor places with no interior).
          const canEnter =
            variant === "compound" &&
            Boolean(marker.opensInterior) &&
            typeof onEnterInterior === "function" &&
            !isDone;
          const canRevisit = Boolean(poi && isDone);
          const isNextOrForced = Boolean(poi && (isNext || forceHighlight));
          const canScan =
            isNextOrForced &&
            (variant === "interior" ||
              (variant === "compound" && !marker.opensInterior));
          const interactive = canRevisit || canScan || canEnter;

          const body = (
            <>
              {isPulsing || isHereRing ? (
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

          if (!interactive) {
            return <g key={marker.order}>{body}</g>;
          }

          const label = canRevisit
            ? `Open place ${marker.order}, ${poi?.shortTitle ?? "earlier place"}`
            : canEnter
              ? `Open interior map for place ${marker.order}`
              : `Scan QR for place ${marker.order}${poi ? `, ${poi.shortTitle}` : ""}`;

          function activate() {
            if (canRevisit && poi) {
              onBeforeNavigate?.();
              router.push(`/s/${poi.slug}`, {
                transitionTypes: ["nav-forward"],
              });
              return;
            }
            // Compound indoor: switch to that place's interior before scan.
            if (canEnter) {
              onEnterInterior?.(marker.order);
              return;
            }
            if (canScan) {
              onBeforeNavigate?.();
              router.push("/scan", { transitionTypes: ["nav-forward"] });
            }
          }

          return (
            <g
              key={marker.order}
              role="button"
              tabIndex={0}
              aria-label={label}
              style={{ cursor: "pointer" }}
              onClick={activate}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  activate();
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

/** Speech tip to the left of a compound pin (entrance sits mid-right). */
function MapTip({ x, y, text }: { x: number; y: number; text: string }) {
  const width = 118;
  const height = 52;
  const left = Math.max(8, x - width - 18);
  const top = Math.max(8, y - height / 2);

  return (
    <g aria-hidden>
      <path
        d={`M ${x - 14} ${y} L ${left + width} ${y - 6} L ${left + width} ${y + 6} Z`}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="1"
      />
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx="10"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="1"
        filter="url(#softShadow)"
      />
      <foreignObject x={left} y={top} width={width} height={height}>
        <div
          style={{
            boxSizing: "border-box",
            height: "100%",
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "11px",
            lineHeight: 1.35,
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          {text}
        </div>
      </foreignObject>
    </g>
  );
}
