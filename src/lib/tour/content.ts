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
      title: "The Entrance",
      shortTitle: "Entrance",
      landmark:
        "At the main entrance of the Cathedral. Stand in front of the doors and look up.",
      heroImage: "/img/entrance.webp",
      about:
        "The Naga Metropolitan Cathedral is the seat of the Archdiocese of Cáceres. That means it is the main church for many churches led by an archbishop. This diocese is one of the oldest in the Philippines. The Pope created it by a papal bull, an official letter, on 14 August 1595.",
      fact: "Above the doors is the coat of arms of Castile and León, two old kingdoms of Spain.",
      history:
        "Fire destroyed an earlier church here in 1768. Work on this stone Cathedral began in 1808 under Bishop Bernardo de la Concepción. It was finished and blessed in 1843. Look up. The front is low and wide, with twin pilasters beside the doors. Pilasters are flat columns. Two short belfries stand at the sides. Belfries are bell towers. This style is called Earthquake Baroque. It was built to stay strong when the ground shakes.",
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
      heroImage: "/img/murals.webp",
      about:
        "You are in the nave, the long middle hall. Look up at the columns, arches, and ceiling. The paintings use a trick called trompe-l'oeil. It fools your eyes so flat walls look deep or carved. Can you tell what is painted and what is real?",
      fact: "A typhoon hurt the Cathedral in 1856. An earthquake hurt it in 1887. It was repaired each time. A big restoration began in 1987, and the Cathedral was blessed again in 1988.",
      history:
        "After an earthquake in 1820, builders made the inside stronger. Heavy arcades, or rows of arches, hold up the nave and the side halls. The paintings on the columns, arches, and ceiling came later, when the Cathedral was restored.",
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
      heroImage: "/img/statue.webp",
      about:
        "This Cathedral is named for Saint John the Evangelist. He is its patron, the saint it honors. Pause here near the sanctuary, the area around the altar.",
      fact: "The Archdiocese of Cáceres takes its name from the old Spanish colonial capital. This Cathedral is still its mother church.",
      history:
        "Early tradition remembers Saint John as the beloved disciple of Jesus. He is also remembered as the author of the Fourth Gospel. Naga is a pilgrim city. This is a quiet place to look, pray, and remember who the Cathedral is named for.",
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
