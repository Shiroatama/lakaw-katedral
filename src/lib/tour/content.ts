import type { Poi, Tour } from "./types";

/**
 * Visitor-facing copy for the MVP walk (guide items 1–3).
 *
 * Source of truth: docs/PILGRIM-GUIDE.md (parish pilgrim guide).
 * Real names and key terms stay exact; words around them are plain (about
 * Grade 3). Each hard term is explained the first time it appears.
 * See docs/SPEC.md sections 3.1 and 7.
 *
 * Each stop, in order: about (short, what is here), aboutMore (Read more),
 * action (what to do), observation key (look and answer). About copy never
 * carries instructions.
 * `landmark` lines are placeholders until the parish confirms where each QR
 * sign will be mounted (SPEC §17). Hero images reuse existing assets until
 * dedicated photos are provided.
 *
 * Observation answers below are trial placeholders until confirmed on site
 * with the parish. Wrong answers will frustrate real pilgrims; walk the
 * route and fix them before print.
 */
export const nagaTour: Tour = {
  id: "naga-cathedral",
  version: 11,
  name: "Lakaw Katedral",
  siteName: "Naga Metropolitan Cathedral",
  steward: {
    name: "The Naga Metropolitan Cathedral",
    logo: "/img/naga-metropolitan-cathedral.png",
  },
  // Home landing copy. Drawn from the pilgrim guide welcome and tagline.
  intro: {
    hook: "Welcome, dear pilgrim and visitor.",
    fact: "You are entering a living story of faith. This Cathedral has stood at the heart of Bicol for more than four centuries.",
    teasers:
      "Discover the heritage. Encounter the saints. Meet Christ.",
  },
  pois: [
    {
      id: "saints",
      slug: "saints",
      order: 1,
      title: "The Cathedral Entrance",
      shortTitle: "Entrance",
      landmark:
        "At the main door of the Cathedral. Stand in front of the doors.",
      heroImage: "/img/entrance.webp",
      about:
        "Did you know this Cathedral has stood at the heart of Bicol for more than four centuries, through earthquakes, typhoons, and fire? At this door are two patrons: Saint John the Evangelist, Patron Saint of the Cathedral Parish, and Saint Peter Baptist, Patron Saint of the Archdiocese of Cáceres.",
      aboutMore: [
        "The present church was begun in 1808 and finished in 1843. It has a Romanesque look, with strong stone walls, twin towers, and a dome. It was restored and rededicated in 1988.",
        "The diocese was founded in 1595. This is the mother church of the Archdiocese of Cáceres.",
        "When you stand at this door, you stand where generations of Bicolano faithful have entered to pray, give thanks, and ask for help.",
      ],
      action:
        "Stand at the main door. Begin with prayer. Ask Saint John and Saint Peter Baptist to walk with you, protect you, and lead you closer to Christ.",
      observation: {
        look: "Look above the main door. Find the gold coat of arms, then the crown above it.",
        question: "What animal do you see above the crown?",
        answers: [
          "bird",
          "a bird",
          "dove",
          "a dove",
          "the dove",
          "white bird",
          "white dove",
        ],
        // Confirmed from facade photos: dove (Holy Spirit) in the panel above the crown.
        reveal:
          "That bird is a dove, a sign of the Holy Spirit. Above the crown at the door, it welcomes you as you enter the house of God.",
      },
      map: { x: 140, y: 307 },
    },
    {
      id: "mural",
      slug: "mural",
      order: 2,
      title: "The Alcomendas Mural",
      shortTitle: "Mural",
      landmark:
        // Placeholder until parish confirms exact QR mount. Aim: visible cue
        // inside the door, not the mural title again.
        "Walk in through the main doors. Find the angels that hold the holy water. The QR is behind those angels.",
      heroImage: "/img/murals.webp",
      about:
        "You are part of a story that began centuries ago. This mural by Bicolano artist Raul Alcomendas is a visual story of Naga and Bicol: life before the Spanish came, the years of faith and mission, and the life of the people today.",
      aboutMore: [
        "It also tells how the Gospel came to Bicol: the missionaries who came, the communities they served, and the generations who received and passed on the faith.",
        "Look for scenes of prayer, community, and local life. Sacred and everyday stories sit side by side, so the wall feels both holy and close to home.",
      ],
      action:
        "Stand before the mural. Find one scene of the missionaries or the people of Bicol. Give thanks that you are part of a story that began centuries ago.",
      observation: {
        // Placeholder count and meaning: confirm on site before launch.
        look: "Look closely at the mural. Find a cross painted in the scene.",
        question: "How many crosses can you count?",
        answers: ["3", "three"],
        reveal:
          "Those crosses mark the heart of the story on this wall: Christ crucified, and the faith the missionaries brought to Bicol. Each cross you found is a quiet sign of that Good News.",
      },
      map: { x: 140, y: 190 },
    },
    {
      id: "cathedra",
      slug: "cathedra",
      order: 3,
      title: "The Cathedra",
      shortTitle: "Cathedra",
      landmark:
        "Keep walking toward the sanctuary, the area around the altar. Find the Archbishop's Chair.",
      heroImage: "/img/statue.webp",
      about:
        "Did you know a cathedral takes its name from the cathedra? This is the Archbishop's Chair. Because this chair is here, this church is a cathedral: the mother church of the Archdiocese of Cáceres.",
      aboutMore: [
        "It is more than a seat of honor. Here the Archbishop teaches and shepherds the people of Bicol.",
        "When you pause here, remember the shepherds who have guided this Church, and the faithful who gather under their care.",
      ],
      action:
        "Find the Archbishop's Chair. Pause. Give thanks for the shepherds who teach and care for God's people.",
      observation: {
        look: "Look at the Cathedra. Find the cloth or cushion on the seat.",
        question: "What color is it?",
        answers: ["white", "pure white"],
        // Confirmed with parish / on-site: seat cloth is white.
        reveal:
          "White is a color of light and holiness. On the Cathedra, it marks a chair of teaching and care, not a throne of gold. It reminds us that the Archbishop shepherds God's people with humble strength.",
      },
      map: { x: 140, y: 78 },
    },
  ],
};

export function getPoiBySlug(slug: string) {
  return nagaTour.pois.find((poi) => poi.slug === slug);
}

export function getPoiById(id: string) {
  return nagaTour.pois.find((poi) => poi.id === id);
}

export function getOrderedPois() {
  return [...nagaTour.pois].sort((a, b) => a.order - b.order);
}

/** Plain place name for CTAs. Cathedra keeps its exact casing. */
export function placeCtaName(poi: Poi): string {
  return poi.shortTitle === "Cathedra"
    ? "Cathedra"
    : poi.shortTitle.toLowerCase();
}

/**
 * Soft dock CTA when moving on after a solved quest.
 * Entrance resume (left mid-quest): "Continue at the entrance".
 * Later places: "Next: the mural" (opens the map).
 */
export function nextPlaceCtaLabel(poi: Poi): string {
  if (poi.order === 1) {
    return "Continue at the entrance";
  }
  return `Next: the ${placeCtaName(poi)}`;
}

/** Gate CTA when this place must be finished before another can open. */
export function continuePlaceCtaLabel(poi: Poi): string {
  return `Continue at the ${placeCtaName(poi)}`;
}
