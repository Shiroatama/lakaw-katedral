# Handover: Build the place-loop prototype in production

**Status:** Implemented (2026-11-12). Open items: confirm the 16 authored quest answers on site; swap the temporary pay unlock for SukiPay.  
**Source of truth (UX / IA / flow):** [`public/prototypes/place-loop.html`](../public/prototypes/place-loop.html)  
**Product direction:** [`GAME-FLOW.md`](./GAME-FLOW.md)  
**Visual system:** [`DESIGN.md`](./DESIGN.md) (update where this handover conflicts)  
**Date:** 2026-11-12

This document tells engineering how to replace the current production shell, place UI, map chrome, parish/finish surfaces, and quest interaction with the prototype. Treat the prototype as the product to ship. Production keeps real content, QR, persistence, payments plumbing, and PWA. Almost everything the visitor sees and how they move should match the prototype, scaled to **16 places**, not 3.

**Visual parity is mandatory.** Match the prototype’s UI structure, typography (EB Garamond / Source Serif 4 / Source Sans 3), colors, spacing, chunky solid-offset button shadows, choice/chip/stepper lips, light quest sheet, tab bar, and motion. Do not keep production chrome that looks like the old article/map-bubble app.

### Locked product decisions (2026-11-12)

| Topic | Decision |
|---|---|
| Free places | **3** (`FREE_PLACE_COUNT = 3`). Login copy and gates must say first three places are free. |
| Solving | **Only the next unsolved place can be completed.** Early/wrong pins cannot be solved out of order. |
| Completed place | Reopen shows the **full resources and story** (media + prose + reveal). No quest gate again. |
| Story UI | **Prototype prose list** for now (not photo `StoryFlow`). |
| Typing | **Removed.** No free-text observation; no keyboard hard mode. |
| Points | **Ship the stub** (e.g. solved × 10) on Walk (and Profile as needed). |
| Pay | **Temporary unlock for internal builds** (confirm pay locally / flag). Wire real SukiPay when ready; do not block the walk rebuild on the provider. |

---

## 1. Goal

Ship one continuous product that feels like the prototype:

- Three bottom tabs: **Walk**, **Parish**, **Profile**
- Walk tab = free map board for the active church (16 pins)
- Church switcher from the Walk logo (not a fourth tab)
- Place = story first (prose), then **Solve the quest** sheet (tap formats only)
- Handoff map between places, then Scan
- After place 3: login → pay (temp unlock OK) → places 4–16
- Finish leads into Parish
- Same visual language as the prototype end to end

Do **not** keep the current “map as chat bubble + article stop + typed observation sheet” as the primary experience.

---

## 2. Non-negotiables (from the prototype)

1. **Scale:** Production has **16 authored places**. The prototype only plays 3. UI copy, progress, map pins, and Profile must always speak in **N of 16**.
2. **Tabs:** Walk / Parish / Profile. No Places tab. Tab bar only on those three shells. **No tabs on place, handoff, scan, login, pay, finish, onboard, intro.**
3. **Walk is the play home.** Compound (and area) map with tappable pins. No bottom explainer. No sticky Scan dock on the map.
4. **Scan opens the place**, never the map first.
5. **Place flow:** media + full prose story on the page → sticky **Solve the quest** → rising full-width sheet on `--background` with soft dark overlay → Check → celebrate → meaning reveal on the page → **Next place** (or Finish on the last).
6. **Quest answers come from the place or its resources.** No image-hotspot-as-answer. No QR-as-answer. **No typing / soft keyboard.**
7. **Quest formats** (same sheet, different controls):
   - Cloze / finish the line
   - Order
   - Count stepper
   - Select all that apply
   - (Optional fallback) single choice grid, only if needed for a place
8. **Handoff** is its own step after Next: area map default, Back to compound, pin drill, then Scan.
9. **Gates:** places **1–3 free**; then **login → pay → continue** for 4–16. Price **₱50**. Password min 8. Internal builds may temp-set `paid`.
10. **Progression:** only the **next** unsolved place can be completed. Completed places reopen as full story + reveal.
11. **Parish** is always available (give + while-you-are-here). Finish still celebrates, then sends people to Parish.
12. **Profile** shows identity/progress (N of 16) and login-to-save when logged out.
13. **Points stub** on Walk (solved × 10 until real currency).
14. **Visual system parity** with the prototype (fonts, solid shadow buttons, chips, inset, sheet). See §9.
15. **Shared page inset** (`--page-x`, 16px) across Walk, Parish, Profile, place, docks, sheets.

---

## 3. What production must replace

