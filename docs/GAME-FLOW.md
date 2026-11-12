# Lakaw Katedral: Game Flow Direction

**Project:** Lakaw Katedral  
**Companion to:** [`DESIGN.md`](./DESIGN.md) (current accepted visual system), [`SPEC.md`](./SPEC.md) (product)  
**Status:** Accepted (shipped in production, see [`HANDOVER-PRODUCTION.md`](./HANDOVER-PRODUCTION.md))  
**Date:** 2026-11-12  
**Prototype:** [`/prototypes/place-loop.html`](../public/prototypes/place-loop.html)

This document captures the game-shaped walk and the app shell we shipped for multi-church expansion. `DESIGN.md` now matches it (tabs, Walk board, place and quest sheet). Where an older note disagrees, this document and `DESIGN.md` win.

---

## 1. Goal

Make the walk feel like a game, not like a magazine article.

The visitor should always know:

1. Where they are
2. What to do next
3. How far they have come

Game feel here comes from a short loop, a visible path, a choice, and an immediate change of state. It does not come from streaks, hearts, leagues, or a mascot. Keep the reverence of the cathedral.

### Inspiration (structure only)

| App | Steal | Leave |
|-----|-------|-------|
| Duolingo | One job per screen; path/map as play home; course switcher from top control (not a peer tab); no tab bar inside a lesson | Mascot, leagues, hearts, streaks, gems-as-identity |
| Pokémon GO | Map as home; each pin is a short encounter | Catching, battling, shop |
| Goosechase / Actionbound | Real-world mission cards: stand here, look, prove it, go | Points races, team boards |
| Sky: Children of the Light | Sacred place that is still a game; quiet acts change the place | Flying, social layer |
| The Witness | Looking is the mechanic; the answer is in the room | Extreme silence and difficulty |

---

## 2. What we are going with (decided)

These are locked for the next design/product pass and match the current prototype.

### 2.1 Hierarchy (three levels)

```text
APP
├── 1. Which church / walk     ← rare switcher (not a bottom tab)
│     Naga Cathedral · Basilica · San Francisco · …
│
└── 2. This walk’s board       ← Walk tab = play home
      Free map + pins + points placeholder
      │
      └── 3. This place          ← the game (no bottom tab bar)
            Learn → quest → reward → Next / Back to Walk
```

**Rule:** Scan opens level 3. Walk owns level 2. Church list is a switcher at level 1, not a second home.

### 2.2 Bottom tabs

| Tab | Job |
|-----|-----|
| **Walk** (left, primary) | Map board for the **active** church walk |
| **Parish** | Help the parish (give), while-you-are-here ideas, post-walk redirects / prize cue |
| **Profile** | Account, progress, optional avatars later |

**Cut:** A **Places** bottom tab. It sat beside Walk and fought it for hierarchy (“which home?”). Church switching is not peer navigation to the path.

**Parish tab rule:** Always available for give. Finish of the walk should still celebrate, then lead into Parish (fuller prize / next ideas). Do not hide give only behind a one-time finish page.

### 2.3 Church switcher (Duolingo course-switch pattern)

- Trigger: control on the Walk top bar (logo / caret), same job as Duolingo’s flag
- UI: simple list of churches (active + coming soon). No score cards, “new courses” rails, or extra Duolingo chrome
- Feature-proof for Camarines expansion (Basilica, San Francisco, …)
- Switching church changes which Walk board is active; it does not insert a catalog between a QR and a place

### 2.4 Walk tab = free map board

- Top row: brand/switcher control · points placeholder (currency stub for now)
- Body: compound / floor map with numbered pins
- Pins are tappable so people can go where they want (revisit done places; open available places)
- **No** bottom explainer copy and **no** Scan dock on this tab. This is not onboarding; it is orientation and choice
- Tab bar shows on Walk / Parish / Profile only. It is **not** sticky over place screens

### 2.5 Place screens (inside the walk)

