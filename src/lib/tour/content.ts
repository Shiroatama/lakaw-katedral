import type { Tour } from "./types";

/**
 * Visitor-facing copy for the MVP walk (guide items 1–3).
 *
 * Source of truth: docs/PILGRIM-GUIDE.md (parish pilgrim guide).
 * Real names and key terms stay exact; words around them are plain (about
 * Grade 3). Each hard term is explained the first time it appears.
 * See docs/SPEC.md sections 3.1 and 7.
 *
 * Each stop, in order: about (what is here), dark-card action (what to do),
 * observation key (look and answer). About never carries instructions.
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
  version: 5,
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
        "Here at the main door are two patrons of this place: Saint John the Evangelist, Patron Saint of the Cathedral Parish, and Saint Peter Baptist, Patron Saint of the Archdiocese of Cáceres.",
      action:
        "Take holy water. Make the Sign of the Cross. Ask Saint John and Saint Peter Baptist to walk with you, protect you, and lead you closer to Christ.",
      observation: {
        look: "Look at the main doors.",
        question: "How many tall wooden doors stand side by side?",
        answers: ["2", "two"],
        // Placeholder meaning until confirmed on site with the parish.
        reveal:
          "Those two doors welcome everyone who enters this house of God. Side by side, they open the way for you to walk with the saints into the Cathedral.",
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
        "Walk into the nave, the long middle hall of the Cathedral. Pause before the mural of Raul Alcomendas.",
      heroImage: "/img/murals.webp",
      about:
        "This mural is by the Bicolano artist Raul Alcomendas. It tells the story of how the Gospel came to Bicol: the missionaries who came, the communities they served, and the generations who received and passed on the faith.",
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
        "This is the Cathedra, the Archbishop's Chair. It is where the Archbishop teaches and shepherds the flock.",
      action:
        "Find the Archbishop's Chair. Pause. Give thanks for the shepherds who teach and care for God's people.",
      observation: {
        look: "Look at the Cathedra.",
        question: "What is it mainly made of: wood, stone, or metal?",
        answers: ["wood", "wooden"],
        // Placeholder meaning until confirmed on site with the parish.
        reveal:
          "Wood is living material shaped by human hands. The Cathedra is a chair of teaching and care, not a throne of gold. It reminds us that the Archbishop shepherds God's people with humble strength.",
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
