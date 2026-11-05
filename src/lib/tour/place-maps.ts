/**
 * Area detail maps (compound → area with 3–4 pins → QR).
 * Marker coords are in the shared SVG viewBox 280×360.
 * Orders 9–16 are provisional until those stops ship (no poiId).
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

/** @deprecated Use AreaMapDef */
export type PlaceMapDef = AreaMapDef;

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
      {
        order: 9,
        x: 72,
        y: 188,
        title: "The First Archbishop",
      },
      {
        order: 10,
        x: 140,
        y: 210,
        title: "Meet Ina",
      },
      {
        order: 11,
        x: 208,
        y: 230,
        title: "The Missionary Dome",
      },
    ],
  },
  {
    id: "south",
    title: "South Compound",
    image: "/img/map/area-south.webp",
    markers: [
      {
        order: 12,
        x: 200,
        y: 200,
        title: "The Tabernacle",
      },
      {
        order: 13,
        x: 140,
        y: 78,
        title: "The Belfries",
      },
      {
        order: 14,
        x: 72,
        y: 198,
        title: "Gethsemane",
      },
      {
        order: 15,
        x: 210,
        y: 160,
        title: "The Parish Office",
      },
      {
        order: 16,
        x: 140,
        y: 286,
        title: "The Holy Family Chapel",
      },
    ],
  },
];

/** Alias kept for older imports. */
export const PLACE_MAPS = AREA_MAPS;

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

/** @deprecated Use getAreaMapForOrder */
export function getPlaceMap(order: number): AreaMapDef | undefined {
  return getAreaMapForOrder(order);
}

/** @deprecated Use getAreaMapByPoiId */
export function getPlaceMapByPoiId(poiId: string): AreaMapDef | undefined {
  return getAreaMapByPoiId(poiId);
}
