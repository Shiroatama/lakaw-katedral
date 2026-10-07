import type { Tour } from "./types";

/**
 * Draft content from public sources. Real names, places, dates and key terms
 * are kept as they are; the words around them are plain (about Grade 3), and
 * each hard term is explained in a few simple words the first time it appears.
 * Facts must be verified by the parish before launch. See docs/SPEC.md
 * sections 3.1 and 7.
 *
 * `landmark` lines are placeholders until the parish confirms where each QR
 * sign will be mounted (SPEC §17).
 */
export const nagaTour: Tour = {
  id: "naga-cathedral",
  version: 1,
  name: "Lakaw Katedral",
  siteName: "Naga Metropolitan Cathedral",
  intro:
    "A short walk through the Metropolitan Cathedral of Saint John the Evangelist. Learn its story, one place at a time.",
  pois: [
    {
      id: "entrance",
      slug: "entrance",
      order: 1,
      title: "The Entrance and Façade",
      shortTitle: "Entrance",
      landmark:
        "At the main entrance of the Cathedral. Stand in front of the doors and look up at the façade.",
      heroImage: "/img/entrance.jpg",
      body: "The Naga Metropolitan Cathedral is the seat of the Archdiocese of Cáceres. That means it is the main church of a group of churches led by an archbishop. It is one of the oldest in the Philippines. It was created by a papal bull, an official letter from the Pope, on 14 August 1595. A fire destroyed an earlier church in 1768. Building of this stone Cathedral began in 1808, under Bishop Bernardo de la Concepción. It was finished and blessed in 1843. Look up at the façade. It is low and wide, with twin pilasters and two short belfries. Pilasters are flat columns, and belfries are bell towers. This style is called Earthquake Baroque. It was built to stay standing when the ground shakes.",
      fact: "The façade carries the coat of arms of Castile and León, two old kingdoms of Spain.",
      map: { x: 140, y: 307 },
    },
    {
      id: "murals",
      slug: "murals",
      order: 2,
      title: "The Interior Murals",
      shortTitle: "Murals",
      landmark:
        "Walk into the nave, the long middle hall of the Cathedral. Stop at the first big column and look up at the murals.",
      heroImage: "/img/murals.png",
      body: "Step into the nave and look at the columns, arches, and ceiling. The paintings use a trick called trompe-l'oeil. It fools your eyes into seeing depth and carved details on flat walls. Can you tell what is painted? The heavy arcades, or rows of arches, also helped make the Cathedral stronger after the earthquake of 1820.",
      fact: "A typhoon damaged the Cathedral in 1856. An earthquake damaged it in 1887. It was restored each time. A major restoration began in 1987.",
      map: { x: 140, y: 190 },
    },
    {
      id: "statue",
      slug: "statue",
      order: 3,
      title: "Saint John the Evangelist",
      shortTitle: "Statue",
      landmark:
        "Keep walking up the nave toward the altar. The statue of Saint John is near the sanctuary, the area around the altar.",
      heroImage: "/img/statue.png",
      body: "Near the sanctuary, pause at the statue of Saint John the Evangelist. He is the patron of this Cathedral, the saint it is named for. Early tradition remembers him as the beloved disciple and the author of the Fourth Gospel. Naga is a pilgrim city. This is a quiet place to look, pray, and remember who the Cathedral is named for.",
      fact: "The Archdiocese of Cáceres takes its name from the old Spanish colonial capital. The Cathedral is still its mother church.",
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