- No bottom tab bar (like Duolingo inside a lesson)
- Top-left **Back** returns to the Walk map
- Optional map chip for quick return / progress cue
- Forward progress does **not** require opening the map

### 2.6 Entry and resume

| Entry | Show |
|-------|------|
| Cold open / marketing link | **Home poster** (production gate), then start → title beat |
| Scan QR at a church place | **That place** (level 3). After a place QR, never open the map first |
| First visit + scan (optional) | Thin terms / brand gate if needed, then the place |
| Open app mid-walk, no scan | **Walk** map for the active church |
| Open app, walk finished | Prize / finish |
| Scan wrong / early place | Stay in walk context: map with correct pin pulsing, or a warm “not this one yet” |
| Scan Basilica while Cathedral walk is active | Confirm switch **or** open Basilica place as that walk. Never dump a multi-church list first |

**Hard rule:** A user can finish a walk without ever opening the Walk map. Forward path: place → Next → (scan or next place) → … → finish. Map is optional orientation and revisit.

### 2.7 First-visit poster / title beat

- Still allowed as a **gate** when starting a walk from the app without a place QR (brand, one line, terms, Start)
- Not the mid-walk resume screen
- Title beat: short, first start only, skippable; should not trap people who already scanned into a place

### 2.8 Resolved with `DESIGN.md`

- `DESIGN.md` now specifies the Walk, Parish, and Profile tab bar
- The Walk map is the play home; the old chat-head bubble is gone
- `/` is a poster gate that redirects a started walk to Walk; scan opens the place

---

## 3. Core loop

```text
First start without QR (optional):
  Poster gate → short title beat → Onboarding (go to the door)
  → Scan → Place

Primary on-site path:
  Scan QR at place
  → Place: learn, then answer
  → Right: meaning + scroll into video and story
  → Next place (forward; map optional)
  → … until the last place
  → Prize / help the parish

Anytime:
  Back / map chip → Walk map
  Walk logo → church switcher list
  Parish tab → give + while you are here
  Profile tab → account / progress
```

Resume rule: if the walk is already started, opening the site goes to the **Walk map** (or last unfinished place if we later prefer that). Do not replay the poster or title beat.

---

## 4. Considerations we weighed

### 4.1 Why not Places as a bottom tab

- Walk is the main activity; Places (church catalog) is infrequent
- Equal tabs imply equal homes → redundancy and awkward “where do I go back to?”
- Duolingo keeps course switching off the path tab; we mirror that with a top switcher

### 4.2 Why scan goes to the place, not the map

- The QR already answered “which place?”
- Map between scan and place adds a beat with no new information
- Map remains available via Back / chip when they want the board

### 4.3 Why Walk map has no explainer / Scan dock

- Explainer + Scan turns the hub into a repeated onboarding card
- Free pins + clear active/done states are enough for orientation
- Scan stays a real-world door into a place, or a place-level action, not permanent map footer chrome

### 4.4 Why finish without the map must work

- Outdoor visitors follow Next and QR; forcing map between every place is friction
- Map is escape hatch and overview, not a gate

### 4.5 Multi-church future

- One app, many walks
- Active walk owns the Walk tab
- Switcher lists churches; locked / soon rows are fine until content ships

---

## 5. What to do on each screen

### 5.1 Poster gate (first start without place QR)

**Job:** First poster only. Get them into a walk.

**Keep:** Brand as hero; one short promise; terms; **Start the walk**; quiet steward credit  
**Cut:** Long welcome essay; using this as mid-walk resume  
**Modify:** In progress → Walk map; finished → prize / finish

### 5.2 Title beat

**Job:** Ceremony once, then out of the way.

**Modify:** Short, first start only, skippable. Prefer landing on Walk map when they started from the poster; skip entirely when they entered via place QR.

### 5.3 Onboarding (first start from Home)

**Job:** Get them to the main door before the first scan. Step 3 after Home + title beat.

