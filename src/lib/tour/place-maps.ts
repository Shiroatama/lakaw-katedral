/**
 * Area detail maps (compound → area map → QR).
 * Marker coords are in the shared SVG viewBox 280×360.
 * All 16 walk places have a poiId. Area art for 9–16 is still a sketch.
 */

export type AreaMapMarker = {
  order: number;
  x: number;
  y: number;
  title: string;
  /** Live tour stop when this pin can scan / revisit. */
  poiId?: string;
};

export type AreaMapDef = {
  id: string;
  title: string;
  image: string;
  markers: AreaMapMarker[];
};

export const AREA_MAPS: AreaMapDef[] = [
  {
    id: "nave",
    title: "Inside the Cathedral",
    image: "/img/cathedral-interior.webp",
    markers: [
      {
        order: 1,
        x: 140,
        y: 336,
        title: "The Cathedral Entrance",
        poiId: "saints",
      },
      {
        order: 2,
        x: 104,
        y: 298,
        title: "The Alcomendas Mural",
        poiId: "mural",
      },
      {
        order: 3,
        x: 140,
        y: 78,
        title: "The Cathedra",
        poiId: "cathedra",
      },
      {
        order: 9,
        x: 78,
        y: 118,
        title: "The Archbishop's Tomb",
        poiId: "santos",
      },
      {
        order: 10,
        x: 202,
        y: 188,
        title: "The Novenary Image",
        poiId: "ina",
      },
      {
        order: 11,
        x: 202,
        y: 72,
        title: "The Missionary Dome",
        poiId: "missionaries",
      },
      {
        order: 12,
        x: 140,
        y: 40,
        title: "The Tabernacle",
        poiId: "tabernacle",
      },
    ],
  },
  {
    id: "garden",
    title: "Heritage Garden",
    image: "/img/map/area-garden.webp",
    markers: [
      {
        order: 4,
        x: 188,
        y: 168,
        title: "The Heritage Bells",
        poiId: "bells",
      },
      {
        order: 5,
        x: 140,
        y: 278,
        title: "The Candle Garden",
        poiId: "candles",
      },
      {
        order: 6,
        x: 78,
        y: 158,
        title: "The Bell Pavilion",
        poiId: "pavilion",
      },
      {
        order: 7,
        x: 140,
        y: 88,
        title: "The Quadricentennial Dome",
        poiId: "dome",
      },
    ],
  },
  {
    id: "porta",
    title: "Porta Mariae Lane",
    image: "/img/map/area-porta.webp",
    markers: [
      {
        order: 8,
        x: 140,
        y: 96,
        title: "The Porta Mariae",
        poiId: "porta",
      },
    ],
  },
  {
    id: "south",
    title: "South Compound",
    image: "/img/map/area-south.webp",
    markers: [
      {
        order: 13,
        x: 140,
        y: 78,
        title: "The Belfries",
        poiId: "belfries",
      },
      {
        order: 14,
        x: 72,
        y: 198,
        title: "The Adoration Chapel",
        poiId: "gethsemane",
      },
      {
        order: 15,
        x: 210,
        y: 160,
        title: "The Brick Arches",
        poiId: "arches",
      },
      {
        order: 16,
        x: 140,
        y: 286,
        title: "The Holy Family Chapel",
        poiId: "holy-family",
      },
    ],
  },
];

export function getAreaMap(id: string): AreaMapDef | undefined {
  return AREA_MAPS.find((area) => area.id === id);
}

/** Area that contains this compound pin order. */
export function getAreaMapForOrder(order: number): AreaMapDef | undefined {
  return AREA_MAPS.find((area) =>
    area.markers.some((marker) => marker.order === order),
  );
}

export function getAreaMapByPoiId(poiId: string): AreaMapDef | undefined {
  return AREA_MAPS.find((area) =>
    area.markers.some((marker) => marker.poiId === poiId),
  );
}

export function getAreaMarkerTitle(order: number): string | undefined {
  for (const area of AREA_MAPS) {
    const marker = area.markers.find((m) => m.order === order);
    if (marker) return marker.title;
  }
  return undefined;
}

/** Area map pin for a place, when the place sits on an area map. */
export function getAreaPin(
  poiId: string,
): { area: AreaMapDef; x: number; y: number } | undefined {
  for (const area of AREA_MAPS) {
    const marker = area.markers.find((m) => m.poiId === poiId);
    if (marker) return { area, x: marker.x, y: marker.y };
  }
  return undefined;
}

/** Nave spine on the compound overview (places 1–3 sit along it). */
export const COMPOUND_AISLE_X = 200;

/** Center aisle on the nave interior floor plan. */
export const NAVE_AISLE_X = 140;

/** Aisle that keeps a route off the walls, per map. */
export function aisleXFor(areaId: string | null): number {
  return areaId === "nave" ? NAVE_AISLE_X : COMPOUND_AISLE_X;
}

/**
 * Axis-aligned walk path (90° bends only) as an SVG `points` string. Prefers
 * the aisle so the line does not cut diagonally through walls: up/down the
 * aisle, then across.
 */
export function navRoutePoints(
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