| Current production | Replace with (prototype) |
|---|---|
| No tab bar; journey + floating map head | Tab shell: Walk / Parish / Profile |
| Map as overlay sheet from dock (`map-bubble`) | Walk tab = primary map board |
| Single-church only in UI | Church switcher list (Naga active; others Soon until content) |
| Place = hero + about + StoryFlow + typed quest sheet (dark panel) | Place = teach media + **prose story list** + Solve CTA + light rising sheet |
| Observation = free-text typing | Cloze / order / count / select-all only (**typing removed**) |
| Next → map sheet focus “next” | Dedicated **handoff** view (area/compound + Scan) |
| Parish/gift mostly on `/finish` | Parish **tab** always on; finish is short bridge into Parish |
| No Profile destination | Profile tab |
| Progress mostly map-head ring | Chip on place, **points stub** on Walk, bar on Profile |
| Free places = 3 in `gate.ts` | **Keep 3.** Fix any prototype “two free” copy when porting login/pay screens. |
| Fonts / buttons / old surfaces | Rebuild to prototype tokens: display/body/UI fonts, solid-offset CTA and choice shadows |

**Keep from production (infrastructure, not chrome):**

- 16 real POIs in `src/lib/tour/content.ts` (ids, slugs, media, copy) as the content base
- Area maps / compound markers in `place-maps.ts` / `cathedral-map.tsx` (adapt visuals to Walk tab)
- Real camera scan (`/scan`, `qr-scanner`)
- Journey + access stores (extend for new shell)
- Login/pay routes and account hashing
- PWA / offline
- Correct celebrate / sounds (match prototype timing and light sheet, not dark card)
- Printable `/qr`

---

## 4. Information architecture

```text
APP
├── Church switcher (from Walk logo)     ← level 1, rare
└── Active church walk
      ├── Tab: Walk (map board)          ← level 2 home
      ├── Tab: Parish
      ├── Tab: Profile
      └── Outside tabs (full screen)
            Home poster → Intro → Onboard
            Place → Quest sheet → Handoff → Scan
            Login → Pay
            Finish → (into Parish)
```

### Routing sketch (suggested)

Keep App Router; reshape pages to match shells.

| Surface | Suggested route | Notes |
|---|---|---|
| Poster / cold open | `/` | Gate only when not started; else redirect Walk |
| Intro | overlay or `/intro` | First start only |
| Onboard | `/onboarding` | First start from Home; skip if entered via place QR |
| Walk | `/walk` or `/` when in progress | Tab shell |
| Parish | `/parish` | Tab shell |
| Profile | `/you` or `/profile` | Tab shell |
| Place | `/s/[slug]` | No tabs |
| Handoff | `/handoff` or query on walk | No tabs; after Next from a solved place |
| Scan | `/scan` | Real camera; success → `/s/[slug]` |
| Login / Pay | `/login`, `/pay` | Return to intended place or handoff |
| Finish | `/finish` | Short; CTA into Parish |
| Terms | `/terms` | Keep |
| Map deep link | redirect to Walk | Retire map-as-sheet as primary |

Deprecate or gut as primary UX: map bubble dock pattern, dark quest panel, article-first place layout, finish-only parish.

---

## 5. Screen build specs

### 5.1 Home poster

- Full-bleed media, steward crest, brand hero, one line (e.g. 16 places…), terms, **Start the walk**
- Not the mid-walk resume screen

### 5.2 Intro

- Short brand/partner load beat, then welcome mark
- First start only; skippable; never trap a QR entrant

### 5.3 Onboarding

- “Start at the entrance”: compound map, pin 1, entrance callout
- Primary **Scan the entrance QR**
- Skip if they already opened a place QR

### 5.4 Walk tab (16 pins)

- Top: logo/switcher · **points stub** (`completed.length * 10`)
- Body: compound map, pins **1–16**
- Pin states: locked / next / done (and optional “here” when on a place). **Only the next unsolved place is completable.**
- Tap **done** place → reopen **full resources and story** + reveal (no quest)
- Tap **next** → place or handoff/scan per rules
- Tap locked / later pin → warm “not yet” (or focus next), do not open a solvable quest
- Optional × / back only when opened as overlay from a place chip (if you keep that pattern); preferred: chip goes to Walk tab
- **No** Scan dock, **no** bottom explainer

### 5.5 Church switcher

- From Walk logo
- List: Naga (On) + coming soon rows
- Switching changes active Walk board only

### 5.6 Place (×16)

**Layout**

