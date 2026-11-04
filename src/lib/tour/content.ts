import type { Poi, Tour } from "./types";

/**
 * Visitor-facing copy for the walk (guide items 1–3; 9 as places 4–5;
 * outdoor bell pavilion as place 6; guide 14 Quadricentennial Dome as place 7;
 * guide 13 Porta Mariae as place 8).
 *
 * Source of truth: docs/PILGRIM-GUIDE.md (parish pilgrim guide).
 * Real names and key terms stay exact; words around them are plain (about
 * Grade 3). Each hard term is explained the first time it appears.
 * See docs/SPEC.md sections 3.1 and 7.
 *
 * Each stop, in order: about (short lead), aboutMore + storyImages (editorial
 * photo beats), action (what to do), observation key (look and answer). About
 * copy never carries instructions.
 * `landmark` lines are placeholders until the parish confirms where each QR
 * sign will be mounted (SPEC §17). Hero images reuse existing assets until
 * dedicated photos are provided. `storyImages` pair with `aboutMore` for the
 * editorial photo story. Optional `heroVideo` fills the hero. `heroVideoFrame`
 * is landscape (16:9) or portrait (3:4 on the page). Place 1 plays the landscape
 * cathedral clip. Place 2 plays the portrait entrance clip.
 *
 * Observation answers below are trial placeholders until confirmed on site
 * with the parish. Wrong answers will frustrate real pilgrims; walk the
 * route and fix them before print.
 */
