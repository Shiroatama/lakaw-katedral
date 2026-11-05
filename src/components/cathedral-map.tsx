"use client";

import { useRouter } from "next/navigation";
import {
  getAreaMap,
  getAreaMarkerTitle,
  getOrderedPois,
  useJourneyStore,
} from "@/lib/tour";

type CathedralMapProps = {
  highlightNext?: boolean;
  variant?: "compound" | "place";
  /** Required when variant is "place": which area map to show. */
  areaId?: string;
  /** Compound markers open the area map that contains that order. */
  onEnterPlace?: (order: number) => void;
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
};

/**
 * Compound overview pins in walking order (SVG viewBox 280×360):
 * cathedral entrance → up the hall → sanctuary end → pedestal bells →
 * candle garden → bell pavilion → Quadricentennial Dome → Porta Mariae →
 * lower left → middle lower → center right.
 * Every pin opens the area map that contains that stop (3–5 pins each).
 */
const COMPOUND_MARKERS: MapMarker[] = [
  { order: 1, x: 200, y: 178, poiId: "saints" },
  { order: 2, x: 198, y: 128, poiId: "mural" },
  { order: 3, x: 200, y: 58, poiId: "cathedra" },
  { order: 4, x: 162, y: 68, poiId: "bells" },
  { order: 5, x: 120, y: 52, poiId: "candles" },
  { order: 6, x: 78, y: 42, poiId: "pavilion" },
  { order: 7, x: 48, y: 72, poiId: "dome" },
  { order: 8, x: 42, y: 125, poiId: "porta" },
  { order: 9, x: 45, y: 180 },
  { order: 10, x: 48, y: 235 },
  { order: 11, x: 62, y: 290 },
  { order: 12, x: 110, y: 310 },
  { order: 13, x: 155, y: 305 },
  { order: 14, x: 195, y: 270 },
  { order: 15, x: 215, y: 230 },
  { order: 16, x: 228, y: 195 },
];

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

  const viaAisleThenAcross = { x: from.x, y: to.y };
  const viaAcrossThenAisle = { x: to.x, y: from.y };
  const aisleScore = (p: { x: number }) => Math.abs(p.x - aisleX);
  const bend =
    aisleScore(viaAisleThenAcross) <= aisleScore(viaAcrossThenAisle)
      ? viaAisleThenAcross
      : viaAcrossThenAisle;

  return `${from.x},${from.y} ${bend.x},${bend.y} ${to.x},${to.y}`;
}

/** Center aisle on the nave interior floor plan. */
const NAVE_AISLE_X = 140;

export function CathedralMap({
  highlightNext = true,
  variant = "compound",
  areaId,
  onEnterPlace,
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

  const areaDef =
    variant === "place" && areaId ? getAreaMap(areaId) : undefined;

  // Area maps: only finished places, where you are, and the next stop.
  // Later pins in the cluster stay hidden until they become next.
  const areaMarkers: MapMarker[] = areaDef
    ? areaDef.markers
        .map((marker) => ({
          order: marker.order,
          x: marker.x,
          y: marker.y,
          poiId: marker.poiId,
        }))
        .filter((marker) => {
          const poi = marker.poiId
            ? pois.find((p) => p.id === marker.poiId)
            : undefined;
          if (!poi) return false;
          const isDone = completed.includes(poi.id);
          const isCurrent = lastScannedPoiId === poi.id;
          const isNext = nextPoi?.id === poi.id;
          return isDone || isCurrent || isNext;
        })
    : [];

  const baseMarkers =
    variant === "compound" ? COMPOUND_MARKERS : areaMarkers;
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
    variant === "place" && areaDef?.id === "nave"
      ? NAVE_AISLE_X
      : COMPOUND_AISLE_X;
  const navPoints =
    showNavLine && fromMarker && toMarker
      ? navRoutePoints(fromMarker, toMarker, aisleX)
      : null;

  const mapImage =
    variant === "place" && areaDef
      ? areaDef.image
      : "/img/cathedral-compound.webp";

  const ariaLabel =
    onlyOrders?.length === 1 && tip
      ? `Map of Naga Metropolitan Cathedral. Place 1, the entrance, is marked. ${tip}`
      : variant === "place" && areaDef
        ? `${areaDef.title} map with places ${areaDef.markers.map((m) => m.order).join(", ")}.`
        : featuredPoi
          ? `Map of Naga Metropolitan Cathedral. Place ${featuredPoi.order}, ${featuredPoi.shortTitle}, is highlighted.`
          : "Map of Naga Metropolitan Cathedral";

  return (
    <div className={`w-full${onlyOrders ? " map-live" : ""}`}>
      <svg
        viewBox="0 0 280 360"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={ariaLabel}
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
          href={mapImage}
          width="280"
          height="360"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#mapFrame)"
        />

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
            forceHighlight || (Boolean(poi) && highlightNext && isNext);
          // "You are here" ring when the sheet focuses the current place.
          const isHereRing =
            Boolean(poi) && !highlightNext && isCurrent && !isPulsing;
          // Compound: every pin drills into the area map for that stop.
          const canEnter =
            variant === "compound" && typeof onEnterPlace === "function";
          const canRevisit = variant === "place" && Boolean(poi && isDone);
          const isNextOrForced = Boolean(poi && (isNext || forceHighlight));
          // Scan only from an area map, and only for the next stop.
          const canScan = variant === "place" && isNextOrForced;
          const interactive = canRevisit || canScan || canEnter;

          const pin = (
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
          );

          // Ping sits outside the focusable hit target so the browser focus
          // ring does not grow with the radial pulse.
          const ping =
            isPulsing || isHereRing ? (
              <circle
                cx={marker.x}
                cy={marker.y}
                r="17"
                fill="none"
                stroke={fill}
                strokeWidth="2"
                className="marker-ping"
                style={{ pointerEvents: "none" }}
              />
            ) : null;

          if (!interactive) {
            return (
              <g key={marker.order}>
                {ping}
                {pin}
              </g>
            );
          }

          const placeTitle =
            poi?.shortTitle ??
            getAreaMarkerTitle(marker.order) ??
            "this place";
          const label = canRevisit
            ? `Open place ${marker.order}, ${placeTitle}`
            : canEnter
              ? `Open area map for place ${marker.order}, ${placeTitle}`
              : `Scan QR for place ${marker.order}${poi ? `, ${poi.shortTitle}` : ""}`;

          function activate() {
            if (canRevisit && poi) {
              onBeforeNavigate?.();
              router.push(`/s/${poi.slug}`, {
                transitionTypes: ["nav-forward"],
              });
              return;
            }
            if (canEnter) {
              onEnterPlace?.(marker.order);
              return;
            }
            if (canScan) {
              onBeforeNavigate?.();
              router.push("/scan", { transitionTypes: ["nav-forward"] });
            }
          }

          return (
            <g key={marker.order}>
              {ping}
              <g
                className="map-marker-hit"
                role="button"
                tabIndex={0}
                aria-label={label}
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  (event.currentTarget as SVGGElement).blur();
                  activate();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                  }
                }}
              >
                {/* Invisible hit pad: keeps the tap target stable without the ping. */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r="18"
                  fill="transparent"
                />
                {pin}
              </g>
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