1. Back → Walk; optional map chip (“N of 16”)
2. Teach media (watch loop or still; sound badge if muted autoplay)
3. Story body (full information **before** quest), from place resources
4. After solve (and on reopen of a completed place): meaning reveal + **full prose story / resources** (no quest)
5. Dock: **Solve the quest** (only if this place is the next unsolved) → after solve **Next place** / **Finish the walk**

**Quest sheet**

- Full width, rises from bottom, `background` color, soft dark overlay
- Header: “Your quest” (accent) vertically aligned with close
- Action, look + question, feedback, answer control, **Check**
- Miss nudges; after several misses, gentle hint (highlight / fill), not a hard fail spiral
- Correct: celebrate + confetti; do not jump-scroll the place; then close sheet and show reveal + Next
- **No text input.** Remove `observation-key` typing path entirely.

**Quest type assignment**

- Every place declares one `questType` and its payload
- Prototype mapping to reuse as patterns:
  - Cloze: concrete noun/phrase from looking + story
  - Count: small number from looking
  - Order: 3 story beats from `aboutMore` / mural-style narrative
  - Select all: several true meanings taught in the story **before** the quest
- Author types for all 16 (content workstream). Migrate every place off `observation.answers[]` typing.

### 5.7 Handoff

- After Next from a solved place (not the last)
- Default **area** map for current → next; dashed hop; walk line copy
- Back → compound overview
- Pulsing pin on compound → area; pulsing pin on area → Scan
- Primary **Scan QR**
- Cut redundant “Open full map” when the handoff already shows the map

### 5.8 Scan

- Production: real camera (keep)
- Wrong / early scan: warm correction; stay in walk context (map with right pin or inline message)
- Success: open that place

### 5.9 Login / Pay

- Shown when opening a place beyond the free segment (order **> 3**), or when Next would enter that segment
- Login copy: first **three** places are free (match `FREE_PLACE_COUNT`)
- Pay ₱50; on success set `paid` and continue to place/handoff
- **Internal builds:** temporary unlock (dev flag / confirm button that sets `paid`) so the walk can be tested end to end
- **Later:** replace temp unlock with real SukiPay confirmation; keep the same post-pay continue path

### 5.10 Finish

- After place 16 solved (prototype ends at 3; production ends at 16)
- Short celebrate + prize cue
- Primary: go to **Parish**
- Secondary: Start over (existing start-over behavior)

### 5.11 Parish tab

- Always available
- Hero, help/give (templates ₱20 / 50 / 100 / 500, custom min ₱20), while-you-are-here ideas
- Prize / surprise block can unlock when walk complete (match prototype gating)
- Hide scrollbars where the prototype does

### 5.12 Profile tab

- Banner/avatar treatment as in prototype (replace hardcoded Bernardo with real account or guest state)
- Progress: cathedral thumb + bar, **N of 16**
- Logged out: login helper (“Log in to save”)
- No Places/Walk summary cards from earlier discarded profile experiments

---

## 6. Data model changes

Extend `Poi` (and content) so each of the 16 places can drive the prototype UI.

### 6.1 Keep

- `id`, `slug`, `order`, `title`, `shortTitle`
- `heroImage`, `heroVideo?`, `heroVideoFrame?`, `heroVideoPoster?`
- `about`, `aboutMore[]`, `storyImages[]` (story may render as simple prose list like the prototype, or keep photo beats if design allows; **prototype default = prose story list**)
- `action`, `landmark`, `map`

### 6.2 Replace observation typing (remove free text)

Delete the typed observation UX. Replace `observation: { look, question, answers[], reveal }` with a discriminated quest:

```ts
type QuestBase = {
  look: string;
  question: string;
  reveal: string;
  nudges: string[]; // at least 3
};

type PlaceQuest =
  | (QuestBase & {
      type: "cloze";
      cloze: { before: string; after?: string; answer: string; chips: string[] };
    })
  | (QuestBase & {
      type: "order";
      orderItems: [string, string, string]; // exact order = answer
    })
  | (QuestBase & {
      type: "count";
      count: { min: number; max: number; answer: number };
    })
  | (QuestBase & {
      type: "select_all";
      selectAll: { options: string[]; answers: string[] };
    })
  | (QuestBase & {
      type: "choice";
      choices: string[];
      answer: string;
    });
```

Normalize checking per type (set equality for select_all; exact sequence for order; number for count; string match for cloze/choice).

### 6.3 Map / handoff fields

Per place (from prototype):

- Compound pin (may already be `map`)
- `areaId`, area pin, next pin
- Compound route / area route polylines (or derive from markers)
- `walk` line for handoff (can map from / replace `landmark` usage between places)
- `scanLine` for scan chrome