**Show:** Clear “go to the main door” instruction, entrance visual, pin 1 cue, primary **Scan**  
**Skip:** People who already opened a place QR (they land on that place)  
**Do not:** Jump straight from intro into the camera/scan beat with no orientation UI

### 5.4 Walk tab (map board)

**Job:** Play home for the active church. Orientation, revisit, switch-church trigger, points stub.

**Keep:** Floor / compound maps; done / active pin states; tappable pins  
**Cut:** Map-only-as-chat-bubble; mandatory map between every place; bottom explainer; sticky Scan dock on the board  
**Add:** Logo/switcher control; points placeholder; church list overlay

### 5.5 Place: story first, then quest sheet

**Job:** Read the place (media + story) first, like production. Quest opens on demand.

**Keep:** Observation mechanic; miss nudges; Back to Walk  
**Modify (prototype):** Media + full story on the page → sticky **Solve the quest** → full-width bottom sheet on `--background` (not dark foreground card), with a soft dark overlay, rising from the bottom. Action + prompt + **answer control** live in the sheet. On correct: celebrate, close sheet, meaning reveal on the page + **Next place**. Reopen finished place → story + reveal, no quest gate.

#### Quest answer formats (no keyboard by default)

The answer must come from the **place** (looking in the room) or its **resources** (story, short teach, video). Do not use image-hotspot tapping or QR/scan as the quest answer. Scan remains the door into the place only.

Same sheet shell; only the input control changes. Prefer thumb taps over typing.

| Format | When | How it works |
|--------|------|----------------|
| **Cloze / finish the line** | One concrete word or short phrase from looking or the story | One sentence with a blank; pick the missing piece from answer chips |
| **Order** | Story or history with a clear sequence | Shuffle 3 cards; put them in the right order, then Check |
| **Count stepper** | The answer is a small number you get by looking or from the resource | − / + stepper, then Check |
| **Select all that apply** | Several true details taught by the place or story | Multi-select chips; Check when the full correct set is chosen |

**Prototype walk mapping**

1. Entrance → cloze (animal above the crown)  
2. Mural → count stepper (crosses). Same place also has `orderItems` for the story sequence; set `questType` to `order` to play that format  
3. Cathedra → select all that apply (what red marks on the chair)  

All four formats share one quest sheet and are implemented in the prototype. Rotate them across a full church so the loop stays familiar but the ask changes.

**Cut for on-site quests:** free typing as the default; image hotspot as the solve; QR/GPS check-in as the solve.

### 5.6 Place: after a right answer

**Job:** Reward, then deeper story. Leave when ready.

**Keep:** One-sentence meaning; short celebrate; parish-safe tone  
**Modify:** Same page grows: meaning → video → story; sticky **Next place**. Teach copy stays hidden; title/media can remain as context.  
**Add:** Back / chip still available; finished pin becomes revisit content

### 5.6b Handoff to next place

**Job:** Tell them where to walk before the camera opens.

**Keep:** Walk line from place content; Scan as the real-world door  
**Add:** Area map first (e.g. interior) with current → next pin and dashed hop; Back reveals compound overview; pulsing pin on compound drills into the area; pulsing pin on area opens Scan  
**Cut:** Jumping straight from reward dock into a blind scanner; redundant “Open full map” when the handoff already shows the map  

Happy path: reward → handoff (area) → walk → scan → next place. Compound is one Back away.

### 5.7 Scan

**Job:** Physical door into a place.

**Modify:** Primary on-site entry lands on the **place**. Wrong/early scan: correct pin on Walk map or warm inline correction. Map **Scan** button is optional chrome, not required for the happy path. Between places, Scan is reached from the handoff card.

### 5.8 Parish tab

**Job:** Help the parish and useful next steps around the compound (not more walk pins).

**Keep / include**

- **Help the parish** give amounts (plain words: give / help, not donate / support)
- **While you are here** short ideas with photos (Mass, chapel, shop)
- Post-walk prize cue when the walk is complete (hero image + short ask)

