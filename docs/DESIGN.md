# Lakaw Katedral: Design Spec (Color, UX, Screens)

**Project:** Lakaw Katedral  
**Companion to:** [`SPEC.md`](./SPEC.md) (product and technical)  
**Status:** Accepted  
**Date:** 2026-10-06  
**Scope:** Mobile PWA visual system and screen UX for the MVP walk flow

This document is the source of truth for color tokens, chrome, and per-screen element inventory. Where it conflicts with older UI notes in `SPEC.md`, this document wins.

---

## 1. Design intent

Warm welcome for an outdoor QR walk through Naga Metropolitan Cathedral. Color should feel like standing in front of the cream facade at noon: grounded, inviting, readable in sun. Not a cool museum app, not a dark liturgy app, not a transit map.

**Inspiration:** cathedral facade (cream stone, wood doors, terracotta pavement). Values are inspired for UI readability, not eyedropped from a photo.

---

## 1.1 Language

Plain words around real names. Visitor-facing copy is about Grade 3 level ("place" not "stop", "walk" not "journey", "give" and "help" not "donate" and "support"), but names and key terms stay exact: Naga Metropolitan Cathedral, Archdiocese of Cáceres, parish, façade, and so on, each explained in simple words the first time. Full rules: [`SPEC.md` section 3.1](./SPEC.md). Internal docs and code keep the words stop, POI and journey.

---

## 2. Color system

### 2.1 Decisions

| Decision | Choice |
|----------|--------|
| Appearance | Light only. No dark mode. |
| Neutrals | Soft cream canvas. Kill cool blue-gray backgrounds. |
| Primary CTA | Mid-brick terracotta. |
| Secondary | Wood brown (nav weight, secondary actions, visited tone). |
| Success | Muted green only (arrived / done). |
| Danger | Clear red (errors). Must not look like a CTA. |
| Sky blue | Banned from chrome. Do not reintroduce teal or cool blue accents. |

### 2.2 Token table

Implement in `src/app/globals.css` (`:root`). Keep `manifest.ts` / viewport `themeColor` in sync (terracotta or cream, not teal).

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Canvas | `--background` | `#f4eee4` | App background |
| Sheet | `--surface` | `#faf6ef` | Interactive panels only |
| Ink | `--foreground` | `#2a211c` | Primary text |
| Quiet ink | `--muted-fg` | `#6b5e54` | Secondary text |
| Line | `--border` | `#e0d4c4` | Dividers |
| Muted | `--muted` | `#9a8b7c` | Disabled / placeholder tone |
| CTA | `--accent` | `#b85c38` | Primary buttons, key actions |
| On CTA | `--accent-fg` | `#fffaf5` | Text on terracotta |
| Wood | `--stone` | `#6b4a35` | Secondary actions, nav weight |
| Wood soft | `--stone-light` | `#e8d8c8` | Soft chips, progress track |
| Success | `--success` | `#4f6b4a` | Arrived / done |
| Danger | `--danger` | `#b33b2e` | Errors only |

Legacy teal (`#0f5c5c`) and cool gray neutrals are retired.

### 2.3 Surfaces

- Default world is flat cream (`--background`).
- Use lighter ivory sheets (`--surface`) only when an interactive panel needs a container.
- No white card grids. No card treatment in heroes.
- Primary buttons are flat terracotta. No drop shadow and no glow.

### 2.4 Contrast

Aim for WCAG AA on text and CTAs. Prefer mid-brick terracotta over muted clay so primary actions stay readable outdoors.

---

## 3. Chrome and navigation

| Rule | Choice |
|------|--------|
| Tab bar | None |
| Persistent chrome | Progress ring on the map chat-head beside the main CTA. Finish shows a full progress bar. |
| Map access | After the walk has begun (not on Home) |
| Home role | Resume hub (see screens) |
| Back | In-screen secondary actions only. No universal back chevron required for MVP. |

---

## 4. Flow principles

```mermaid
flowchart LR
  QR1["Scan any stop QR"] --> POI["Stop detail (story at once)"]
  Home["Home: landing / resume"] -->|Start the walk| POI
  POI --> Find["Next: the mural: map bubble"]
  Find --> QR1
  POI -->|all visited| Fin["/finish: next + gift"]
  Fin --> Suc["Success modal on arrival"]
  Suc --> Cont[Continue dismisses modal]
  Cont --> Fin
  Fin --> TY["Thank you modal after gift"]
```