Production already has area maps for multiple zones. Wire handoff to those, not a single nave stub.

### 6.4 Tour / progress

- Progress denominator = `pois.length` (16)
- **Points stub required:** `completed.length * 10` on Walk (Profile may mirror)
- Journey store: keep completed ids; reopen completed place → full story + reveal, **no quest**
- `getNextExpectedPoi` (or equivalent) remains the only completable target

---

## 7. Access and progression (16 places)

| Rule | Production target |
|---|---|
| Total places | **16** |
| Free segment | **Places 1–3** (`FREE_PLACE_COUNT = 3`) |
| After free | Login required, then pay ₱50, then places 4–16 open under route rules |
| Route rules | **Only the next unsolved place can be completed.** Done places reopen as full story. Locked places are not solvable. |
| Pay unlock | Temp unlock for internal builds; real provider later |
| Finish | When all 16 completed |
| Parish prize cue | When walk complete |

Wrong-scan and early-place behavior: keep production’s safer redirects, restyle to match Walk/handoff language.

---

## 8. Content workstream (required)

Engineering alone cannot ship 16 quests from the 3 prototype samples.

For **each** of the 16 POIs:

1. Confirm story text is enough **before** the quest (especially select_all / order / cloze facts)
2. Choose `questType` that fits the fact (see GAME-FLOW formats table)
3. Write look, action, question, nudges, reveal
4. Write payload (chips / order cards / stepper range / select options)
5. Verify the answer is knowable from looking and/or the on-page story, not from UI hunting

Suggested mix across 16 (not rigid): mostly cloze + count + select_all + order rotated; avoid 16× the same control.

Prototype references:

- Place 1 Entrance → cloze  
- Place 2 Mural → count (order payload also drafted)  
- Place 3 Cathedra → select_all  

Places 4–16: start from existing `content.ts` copy; rewrite observation into the new quest shapes.

---

## 9. UI / visual parity (mandatory)

Port the prototype look, not only the flow. If a production screen still looks like the old article app, it is not done.

### 9.1 Tokens and type

From the prototype `:root` / font links:

- Colors: `--background`, `--foreground`, `--surface`, `--border`, `--muted`, `--muted-fg`, `--accent`, `--accent-fg`, `--accent-depth`, `--stone`, `--stone-light`, `--ceremonial`, `--success`, `--success-depth`, `--danger`
- Fonts: **EB Garamond** (display), **Source Serif 4** (story body), **Source Sans 3** (UI / shell)
- Inset: `--page-x: 16px` on shells, docks, sheets, tab bar horizontal padding
- Easing: `--ease-out`, `--ease-in`, `--ease-spring` as used in the prototype

Update `DESIGN.md` when this lands so tokens stay the accepted system.

### 9.2 Buttons and controls

- Primary CTA: full width, ~56px min height, 16px radius, **solid offset shadow** (`4px 5px 0` accent-depth), press = translate into the lip
- Choice / chip / order cards / steppers: same language, **lower-right solid lip** (`3px 4px 0`), selected / right / wrong / hinted states as in the prototype
- No soft multi-layer glows as the primary affordance
- Tab bar: top border, icon + label, active state matching prototype

### 9.3 Sheets and place chrome

- Quest sheet: full bleed width, top radii only, page `background`, soft dark overlay, rise from bottom; keep dock in layout under the sheet (no jump)
- Focus quest panel with `preventScroll: true`
- “Your quest” accent; optically centered with close
- Hide place/parish scrollbars where the prototype does
- Celebrate above the sheet; respect `prefers-reduced-motion`

### 9.4 Story presentation

- **Prose list** under the media (prototype `#story-body` / `.prose`), not photo `StoryFlow`, for this build
- Unsolved next place: media + story + Solve
- Solved / revisit: media + reveal + full story; no Solve

Component mapping (suggested):

| Prototype | Build / replace |
|---|---|
| Tab shell | New app chrome layout (prototype fonts + tab bar) |
| Walk map board | Refactor `cathedral-map` into Walk page (not only bubble) |
| Church switcher | New overlay |
| Place + prose story | Replace `poi-detail` / `story-flow` presentation |
| Quest sheet | Replace `observation-key` with multi-type sheet; **delete typing** |
| Handoff | New screen using area/compound maps |
| Scan | Keep scanner; restyle to prototype scan chrome if needed |
| Login / Pay | Match prototype layout/copy; free count = 3; temp paid unlock |
| Parish | Lift `parish-gift` + ideas into Parish tab |
| Profile | New |
| Finish | Slim page → Parish |
| Correct celebrate | Keep; ensure works with new sheet |
| Points | Walk coin/points stub from prototype |