**Cut:** Status eyebrows (“Walk complete”, “Give”, section kickers); long lead paragraphs

**Modify**

- Visual-first like `/finish`: hero image, section titles, amount chips, photo idea rows
- Finish celebration can deep-link here
- During an in-progress walk, give stays open; prize block waits until complete

### 5.9 Profile tab

**Job:** Account, progress across walks, optional avatars later.

**Modify:** Visual-first like Parish: identity, large progress numbers, current-walk row with photo + bar, log-in to save. Cut prototype filler and status eyebrows.

### 5.10 Login / pay

**Job:** Unlock paid stretch without leaving the game world.

**Modify:** Short lock from Walk map (or place) when they hit the first locked pin; after pay, return to Walk with next pin clear.

**Production target:** Free stretch is **3 places**, then login → pay (temp unlock OK for internal builds). This HTML prototype may still shorten free stretch to **2 places** so the gate is reachable in one demo loop. When porting, use **3** free places and **16** total. See [`HANDOVER-PRODUCTION.md`](./HANDOVER-PRODUCTION.md).

### 5.11 Finish / prize

**Job:** Celebrate, then hand off to Parish for give + next ideas.

**Modify:** Short celebration / finish screen, then Parish tab (prize + give + while-you-are-here).

---

## 6. Learn before they answer (important)

### 6.1 The tension

Quest-first feels most like Duolingo, but many answers come from the place video, short history text, or a taught detail, not from looking alone. Pure “quiz first, encyclopedia later” is wrong. Pure “read the whole article, then a form” is also wrong (that is today’s article feel).

### 6.2 Design rule

**Teach just enough to answer. Reward with the rest.**

Before the answer: context for meaning and the question, still about one phone screen.  
After the answer: deeper history, longer video, extra photos.  
Looking in the room still confirms; the app prepares the eye.

### 6.3 Recommended place layout (before answer)

1. Back + place name (and optional chip / count)
2. **Learn beat** (pattern from 6.4)
3. Action line
4. Question
5. Tappable answers (locked until teach is done, if required)

After a right answer: meaning → video → story → sticky **Next place**

### 6.4 Patterns (pick per place)

| Pattern | When to use | How it works | Pros | Watch out |
|---------|-------------|--------------|------|-----------|
| **A. Tiny teach card** | Fact is one or two sentences | 1–2 short lines + photo of the detail, then question | Fast, game-like | Too short if answer is buried in long history |
| **B. Watch then unlock** | Answer comes from the video | Short clip (about 15–30s). **Continue** unlocks choices | Matches media; clear gate | Skippable for weak signal / a11y; captions |
| **C. Read then unlock** | Answer comes from text | 2–4 short beats, then **I'm ready** | Good for history-heavy places | Easy to become an article; hard cap length |
| **D. Guided look** | Answer is in the room | Photo with “look here”, then question | Strongest in-building game | Weak if meaning needs prior teaching |
| **E. Two-beat place** | Need context and a hard look | Teach (A/B/C), then stand and answer | Clearest for mixed media | More taps; keep under about a minute |

**Default recommendation:** E as standard; prefer B for video; A or D for one look + one fact; C only with about 80–120 words before unlock.

### 6.5 Content rules

1. Budget before unlock: one short video *or* about 80–120 words, not both at full length.
2. Question must be answerable from that beat + looking in the room.
3. Post-answer story can go longer (reward scroll).
4. Do not put the full encyclopedia before the question.
5. Video before answer is instructional; prefer tap to play.
6. Answer controls stay tappable (cloze chips, order, stepper, select-all). No soft keyboard by default; typing is the exception.
7. Reopen finished place → full story path, not the locked quest again.
8. Every format still checks knowledge from the place or its resources, not UI hunting.

---

## 7. Map / Walk chrome rules