1. **In order:** only the next unsolved place shows its full quest. Opening any other unsolved place shows a teaser interstitial (hero + about + gate). Unstarted: **Start the walk** → Home. Mid-walk early: **Continue at the …** → expected place.
2. **Scan is the start:** the entrance QR opens stop 1 directly. No Start tap required from Home.
3. **"Next: the …" is wayfinding, not navigation:** it opens the sheet with a plain-words landmark and the floor plan. It never opens the next story. Label comes from `nextPlaceCtaLabel` (e.g. "Next: the mural"). **Continue at the entrance** links straight back to place 1 if they left mid-quest.
4. **Celebrate as a modal, then the ask, then what is next:** `/finish` leads with the gift, then next ideas. A big Success modal opens on first arrival; Continue dismisses it. Home complete CTA **Help the parish** also opens `/finish`.
5. **Offline:** the whole tour is cached when the service worker installs. Donate needs network. No offline payment queue in MVP.
6. **Start over:** allowed from Home and from `/finish` (below the gift), with confirm before clearing progress. Trigger is muted utility text (not danger-colored); danger stays on the confirm action only.

---

## 5. Screen inventory

### 5.1 Home (`/`): landing and resume hub

Not a required step on site (the entrance QR goes straight to stop 1). Used by people who arrive from a link, and as the resume point. Shows only the hero until saved progress is read, so a returning visitor never sees "Start the walk" flash.

**Fresh visit**

- Quiet steward credit, upper left: Archdiocese of Cáceres crest beside the name. No floating badge, no pill chip.
- Brand: Lakaw Katedral as hero-level signal, over a full-bleed portrait video (`/video/entrance.mp4`, muted loop) from the top edge of the screen (no card, no rounded corners). Resume and complete stills stay as photos.
- Hook: "Welcome, dear pilgrim and visitor."
- Fact first (interest pull): a living story of faith; more than four centuries at the heart of Bicol
- Invite: "Discover the heritage. Encounter the saints. Meet Christ. Finish for a small surprise prize." (no question stack)
- No cathedral-name headline, no QR mention
- Dock: map chat-head + **Start the walk**. A terracotta screen fades in, with the Ryne Media mark and a count from 0 to 100 that speeds up. At 100 the brand pulses, then **Lakaw Katedral** takes over, holds, and zooms out into place 1. Tap the map to see where place 1 is. Scanning the entrance QR still opens place 1 with no handoff.
- No stop list, schedule, stats, or address block in the first viewport

**In progress**

- Brand quieter; "Your next stop is {title}"
- Dock: map chat-head + **Next: the mural** (or the next place name). Map shows where you last were, or the next place.
- Quiet destructive: Start over (confirm, then clear journey)

**Complete**

- Dock: map chat-head + **Help the parish** (to `/finish`)
- Quiet destructive: Start over

### 5.2 First-stop QR (`/s/saints`)

- Same as any stop. Scanning it starts the journey. No redirect, no Start tap.

### 5.3 Stop detail (`/s/[slug]`)

The story is static and renders immediately. The banner and dock appear once the visit is recorded.

Top to bottom:

1. Full-bleed photo across the screen, from the top edge (no card, no rounded corners)
2. Optional one-line note (journey complete)
3. Stop title
4. About (short; descriptive only, no instructions) with optional **Read more** / **Show less** for `aboutMore` history so the quest stays near the first screen
5. Quest card (rounded dark brown panel using ink `--foreground` `#2a211c`; visible uppercase "Your quest" label in `--stone-light`; action and clue in `--accent-fg`, only the question semibold; cream `--background` answer field): **Something to do** (instruction / call to action: pray, look, pause). After a correct answer: large display "You are right" in `--success-on-dark`, full-screen canvas-confetti (same side-to-center burst as the finish modal), then the reveal. Progress advances on the map chat-head ring.
6. Interesting fact
7. Dock: map button (progress ring) + **Next: the mural** (or next place name), or **Finish** when all stops are visited. While the quest is unsolved, the dock shows a quiet **Solve the quest** control (cream fill, hairline, wood text, down chevron, no shadow) that scrolls to the quest card. **Submit answer** is the only terracotta action on that screen.

