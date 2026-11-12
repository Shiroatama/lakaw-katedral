import type { Tour } from "./types";

/**
 * Visitor-facing copy for all 16 walk places.
 * Guide items 1–3 are places 1–3. Guide 9 is places 4–5. The outdoor bell
 * pavilion is place 6 (not a guide item). Guide 14 is place 7. Guide 13 is
 * place 8. Guide items 4–8 and 10–12 are places 9–16, after the outdoor loop.
 * Guide items 15 and 16 (Mass offering and the souvenir shop) are not places.
 *
 * Source of truth: docs/PILGRIM-GUIDE.md (parish pilgrim guide).
 * Real names and key terms stay exact; words around them are plain (about
 * Grade 3). Each hard term is explained the first time it appears.
 * See docs/SPEC.md sections 3.1 and 7.
 *
 * Each stop, in order: about (short lead), aboutMore (story beats, shown as
 * prose with `about` before the quest), action (what to do), quest (tap-only:
 * cloze, order, count, select all, or a single choice). About copy never
 * carries instructions. Everything a quest asks is knowable from the story
 * or by looking at the place. Nobody types an answer.
 * `landmark` lines are placeholders until the parish confirms where each QR
 * sign will be mounted (SPEC §17). Hero images reuse existing assets until
 * dedicated photos are provided. `storyImages` pair with `aboutMore` for a
 * future photo story. Optional `heroVideo` fills the teach media slot.
 * `heroVideoFrame` is landscape (16:9) or portrait (3:4 on the page). Place 1
 * plays the landscape cathedral clip.
 * `map` is the compound overview pin (shared 280×360 viewBox).
 *
 * Quest answers below are trial placeholders until confirmed on site
 * with the parish. Wrong answers will frustrate real pilgrims; walk the
 * route and fix them before print.
 */