| Context | UI |
|---------|-----|
| Walk tab | Free map board; logo switcher; points stub; pins; no bottom explainer / Scan dock |
| Church switcher | Overlay list from logo; dim backdrop; pick church |
| On place (quest / story) | No bottom tabs; **Back** to Walk; optional map chip |
| Chip / Back from place | Walk map (optional “you are here” highlight) |
| Finished pin | Reopen that place’s story |
| Next / forward | Does not require the map |

People should always be able to answer: “Where am I?”, “Which places can I open again?”, and “Which church am I walking?”

---

## 8. Per-screen checklist (implementation)

### Poster gate
- [ ] First-visit / cold start only
- [ ] Mid-walk and finished redirect to Walk / finish
- [ ] Short copy; brand first; one CTA

### Title beat
- [ ] Skippable, first start only
- [ ] Skipped when entry is a place QR

### Walk tab
- [ ] Primary bottom tab
- [ ] Free map board; pins tappable
- [ ] Logo opens church list
- [ ] Points placeholder
- [ ] No bottom explainer / Scan dock

### Church switcher
- [ ] List only (active + soon)
- [ ] No Places bottom tab

### Parish tab
- [ ] Help the parish (give stub)
- [ ] While you are here ideas
- [ ] Finish can open this tab
- [ ] Available during the walk for give

### Profile tab
- [ ] Account / progress stub

### Place (before answer)
- [ ] No bottom tab bar
- [ ] Back to Walk
- [ ] Learn beat with length budget
- [ ] Tappable answers by default

### Place (after answer)
- [ ] Meaning → video → story
- [ ] Sticky Next place
- [ ] Forward works without opening map

### Scan
- [ ] Lands on place
- [ ] Wrong/early handled in walk context

### Login / pay
- [ ] Short lock, return to Walk

### Finish
- [ ] Celebration → prize → short next ideas → gift

---

## 9. What we are doing right today

- Observation in the real building is a real game mechanic
- Ordered route and QR as a door
- Progress ring / celebrate / miss nudges
- Plain language and outdoor-readable color
- Area maps already exist as the path board
- Prototype explores Walk / Parish / Profile shell + church switcher + place Back

## 10. What we are doing wrong today (product app)

- Stop screens lead with article structure (hero, lede, photo essay)
- Quest is optional chrome (sheet) instead of the level
- Home / resume still feel like a title card, not a path
- Map is secondary chrome in the shipped UI
- Typed answers feel like a worksheet
- Story length before action makes the product read like assigned reading
- `DESIGN.md` still says no tab bar (out of date vs this direction)

---

## 11. Open decisions

1. Accept **two-beat places** (learn → answer → reward story) as the standard?
2. Per place: which teach pattern (A–E) fits the real asset (video vs text vs look)?
3. Exact word / second budget before unlock?
4. When does `DESIGN.md` get updated to match this document (tabs, Walk hub, scan → place, church switcher)?
5. Resume preference if ambiguous: always Walk map, or last unfinished place?
6. Points / currency: keep as placeholder only, or define earn rules later?

**Already decided (see section 2):** Walk / Parish / Profile tabs; no Places tab; church switcher from Walk logo; Walk = free map; Parish = give + while-you-are-here; scan → place; finish without requiring map; no tab bar on place screens.

**Type (prototype):** Shell / UI chrome uses **Source Sans 3**. Place titles and story reading stay **serif** (EB Garamond display, Source Serif 4 body). Prefer two families long-term (one serif + Source Sans) if three feels heavy.

---

## 12. Related files

- Current visual / screen inventory: [`DESIGN.md`](./DESIGN.md)
- Product and route rules: [`SPEC.md`](./SPEC.md)
- Observation answers: [`OBSERVATION-ANSWERS.md`](./OBSERVATION-ANSWERS.md)
- Interactive sketch (shell + switcher + place loop): [`../public/prototypes/place-loop.html`](../public/prototypes/place-loop.html)