export const nagaTour: Tour = {
  id: "naga-cathedral",
  version: 18,
  name: "Lakaw Katedral",
  siteName: "Naga Metropolitan Cathedral",
  steward: {
    name: "The Naga Metropolitan Cathedral",
    logo: "/img/naga-metropolitan-cathedral.png",
  },
  // Home landing copy: short welcome, walk invite, prize.
  intro: {
    hook: "Welcome.",
    fact: "Take a walk and learn more about the cathedral.",
    teasers: "Finish for a surprise prize.",
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
      heroVideo: "/video/cathedral.mp4",
      heroVideoFrame: "landscape",
      storyImages: [
        "/img/home-facade.webp",
        "/img/dome.webp",
        "/img/prayer.webp",
      ],
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
      map: { x: 140, y: 336 },
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
      heroVideo: "/video/entrance.mp4",
      heroVideoFrame: "portrait",
      heroVideoPoster: "/img/entrance.webp",
      storyImages: [
        "/img/dome.webp",
        "/img/prayer.webp",
        "/img/give-people.webp",
      ],
      about:
        "You are part of a story that began centuries ago. This mural by Bicolano artist Raul Alcomendas is a visual story of Naga and Bicol: life before the Spanish came, the years of faith and mission, and the life of the people today.",
      aboutMore: [
        "It also tells how the Gospel came to Bicol: the missionaries who came, the communities they served, and the generations who received and passed on the faith.",
        "Look for scenes of prayer on the wall. People kneeling, hands raised, and quiet moments of trust.",
        "Sacred and everyday stories sit side by side here: community, local life, and faith close to home.",
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
      map: { x: 104, y: 298 },
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
      storyImages: [
        "/img/cathedral-compound.webp",
        "/img/dome.webp",
        "/img/prayer.webp",
      ],
      about:
        "Did you know a cathedral takes its name from the cathedra? This is the Archbishop's Chair. Because this chair is here, this church is a cathedral: the mother church of the Archdiocese of Cáceres.",
      aboutMore: [
        "It is more than a seat of honor. From this chair the Archbishop teaches and shepherds the people of Bicol.",
        "This house of God is the mother church of the Archdiocese of Cáceres, a living center of faith for the region.",
        "When you pause here, remember the shepherds who have guided this Church, and the faithful who gather under their care.",
      ],
      action:
        "Find the Archbishop's Chair. Pause. Give thanks for the shepherds who teach and care for God's people.",
      observation: {
        look: "Look at the Cathedra. Find the cloth or cushion on the seat and backrest.",
        question: "What color is it?",
        answers: ["red", "deep red", "crimson", "maroon"],
        // Confirmed from sanctuary photo: Cathedra upholstery is deep red.
        reveal:
          "Red is the color of the Holy Spirit, of love, and of the martyrs who gave their lives for Christ. On the Cathedra, it reminds us that the Archbishop shepherds God's people with courage and love.",
      },
      map: { x: 140, y: 78 },
    },
    {
      id: "bells",
      slug: "bells",
      order: 4,
      title: "The Heritage Bells",
      shortTitle: "Bells",
      landmark:
        // Placeholder until parish confirms QR mount and best exit path.
        "Leave near the sanctuary by a side door. Walk outside toward the Heritage Bells and Candle Garden. Find the green bells on stone pedestals.",
      heroImage: "/img/bell-san-juan.webp",
      storyImages: [
        "/img/bell-sagrada-familia.webp",
        "/img/bell-san-juan.webp",
        "/img/cathedral-compound.webp",
      ],
      about:
        "Did you know the Cathedral keeps old bronze bells outdoors as monuments of faith? These heritage bells once called Bicolanos to prayer, worship, celebration, and service.",
      aboutMore: [
        "Four bells belong to this garden story. Centuries of faith. One continuing story.",
        "One is the Campana de San Juan Evangelista from 1850, named for Saint John the Evangelist, Patron Saint of the Cathedral Parish.",
        "Another is the Campana de Sagrada Familia from 1894, the Bell of the Holy Family.",
      ],
      action:
        "Stand before the heritage bells on their pedestals. Give thanks for the generations who heard these voices call them to God.",
      observation: {
        // Year read from the on-site plaque under Campana de Sagrada Familia.
        look: "Look at the plaque under the Bell of the Holy Family, the Campana de Sagrada Familia.",
        question: "What year do you see on the plaque?",
        answers: ["1894"],
        reveal:
          "That year marks when this bell was cast for the Holy Family. Beside the other heritage bells, it joins centuries of Bicolanos who heard church bells call them to prayer.",
      },
      // Outdoor stop: shown on the compound map only (see cathedral-map).
      map: { x: 162, y: 68 },
    },
    {
      id: "candles",
      slug: "candles",
      order: 5,
      title: "The Candle Garden",
      shortTitle: "Candles",
      landmark:
        // Placeholder until parish confirms QR mount.
        "From the pedestal bells, walk to the alcove under the sign that reads Heritage Bells and Candle Garden. Find the hanging bell and the candle racks.",
      heroImage: "/img/candle-garden.webp",
      storyImages: [
        "/img/candle-garden.webp",
        "/img/bell-san-juan.webp",
        "/img/prayer.webp",
      ],
      about:
        "Did you know the Campana de la Paz, the Bell of Peace, is the Cathedral's oldest preserved heritage bell? It dates from 1743 and hangs in this Candle Garden.",
      aboutMore: [
        "This alcove is a quiet place to light a candle and offer a prayer.",
        "When the Campana de la Paz sounds, remember the countless Bicolanos who heard church bells call them to prayer, worship, celebration, and service.",
        "Four bells. Centuries of faith. One continuing story.",
      ],
      action:
        "Light a candle. Offer a prayer. Then, where permitted, ring the Campana de la Paz.",
      observation: {
        // Year from parish pilgrim guide (Campana de la Paz, 1743). Confirm on plaque.
        look: "Look at the Campana de la Paz plaque on the wall of the alcove.",
        question: "What year was this bell cast?",
        answers: ["1743"],
        reveal:
          "1743 makes the Campana de la Paz the oldest preserved heritage bell here. Its voice still joins the faith of Bicol across the centuries.",
      },
      // Outdoor stop: shown on the compound map only (see cathedral-map).
      map: { x: 120, y: 52 },
    },
    {
      id: "pavilion",
      slug: "pavilion",
      order: 6,
      title: "The Bell Pavilion",
      shortTitle: "Pavilion",
      landmark:
        // Placeholder until parish confirms QR mount, access rules, and parish name.
        "From the Candle Garden, walk to the white round pavilion on the lawn. Look for the domed roof with a cross, the hanging bells, and the metal stairs.",
      heroImage: "/img/quadricentennial-dome.webp",
      storyImages: [
        "/img/quadricentennial-dome.webp",
        "/img/bell-san-juan.webp",
        "/img/cathedral-compound.webp",
      ],
      about:
        "Did you know this white pavilion holds bells under an open roof? It stands near the heritage bells, another outdoor voice of prayer on the Cathedral grounds.",
      aboutMore: [
        "The metal stairs lead to a higher walk when staff allow it. From there you can look across the compound.",
        "The cross on the roof marks this as a place of faith, not only a landmark on the lawn.",
        "Together with the heritage bells nearby, it keeps the sound of calling to prayer close to the outdoor garden.",
      ],
      action:
        "Stand at the Bell Pavilion. Give thanks for the bells that call people to God. Ascend carefully only where staff allow it.",
      observation: {
        // Visible on site: four round columns under the pavilion roof.
        look: "Look at the base of the Bell Pavilion. Count the large round columns that hold it up.",
        question: "How many columns do you see?",
        answers: ["4", "four"],
        reveal:
          "Those four columns lift the roof so the bells can hang in open air. From here the outdoor walk of faith continues across the compound.",
      },
      // Outdoor stop: shown on the compound map only (see cathedral-map).
      map: { x: 78, y: 42 },
    },
    {
      id: "dome",
      slug: "dome",
      order: 7,
      title: "The Quadricentennial Dome",
      shortTitle: "Dome",
      landmark:
        // Placeholder until parish confirms QR mount.
        "Walk into the open plaza between the Cathedral and the Porta Mariae. Find the white round dome with a golden crown on top.",
      heroImage: "/img/plaza-dome.webp",
      storyImages: [
        "/img/plaza-dome-front.webp",
        "/img/plaza-dome-cathedral.webp",
        "/img/porta-mariae.webp",
      ],
      about:
        "Did you know this open rotunda is the Quadricentennial Dome? From the plaza you can see the Cathedral, the seminary, and the Porta Mariae as one living place of faith.",
      aboutMore: [
        "Look up. The ceiling holds stained glass that fills the dome with color and light.",
        "A golden crown sits on the peak. It reminds pilgrims of Ina, Our Lady of Peñafrancia, Queen and Patroness of Bicol.",
        "Parish gatherings often meet here in the open air, with the Cathedral façade and the Marian Gate nearby.",
      ],
      action:
        "Visit the Quadricentennial Dome. Step onto the platform. Look up, look around, and marvel at the beauty of the Cathedral compound.",
      observation: {
        // Visible on site: golden crown on the dome peak.
        look: "Look at the very top of the Quadricentennial Dome.",
        question: "What golden shape sits on the peak?",
        answers: ["crown", "a crown", "the crown", "golden crown", "a golden crown"],
        reveal:
          "The golden crown points to Ina's queenship and to the faith of Bicol. From this dome, church, gate, and city meet as one heritage of faith.",
      },
      // Outdoor stop: shown on the compound map only (see cathedral-map).
      map: { x: 48, y: 72 },
    },
    {
      id: "porta",
      slug: "porta",
      order: 8,
      title: "The Porta Mariae",
      shortTitle: "Porta Mariae",
      landmark:
        // Placeholder until parish confirms QR mount.
        "From the Quadricentennial Dome, walk to the white triumphal arch. Find the name PORTA MARIAE carved above the center arch.",
      heroImage: "/img/porta-mariae.webp",
      storyImages: [
        "/img/porta-mariae-detail.webp",
        "/img/porta-mariae-museum.webp",
        "/img/plaza-dome.webp",
      ],
      about:
        "Did you know Porta Mariae means Marian Gate in Latin? This arch is a landmark of Naga and a monument of love for Ina, Our Lady of Peñafrancia.",
      aboutMore: [
        "It was built for the tercentenary, the 300th year of devotion to Our Lady of Peñafrancia in Bicol (1710 to 2010). The Archdiocese of Cáceres blessed it on 9 September 2010.",
        "Its three floors symbolize the centuries of Ina's heavenly protection and the enduring love of the Bicolanos.",
        "Inside is the Porta Mariae Museum, with rare artifacts of the Peñafrancia devotion. From the upper floor, look up and meet the towering image of Ina watching over Naga.",
      ],
      action:
        "Take your photograph at the Porta Mariae. Visit the museum if it is open. Ascend carefully where allowed. Pause beneath Ina's gaze and entrust yourself to her care.",
      observation: {
        // Years from the Latin plaque: MDCCX-MMX (1710-2010).
        look: "Look at the Latin plaque under the words PORTA MARIAE. Find the years written as MDCCX and MMX.",
        question: "In what year did this devotion begin?",
        answers: ["1710"],
        reveal:
          "1710 marks the start of the Bicolano devotion to Our Lady of Peñafrancia. This gate was raised in 2010 so pilgrims would remember three centuries of Ina's care.",
      },
      // Outdoor stop: shown on the compound map only (see cathedral-map).
      map: { x: 42, y: 125 },
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

/** Plain place name for CTAs. Proper names keep their exact casing. */
export function placeCtaName(poi: Poi): string {
  if (poi.shortTitle === "Cathedra" || poi.shortTitle === "Porta Mariae") {
    return poi.shortTitle;
  }
  return poi.shortTitle.toLowerCase();
}

/**
 * Soft dock CTA when moving on after a solved quest.
 * Entrance resume (left mid-quest): "Continue at the entrance".
 * Later places: "Continue the walk" (opens the map; keeps the destination mysterious).
 */
export function nextPlaceCtaLabel(poi: Poi): string {
  if (poi.order === 1) {
    return "Continue at the entrance";
  }
  return "Continue the walk";
}

/** Gate CTA when this place must be finished before another can open. */
export function continuePlaceCtaLabel(poi: Poi): string {
  return `Continue at the ${placeCtaName(poi)}`;
}