---

## 10. Implementation phases

### Phase A: Shell and navigation

- Tab layout Walk / Parish / Profile
- Walk map board with 16 production pins
- Church switcher stub
- Redirects: cold `/` → poster; in progress → Walk; finished → Finish/Parish
- Remove tab bar from place-level routes

### Phase B: Place + quest engine

- Story-first place page
- Quest sheet shell (light, full width)
- Implement cloze, order, count, select_all checkers + UI
- Celebrate + reveal + Next
- Migrate places 1–3 content to new quest payloads (parity with prototype)

### Phase C: Handoff + scan path

- Handoff screen with area/compound behavior
- Wire Next → handoff → scan → place
- Ensure map-optional forward path still works

### Phase D: Gates, finish, parish, profile

- `FREE_PLACE_COUNT = 3`; login/pay copy matches
- Temp pay unlock for internal builds; continue path identical to real pay
- Finish after 16
- Parish tab always on
- Profile progress N/16
- Points stub on Walk

### Phase E: Content for places 4–16

- Author all quest payloads (no typing leftovers)
- QA each place: story teaches enough; answer fair; nudge/hint OK
- Confirm completed reopen shows full story + reveal

### Phase F: Cleanup

- Delete typed observation UI, map bubble as primary home, dark quest card, obsolete finish-only parish
- Update `DESIGN.md` + `GAME-FLOW.md` status to Accepted where this ships
- Align any “two free places” prototype copy to **three** in production strings

---

## 11. Acceptance criteria

- [ ] Tabs match prototype; no tabs inside place/handoff/scan/gates
- [ ] Walk shows 16 real pins; progress UI says N of 16 everywhere
- [ ] Points stub visible on Walk (solved × 10)
- [ ] Scan → place; Home poster not used mid-walk
- [ ] Every place: prose story visible before quest; Solve opens light rising sheet
- [ ] All four quest formats work; **no typing / no keyboard** on the quest path
- [ ] Only the next unsolved place can be completed
- [ ] Completed place reopen = full resources + story + reveal, no quest
- [ ] Correct celebrate; reveal; Next; place 16 → Finish → Parish
- [ ] Handoff area/compound/scan behavior matches prototype intent
- [ ] Places 1–3 free; then login → pay (temp unlock OK) → 4–16
- [ ] Parish give works from the tab; Profile shows progress
- [ ] Church switcher lists Naga + soon rows
- [ ] Fonts, solid-shadow CTAs/choices, inset, sheet, and tab bar match the prototype
- [ ] PWA, real QR, and persistence still work

---

## 12. Decisions log + leftover optional items

### Decided

1. Free places = **3**
2. Solving = **next place only**; completed = full story/resources
3. Story UI = **prototype prose list** (for now)
4. Typing = **removed**
5. Points stub = **ship**
6. Pay = **temporary unlock for internal builds**; real provider later
7. Visual/UI/font/button system = **implement from prototype in prod**

### Optional later (not blockers)

- Profile named avatar system beyond guest + login-to-save
- Second church walk content (switcher can stay Soon rows)
- Photo story beats (`StoryFlow`) if prose is too plain later
- Real SukiPay replacing temp unlock

---

## 13. Reference checklist (prototype → prod)

| Prototype view | Must exist in prod |
|---|---|
| `view-home` | Yes |
| `view-intro` | Yes (first start) |
| `view-onboard` | Yes (first start from Home) |
| `view-map` + 16 pins + switcher | Yes (Walk tab) |
| `view-place` + quest sheet types | Yes (×16 content) |
| `view-handoff` | Yes |
| `view-scan` | Yes (real camera) |
| `view-login` / `view-pay` | Yes (temp unlock OK for internal builds) |
| `view-finish` | Yes (after 16) |
| `view-parish` | Yes (tab) |
| `view-you` | Yes (tab) |
| Correct celebrate | Yes |

---

## 14. Working agreement

- When prototype and current production conflict on **UI, flow, tabs, fonts, buttons, or concepts**, prefer the prototype + this handover.
- When prototype and production conflict on **ops reality** (real QR, 16 POI ids, PWA), keep production capability and restyle/reshape it to the prototype.
- Free count in production is **3**, even if the HTML prototype still says two in places.
- Do not ship a hybrid that leaves typing, the dark quest sheet, or map-bubble home in place “for now.”
- Payment may use a temporary internal unlock until SukiPay is ready; the rest of the walk UX must still be complete.