MVP: no audio, share, or save.

### 5.4 Wayfinding map (chat bubble)

- Circular **Map** chat-head beside the primary CTA (Messenger-style) on every screen, including Home
- Progress `done/total` and ring fill live on the circle
- Fresh start (Home): **Start the walk** opens place 1. Map chat-head opens "Ready to begin" with place 1 on the floor plan and a short nudge to tap **Start the walk** (no Scan / Skip, no go-scan directions).
- Tap the map chat-head **or** **Next: the …** to open a tall map panel (rounded, height from dock up to the top safe area):
  1. Stop card: "You are here", or next/start number + title, **landmark** in plain words, "Scan the QR code there to read the story."
  2. Floor plan (completed / here / next)
- Dock stays visible under the bubble (backdrop stops above the dock)
- `/map` is a deep-link fallback that opens the same bubble
- **Trial mode only:** a dashed "Skip the scan: open place N" button at the bottom (also before the walk has begun, for desktop testing). Controlled by `NEXT_PUBLIC_ALLOW_SKIP`; remove for launch.

### 5.5 Finish (`/finish`)

One page for next ideas and the gift. Congratulations happens on the last place, before this page.

1. **Success modal (last place):** after the last quest is solved and the map head celebrate finishes (100% → check), large check, green "You finished the walk", thank-you line that mentions a small surprise prize from the church, full-screen confetti. **Continue** goes to `/finish`. Shown once per session until Start over. Tapping Finish early opens it right away.
2. **Prize hero, then gift:** edge-to-edge hero, then the page’s first job: "Your surprise prize" (ask at the parish). Soft rule, then "Help the parish" gift form (amount presets + custom, starts at 20 pesos; submit stub opens thank-you modal).
3. **While you are here:** clear air and a soft rule after the gift, then next ideas (candle, sit, pray) as editorial entries: small place photo beside title and body. No left rule, no rounded photo cards.
4. **Start over** as muted utility text (confirm, then back to Home; danger color only on the confirm action)

No stop checklist. No "Not now" button: leaving is simply leaving. If the walk is not finished, the page says so and links back instead of showing the ending.

### 5.6 Donate (`/donate`)

- Redirects to `/finish`. Kept for old links and analytics paths.

### 5.7 Thank you (`/thank-you`)

- Redirects to `/finish` (acknowledgment is a modal there after a gift)
- Warm confirmation copy on the modal; Home CTA

### 5.8 Not-yet interstitial (place is not next to solve)

- Place first: short cropped hero (finish-style 2:1 window over a 4:3 image), title, `about`.
- Sans editorial caption (terracotta left rule): "This is place N of M", then a short intro.
- **Unstarted:** Lakaw Katedral intro + "Did you know" teaser (more than 400 years; earthquakes, typhoons, and fire) then "Do you want to know why… Ready to walk… Finish every place and the church has a small surprise prize waiting for you."; dock **Start the walk** → Home. No map chat-head.
- **Mid-walk too early:** say they found this place early, finish the expected place first; dock **Continue at the …** → expected place. No map chat-head.
- No observation quest. Progress unchanged.

### 5.9 Completed re-visit

- Full stop replay
- Slim banner: "You finished the walk." with link to `/finish`
- No blocking modal every time

### 5.10 Offline (`/~offline`)

- Shown only if a page was never cached (for example, a very first visit with no signal)
- Title "No internet". Explain: the walk saves on your phone after the first load; giving to the parish needs internet
- Go to the start

---

## 6. Motion

Motion gives presence and hierarchy, never decoration. Premium feel comes from consistent easing, short durations, and things arriving in a sensible order. All of it is off under `prefers-reduced-motion` (content just appears). Tokens and keyframes live at the bottom of `globals.css`.

**Easing tokens**

