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
 * then one interesting fact. About never carries instructions.
 * `landmark` lines are placeholders until the parish confirms where each QR
 * sign will be mounted (SPEC §17). Hero images reuse existing assets until
 * dedicated photos are provided.
 */
export const nagaTour: Tour = {
  id: "naga-cathedral",
  version: 4,
  name: "Lakaw Katedral",
  siteName: "Naga Metropolitan Cathedral",
  steward: {
    name: "Archdiocese of Cáceres",
    logo: "/img/archdiocese-caceres.png",
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
        "Ask them to walk with you, protect you, and lead you closer to Christ.",
      fact: "Every image, arch, bell, stone, and sacred space in this Cathedral has a story to tell you.",
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
        "Look closely at the mural. Give thanks that you are part of a story that began centuries ago.",
      fact: "Evangelization means bringing the Good News of Jesus to people. This mural remembers that long work in Bicol.",
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
        "Pause here. Give thanks for the shepherds who teach and care for God's people.",
      fact: "The Cathedra is more than a chair of honor. It shows the Archbishop's teaching and pastoral authority. Pastoral means caring for God's people. It also reminds us that the Cathedral is the mother church of the Archdiocese of Cáceres.",
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