export const nagaTour: Tour = {
  id: "naga-cathedral",
  version: 19,
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
        "This door has welcomed the faithful of Bicol for centuries. Above it is a gold coat of arms, and a crown above that coat of arms.",
        "The present church was begun in 1808 and finished in 1843. It has a Romanesque look, with strong stone walls, twin towers, and a dome. It was restored and rededicated in 1988.",
        "The diocese was founded in 1595. This is the mother church of the Archdiocese of Cáceres.",
        "When you stand at this door, you stand where generations of Bicolano faithful have entered to pray, give thanks, and ask for help.",
      ],
      action:
        "Stand at the main door. Ask Saint John and Saint Peter Baptist to walk with you.",
      quest: {
        type: "cloze",
        look: "Look above the main door.",
        question: "Finish the line from what you see and read.",
        // Confirmed from facade photos: dove (Holy Spirit) in the panel above the crown.
        cloze: {
          before: "Above the crown is a",
          after: ".",
          answer: "Bird",
          chips: ["Bird", "Angel", "Lion", "Lamb"],
        },
        reveal:
          "That bird is a dove, a sign of the Holy Spirit. It welcomes you as you enter the house of God.",
        nudges: [
          "Not quite. Look again.",
          "Try once more. Check above the crown.",
          "It is the bird.",
        ],
      },
      map: { x: 200, y: 178 },
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
      storyImages: [
        "/img/murals.webp",
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
        "Stand before the mural. Give thanks that you are part of this story.",
      quest: {
        // Placeholder count and meaning: confirm on site before launch.
        type: "count",
        look: "Look along the mural.",
        question: "How many crosses can you count?",
        count: { min: 1, max: 6, answer: 3 },
        reveal:
          "Those crosses mark Christ on this wall, and the faith the missionaries brought to Bicol.",
        nudges: [
          "Not quite. Look along the wall again.",
          "Try once more. Count only the crosses.",
          "There are three.",
        ],
      },
      map: { x: 198, y: 128 },
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
        "The cloth on the seat is red. Here red marks the Holy Spirit, love, and the martyrs: courage and care for God's people.",
        "It is more than a seat of honor. From this chair the Archbishop teaches and shepherds the people of Bicol.",
        "This house of God is the mother church of the Archdiocese of Cáceres, a living center of faith for the region.",
        "When you pause here, remember the shepherds who have guided this Church, and the faithful who gather under their care.",
      ],
      action:
        "Find the Archbishop's Chair. Pause. Give thanks for the shepherds who care for God's people.",
      quest: {
        // Confirmed from sanctuary photo: Cathedra upholstery is deep red.
        type: "select_all",
        look: "Look at the Cathedra. Find the cloth on the seat.",
        question: "Red on the Cathedra marks which of these?",
        selectAll: {
          options: [
            "The Holy Spirit",
            "Love",
            "The martyrs",
            "The Spanish crown",
          ],
          answers: ["The Holy Spirit", "Love", "The martyrs"],
        },
        reveal:
          "Red is the color of the Holy Spirit, of love, and of the martyrs. On the Cathedra it marks courage and care.",
        nudges: [
          "Not quite. Red marks more than one meaning here.",
          "Try once more. Think of Spirit, love, and the martyrs.",
          "Select the Holy Spirit, love, and the martyrs.",
        ],
      },
      map: { x: 200, y: 58 },
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
      quest: {
        // Year read from the on-site plaque under Campana de Sagrada Familia.
        type: "cloze",
        look: "Look at the plaque under the Bell of the Holy Family, the Campana de Sagrada Familia.",
        question: "Finish the line from the plaque.",
        cloze: {
          before: "The Campana de Sagrada Familia is from",
          after: ".",
          answer: "1894",
          chips: ["1743", "1850", "1894", "1988"],
        },
        reveal:
          "That year marks when this bell was cast for the Holy Family. Beside the other heritage bells, it joins centuries of Bicolanos who heard church bells call them to prayer.",
        nudges: [
          "Not quite. Read the plaque again.",
          "Try once more. Look under the Bell of the Holy Family.",
          "The plaque says 1894.",
        ],
      },
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
      quest: {
        // Facts from the parish pilgrim guide (Campana de la Paz, 1743). Confirm on plaque.
        type: "select_all",
        look: "Look at the Campana de la Paz plaque on the wall of the alcove.",
        question: "Which lines are true about the Campana de la Paz?",
        selectAll: {
          options: [
            "The Bell of Peace",
            "The oldest preserved heritage bell",
            "From 1743",
            "From 1894",
          ],
          answers: [
            "The Bell of Peace",
            "The oldest preserved heritage bell",
            "From 1743",
          ],
        },
        reveal:
          "1743 makes the Campana de la Paz the oldest preserved heritage bell here. Its voice still joins the faith of Bicol across the centuries.",
        nudges: [
          "Not quite. More than one line is true.",
          "Try once more. Think of its name, its age, and its year.",
          "Select the Bell of Peace, the oldest bell, and 1743.",
        ],
      },
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
      quest: {
        // Visible on site: four round columns under the pavilion roof.
        type: "count",
        look: "Look at the base of the Bell Pavilion. Count the large round columns that hold it up.",
        question: "How many columns do you see?",
        count: { min: 1, max: 8, answer: 4 },
        reveal:
          "Those four columns lift the roof so the bells can hang in open air. From here the outdoor walk of faith continues across the compound.",
        nudges: [
          "Not quite. Walk around the base and count again.",
          "Try once more. Count only the large round columns.",
          "There are four.",
        ],
      },
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
      quest: {
        // Visible on site: golden crown on the dome peak.
        type: "cloze",
        look: "Look at the very top of the Quadricentennial Dome.",
        question: "Finish the line from what you see.",
        cloze: {
          before: "A golden",
          after: "sits on the peak.",
          answer: "Crown",
          chips: ["Crown", "Cross", "Star", "Bell"],
        },
        reveal:
          "The golden crown points to Ina's queenship and to the faith of Bicol. From this dome, church, gate, and city meet as one heritage of faith.",
        nudges: [
          "Not quite. Look at the very top again.",
          "Try once more. The shape is gold.",
          "It is the crown.",
        ],
      },
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
      quest: {
        // Years from the Latin plaque: MDCCX-MMX (1710-2010).
        type: "order",
        look: "Look at the Latin plaque under the words PORTA MARIAE. The years MDCCX and MMX are 1710 and 2010.",
        question: "Put the story of this gate in order, first to last.",
        orderItems: [
          "The devotion to Our Lady of Peñafrancia begins (1710)",
          "The Porta Mariae is built for the 300th year",
          "The Archdiocese of Cáceres blesses it (9 September 2010)",
        ],
        reveal:
          "1710 marks the start of the Bicolano devotion to Our Lady of Peñafrancia. This gate was raised in 2010 so pilgrims would remember three centuries of Ina's care.",
        nudges: [
          "Not quite. Think about which came first.",
          "Try once more. The devotion began before the gate was built.",
          "Devotion begins, the gate is built, then it is blessed.",
        ],
      },
      map: { x: 42, y: 125 },
    },
    {
      id: "santos",
      slug: "santos",
      order: 9,
      title: "The Archbishop's Tomb",
      shortTitle: "Tomb",
      landmark:
        // Placeholder until parish confirms QR mount.
        "Go back inside the Cathedral. Find the tomb of +Most Rev. Pedro S. Santos, the first Archbishop of Cáceres.",
      heroImage: "/img/cathedral-interior.webp",
      storyImages: [
        "/img/cathedral-interior.webp",
        "/img/prayer.webp",
        "/img/statue.webp",
      ],
      about:
        "Did you know +Most Rev. Pedro S. Santos was the first Archbishop of Cáceres? His tomb is here. An archbishop is the chief shepherd of this church family.",
      aboutMore: [
        "This tomb honors a shepherd who came before the archbishops of today.",
        "His life and ministry helped build the Church of Bicol. A ministry is the work of serving God's people.",
        "Bishops, priests, religious, and lay faithful have helped sustain this Church. Lay faithful means the people of the parish.",
      ],
      action:
        "Pray before his tomb. Give thanks for his life and ministry. Remember all who have helped build the Church of Bicol.",
      quest: {
        // Name should be on the tomb. Confirm the inscription on site.
        type: "select_all",
        look: "Look at the tomb. Find the name of the first Archbishop of Cáceres.",
        question: "Which lines are true about Pedro S. Santos?",
        selectAll: {
          options: [
            "The first Archbishop of Cáceres",
            "His tomb is here",
            "A chief shepherd of the church family",
            "The first Pope of Rome",
          ],
          answers: [
            "The first Archbishop of Cáceres",
            "His tomb is here",
            "A chief shepherd of the church family",
          ],
        },
        reveal:
          "Pedro S. Santos was the first Archbishop of Cáceres. This tomb remembers the shepherds who served the Church of Bicol.",
        nudges: [
          "Not quite. More than one line is true.",
          "Try once more. Think of his title, his tomb, and his work.",
          "Select the first Archbishop, his tomb, and the chief shepherd.",
        ],
      },
      map: { x: 45, y: 180 },
    },
    {
      id: "ina",
      slug: "ina",
      order: 10,
      title: "The Novenary Image",
      shortTitle: "Novenary Image",
      landmark:
        // Placeholder until parish confirms which image and QR mount.
        "Inside the Cathedral, come before the Novenary Image of Our Lady of Peñafrancia. Bicolanos call her Ina.",
      heroImage: "/img/prayer.webp",
      storyImages: [
        "/img/prayer.webp",
        "/img/porta-mariae.webp",
        "/img/give-people.webp",
      ],
      about:
        "Did you know this is the Novenary Image of Our Lady of Peñafrancia? Bicolanos call her Ina. Ina means Mother.",
      aboutMore: [
        "Pilgrims stand here with family, loved ones, dreams, burdens, and intentions.",
        "She leads her children to Jesus. A prayer of this place is: Ina, lead us always to Jesus.",
        "The image is sacred. People come close with reverence, and some kiss the image where that is allowed.",
      ],
      action:
        "Stand in prayer before the Novenary Image. Where it is reverent, kiss her sacred image. Entrust your heart and your loved ones to Ina.",
      quest: {
        // The loving name is in the parish guide. Confirm it is clear on site.
        type: "cloze",
        look: "Look at the sacred image of Our Lady of Peñafrancia.",
        question: "Finish the line from what you read.",
        cloze: {
          before: "Bicolanos call Our Lady of Peñafrancia",
          after: ", which means Mother.",
          answer: "Ina",
          chips: ["Ina", "Lola", "Ate", "Tita"],
        },
        reveal:
          "Ina means Mother. Pilgrims pray, Ina, lead us always to Jesus. She brings her children to her Son.",
        nudges: [
          "Not quite. Read the story again.",
          "Try once more. Her name means Mother.",
          "It is Ina.",
        ],
      },
      map: { x: 48, y: 235 },
    },
    {
      id: "missionaries",
      slug: "missionaries",
      order: 11,
      title: "The Missionary Dome",
      shortTitle: "Missionaries",
      landmark:
        // Placeholder until parish confirms the best place to stand and look up.
        "Stand in the nave and face the sanctuary, the area around the altar. Look up at the dome above it.",
      heroImage: "/img/dome.webp",
      storyImages: [
        "/img/dome.webp",
        "/img/cathedral-interior.webp",
        "/img/murals.webp",
      ],
      about:
        "Did you know the dome above the sanctuary shows the religious orders that evangelized Bicol? It also shows the founders who inspired their missionary work.",
      aboutMore: [
        "The sanctuary is the holy area around the altar. The dome rises above it.",
        "First come the founders of the religious orders. Their example sent missionaries out.",
        "Then come the missionaries who went out and brought the Gospel to Bicol. The pictures remember both.",
      ],
      action:
        "Look up toward the dome. Offer a prayer that the Church may always have generous hearts willing to bring the Gospel to others.",
      quest: {
        // The guide names the dome, not the painted orders. Do not invent order names.
        type: "order",
        look: "Look up above the sanctuary, the area around the altar.",
        question: "Put the mission story in order, first to last.",
        orderItems: [
          "Founders give their example",
          "Missionaries are sent out",
          "The Gospel reaches Bicol",
        ],
        reveal:
          "That dome remembers the religious orders and the founders who inspired the mission in Bicol. A look upward can become a prayer for generous hearts.",
        nudges: [
          "Not quite. Think about who came first.",
          "Try once more. The example comes before the sending.",
          "Example, then sending, then the Gospel reaches Bicol.",
        ],
      },
      map: { x: 62, y: 290 },
    },
    {
      id: "tabernacle",
      slug: "tabernacle",
      order: 12,
      title: "The Tabernacle",
      shortTitle: "Tabernacle",
      landmark:
        // Placeholder until parish confirms a respectful QR spot near the sanctuary.
        "Walk toward the main altar. Find the silver Tabernacle below the main retablo, the decorated wall behind the altar.",
      heroImage: "/img/cathedral-interior.webp",
      storyImages: [
        "/img/cathedral-interior.webp",
        "/img/dome.webp",
        "/img/prayer.webp",
      ],
      about:
        "Did you know the greatest treasure here is not what you see? It is Jesus Christ, truly present in the Blessed Sacrament.",
      aboutMore: [
        "The Tabernacle stands below the main retablo. A retablo is the large decorated wall at the altar.",
        "This Tabernacle is clad in silver. Clad means covered.",
        "Inside is the heart of the Cathedral. Jesus is truly present in the Blessed Sacrament.",
      ],
      action: "Behold the Tabernacle. Stop. Be silent. Stay with Him.",
      quest: {
        // "Silver-clad" is in the parish guide. Confirm the metal on site.
        type: "select_all",
        look: "Look below the main retablo. Find the Tabernacle.",
        question: "Which lines are true about the Tabernacle?",
        selectAll: {
          options: [
            "It is covered in silver",
            "It stands below the main retablo",
            "Jesus is truly present inside",
            "It is made of glass",
          ],
          answers: [
            "It is covered in silver",
            "It stands below the main retablo",
            "Jesus is truly present inside",
          ],
        },
        reveal:
          "Silver covers the Tabernacle. The treasure is inside. Jesus Christ is truly present in the Blessed Sacrament. That is the heart of the Cathedral.",
        nudges: [
          "Not quite. More than one line is true.",
          "Try once more. Think of its metal, its place, and what is inside.",
          "Select silver, below the main retablo, and Jesus truly present.",
        ],
      },
      map: { x: 110, y: 310 },
    },
    {
      id: "belfries",
      slug: "belfries",
      order: 13,
      title: "The Belfries",
      shortTitle: "Belfries",
      landmark:
        // Placeholder until parish confirms where visitors meet staff for the climb.
        "Go outside and face the Cathedral façade. Find the twin bell towers. Ask the Cathedral staff before you climb.",
      heroImage: "/img/home-facade.webp",
      storyImages: [
        "/img/home-facade.webp",
        "/img/cathedral-compound.webp",
        "/img/dome.webp",
      ],
      about:
        "Did you know the twin towers are belfries? A belfry is a tower where bells hang. From up high, Naga looks different.",
      aboutMore: [
        "On the right is the Holy Rosary Minor Seminary.",
        "On the left are Elias Angeles Street, the Archbishop's Residence, and the historic façade of the Universidad de Santa Isabel.",
        "Generations have grown around this ancient center of faith.",
      ],
      action:
        "Ask the Cathedral staff to guide you. Climb carefully and safely. Look over the city and remember the people who have lived around this church.",
      quest: {
        // Answerable from the ground. The welcome text names the twin towers.
        type: "count",
        look: "Look at the Cathedral from outside. Find the bell towers.",
        question: "How many bell towers do you see?",
        count: { min: 1, max: 6, answer: 2 },
        reveal:
          "The two towers are the belfries. From them you can see the Holy Rosary Minor Seminary, Elias Angeles Street, the Archbishop's Residence, and the Universidad de Santa Isabel.",
        nudges: [
          "Not quite. Look at the front of the Cathedral again.",
          "Try once more. Count only the bell towers.",
          "There are two.",
        ],
      },
      map: { x: 155, y: 305 },
    },
    {
      id: "gethsemane",
      slug: "gethsemane",
      order: 14,
      title: "The Adoration Chapel",
      shortTitle: "Adoration Chapel",
      landmark:
        // Placeholder until parish confirms the chapel door and QR mount.
        "Find the Adoration Chapel. It is the quiet chapel inspired by the Garden of Gethsemane.",
      heroImage: "/img/prayer.webp",
      storyImages: [
        "/img/prayer.webp",
        "/img/candle-garden.webp",
        "/img/cathedral-interior.webp",
      ],
      about:
        "Did you know this Adoration Chapel recalls the Garden of Gethsemane? That garden was Jesus' hour of prayer.",
      aboutMore: [
        "The chapel is a quiet place to remain with Jesus.",
        "People bring fears, hopes, gratitude, struggles, and dreams into this silence.",
        "A prayer of this chapel is: Lord, stay with me.",
      ],
      action:
        "Visit the Adoration Chapel. Remain with Jesus in silence. Place before Him whatever you carry in your heart.",
      quest: {
        // Confirm the chapel is signed as Gethsemane, or change the question.
        type: "cloze",
        look: "Look around this quiet chapel. It recalls a garden where Jesus prayed.",
        question: "Finish the line from what you read.",
        cloze: {
          before: "This chapel recalls the Garden of",
          after: ".",
          answer: "Gethsemane",
          chips: ["Gethsemane", "Eden", "Nazareth", "Bethany"],
        },
        reveal:
          "The Garden of Gethsemane was Jesus' hour of prayer. This chapel invites the same staying: Lord, stay with me.",
        nudges: [
          "Not quite. Read the story again.",
          "Try once more. It was Jesus' hour of prayer.",
          "It is Gethsemane.",
        ],
      },
      map: { x: 195, y: 270 },
    },
    {
      id: "arches",
      slug: "arches",
      order: 15,
      title: "The Brick Arches",
      shortTitle: "Arches",
      landmark:
        // Placeholder until parish confirms QR mount at the office.
        "Go to the Cathedral Parish Office and Rectory. A rectory is the priests' house. Find the old brick arches.",
      heroImage: "/img/cathedral-compound.webp",
      storyImages: [
        "/img/cathedral-compound.webp",
        "/img/cathedral-interior.webp",
        "/img/home-facade.webp",
      ],
      about:
        "Did you know old brick arches support the Cathedral Parish Office and Rectory? These bricks have lasted through many years.",
      aboutMore: [
        "A rectory is the house where the priests live and serve the parish.",
        "The arches are historic brick. They hold the building up.",
        "Priests, families, pilgrims, and parishioners have passed through these same spaces.",
      ],
      action:
        "Find the brick arches. Where it is appropriate, gently touch them. Remember the people who walked here before you.",
      quest: {
        // The guide names historic brick. Confirm the material on site.
        type: "choice",
        look: "Look at the arches that support this building.",
        question: "What are they made of?",
        choices: ["Brick", "Wood", "Glass", "Marble"],
        answer: "Brick",
        reveal:
          "These historic brick arches have carried the building for a long time. They remember the priests, families, pilgrims, and parishioners who passed through.",
        nudges: [
          "Not quite. Look closely at the arches.",
          "Try once more. Think of old walls and old buildings.",
          "It is brick.",
        ],
      },
      map: { x: 215, y: 230 },
    },
    {
      id: "holy-family",
      slug: "holy-family",
      order: 16,
      title: "The Holy Family Chapel",
      shortTitle: "Holy Family",
      landmark:
        // Placeholder until parish confirms the chapel entrance and QR mount.
        "Find the Holy Family Chapel. Look for the stained-glass windows of the Holy Family.",
      heroImage: "/img/cathedral-interior.webp",
      storyImages: [
        "/img/cathedral-interior.webp",
        "/img/prayer.webp",
        "/img/give-people.webp",
      ],
      about:
        "Did you know the Holy Family Chapel is a small place of faith, family, and prayer? Children are welcomed here in Baptism. Couples seal their vows here in Holy Matrimony.",
      aboutMore: [
        "During the Peñafrancia Novenary in September, penitents come here for the Sacrament of Reconciliation. A penitent comes to say sorry. Reconciliation is God's forgiveness.",
        "The stained-glass windows show the Flight of the Holy Family into Egypt and the Holy Family of Nazareth.",
        "Saint Joseph is shown in his humble work as a carpenter. God chose a family and made love, work, and ordinary family life holy.",
      ],
      action:
        "Pause in the Holy Family Chapel. Pray. Entrust your own family to Jesus, Mary, and Joseph.",
      quest: {
        // Window subjects are named in the parish guide. Confirm which window is which.
        type: "cloze",
        look: "Look at the stained-glass windows. Find the Holy Family on a journey.",
        question: "Finish the line from what you see and read.",
        cloze: {
          before: "The window shows the Flight of the Holy Family into",
          after: ".",
          answer: "Egypt",
          chips: ["Egypt", "Nazareth", "Bethlehem", "Rome"],
        },
        reveal:
          "That window is the Flight of the Holy Family into Egypt. Another shows the Holy Family of Nazareth, with Saint Joseph at his work as a carpenter.",
        nudges: [
          "Not quite. Read the story again.",
          "Try once more. They are on a journey away from danger.",
          "It is Egypt.",
        ],
      },
      map: { x: 228, y: 195 },
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