| Token | Curve | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Anything arriving: fast start, soft landing |
| `--ease-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheet open, page slide |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Small overshoot: pops, counters |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Anything leaving (faster than it arrived) |

**Inventory**

| Where | Motion | Timing |
|-------|--------|--------|
| Page to page (in-app links) | Slide + fade + slight blur. Forward rises from below; back drops in from above. React `<ViewTransition>` with `transitionTypes` (`nav-forward` / `nav-back`). QR scans and browser back just load normally. | 420 to 480 ms |
| Wayfinding chat bubble | Bubble scales up from the map chat-head; backdrop fades; contents rise in one by one; map markers pop in; the "next" marker soft-rings. Closing is faster. Focus moves into the bubble and back to the chat-head. | 480 ms open, 300 ms close |
| Bottom dock | Slides up into place after the visit is recorded | 560 ms |
| Map button | Mid-walk: map → percent → count (~2 s) → hold (~2 s) → map. Last place: map → percent → count to 100% (~2 s) → hold 100% (~1 s) → check (~2 s) → map. | ~4.4–5.4 s |
| Quest success | Correct answer: large pop-in "You are right" + full-screen canvas-confetti (same side-to-center burst as finish) | one shot |
| Quest CTA unlock | Starts with the map celebrate on a correct answer: terracotta ink fills left → right while "Solve the quest" rewrites to Next / Finish; then the button is tappable | ~0.8 s |
| Stop screen | Photo eases from a slight zoom to rest; title, story and "Did you know?" rise in with 100 ms steps; notes fade up | 600 ms each |
| Home | Hero settles; name overlay, intro and status lines rise in order | 350 ms start |
| Start the walk | Terracotta screen opens with a soft circular mask from the center. Progress starts at 0.5 s (while the mask is still opening) and counts 0 to 100 (slow then fast). At 100 the brand pulses, clears fully, then Lakaw Katedral (with gold rules and sparks) holds and zooms out with the background into place 1. Reduced motion skips the handoff. | 3 s mask, count from 0.5 s, 2.8 s count, pulse, clear, title hold, zoom out |
| Finish | Page lands first; success modal + canvas-confetti (side-to-center) after 1 s; Continue reveals gift then next ideas | 1 s delay, then modal |
| Thank you | Gold rule draws in, then heading, text, button | 300 to 750 ms |
| Buttons | Lift 1 px on hover (pointer devices only), press down to 97% | 200 ms |
| Inputs | Focus ring fades in | 200 ms |

**Rules**

- Animate `transform` and `opacity` first. The two exceptions are the progress bar width and the ring's stroke offset, both tiny.
- Never put a transform or animation on an ancestor of a `position: fixed` element. The dock animates its inner row, and the map sheet is portaled to `<body>`.
- Page content is real HTML first: story text is in the server HTML and animates in with CSS, so a slow phone still shows it.
- Avoid decorative glow, pill clusters, and floating overlay badges on hero media.

---

## 7. Overrides to product spec

| Topic | Older `SPEC.md` | This design spec |
|-------|-----------------|------------------|
| Donate amounts | Custom only, no presets | Custom amount only (presets removed) |
| Home | Thinly specified | Resume hub with Start over |
| Progress chrome | POI-level only | Progress ring on the map button; full bar on Finish |
| Color | Unspecified (scaffold used teal) | Section 2 token table |
| Appearance | Not stated | Light only, no dark mode |

Update `SPEC.md` donate and screen notes to match when editing product docs.

---

## 8. Implementation checklist

- [x] Replace CSS variables and kill teal in `globals.css`
- [x] Sync `manifest.ts` and layout `themeColor`
- [x] Retheme shared buttons / progress / map marker colors
- [x] Home fresh vs resume (+ Start over confirm)
- [x] Thin progress on journey screens
- [x] Donate custom amount only (no presets)
- [x] Wayfinding sheet with landmarks; "Next: the …" never opens the next story
- [x] Progressive order (full quest only on the next unsolved place); entrance scan starts the journey directly
- [x] Whole tour precached at service-worker install
- [x] Finish: success modal then soft gift + next ideas; "Not now" removed; Start over on finish
- [x] Motion system: page slides, animated map sheet, dock, ring, staggered reveals, reduced-motion fallback
- [x] Edge copy/layout pass for ahead, midroute, offline, completed banner
- [x] Spot-check outdoor contrast on terracotta CTA and cream text (tokens + build verified)
