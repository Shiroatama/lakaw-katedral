# Lakaw Katedral: MVP Product & Technical Spec

**Project:** Lakaw Katedral — gamified QR-guided tour web app
**Site:** The Metropolitan Cathedral and Parish of Saint John the Evangelist (Naga Metropolitan Cathedral), Naga City, Camarines Sur
**Version:** v0.1 (MVP draft) | **Date:** 2026-10-06 | **Owner:** Gab Reuyan

**Design (color, UX, screen inventory):** see [`DESIGN.md`](./DESIGN.md). Where UI details conflict, `DESIGN.md` wins.

---

## 1. Summary

A mobile web app that guides visitors through the cathedral on a fixed route of points of interest (POIs). Each POI has a QR code. Scanning it opens that stop's story, advances the visitor's journey, and shows where to go next on a simple map. The journey ends with an invitation to donate to the parish.

**MVP scope:** 3 POIs, no accounts, progress saved in the browser, works offline after the first scan.

## 2. Goals and non-goals

**Goals**
- Give pilgrims and domestic tourists a clear, meaningful walk through the cathedral.
- Make progress feel like a journey (figurative progression, not literal stamps).
- Work on low-end Android phones and on weak or no signal inside the church.
- Collect usage data to prove value to the parish.
- Leave a clean path to donations and, someday, native apps.

**Non-goals (MVP)**
- User accounts, logins, profiles, leaderboards
- Quizzes or tasks to unlock a stop
- Computer vision or AR recognition
- CMS or parish self-editing
- Multi-language (English only; Filipino later)
- Live payment processing (gateway comes later; see section 9)
- Native iOS or Android apps

## 3. Audience

- **Primary:** domestic tourists and pilgrims (Naga is the Pilgrim City)
- **Devices:** mostly mid to low-end Android, some iPhones
- **Context:** standing inside a church, possibly in a crowd, often with poor signal, sometimes older users

Design implications: big tap targets, high contrast, short text, readable in dim light, minimal steps.

### 3.1 Plain language

Visitor-facing copy uses plain words at about a **Grade 3 reading level**: short sentences (under about 12 words), common everyday words. Visitors may be children, older people, or reading English as a second language, and often read standing up in a crowd.

**Real names and key terms are never simplified.** Keep proper nouns and important terms exactly as they are: Naga Metropolitan Cathedral, Archdiocese of Cáceres, Saint John the Evangelist, Bishop Bernardo de la Concepción, Castile and León, parish, façade, nave, sanctuary, Earthquake Baroque, trompe-l'oeil, dates and years. The first time a hard term appears, add a few simple words to explain it ("Pilasters are flat columns, and belfries are bell towers."). Only the words *around* the names get simpler.

Word choices for everyday words (code and internal docs still say "POI", "stop", "journey"; only what visitors read changes):

| Instead of | Say |
|------------|-----|
| stop / POI | place ("Find place 2") |
| journey / tour | walk ("Start the walk") |
| donate, support | give, help ("Help the parish") |
| directions, navigate, progress | how to get there, see, steps so far |
| offline, connection | no internet, signal |

Rules: one idea per sentence; say what to do first ("Look up at the façade."); explain, don't replace, hard terms. Re-check new copy with a readability tool (Flesch-Kincaid grade 3 to 5 is fine when it includes names) and have a real child or older visitor read it aloud.

## 4. Journey and route

Fixed route, in order:

| # | POI | Placement of QR | URL |
|---|-----|-----------------|-----|
| 1 | Entrance (Façade) | Main entrance, starting line | `/s/entrance` |
| 2 | Interior murals (trompe-l'oeil) | Nave, near a key column | `/s/murals` |
| 3 | Statue (St. John the Evangelist) | Beside the statue | `/s/statue` |
| End | Finish + Donate | Shown after POI 3 | `/finish` |

**URL design (consideration).** Stop URLs are short readable words, not random tokens, so a visitor can type one by hand if a code won't scan (glare, dim light, damaged sticker). Trade-offs, accepted for MVP:

- Anyone can open any stop by guessing its URL, so the QR is not a lock. This is fine because order is a suggestion (section 4.2), not a gate, and the content is public history.
- Codes never need reprinting for rotation, since the slugs are stable.
- If the parish later wants a real "you must be here" check, reintroduce random tokens (`/s/<token>`) behind the same `slug` field; nothing else in the flow depends on the URL being readable.

**Trial mode.** Until QR codes are printed, the wayfinding sheet shows a "Skip the scan" button that opens the next stop directly. It is controlled by `NEXT_PUBLIC_ALLOW_SKIP` (on by default; set to `false` to remove it).

### 4.1 Flow

```mermaid
flowchart TD
  A[Scan QR at a stop, or open /s/slug] --> B[Show that stop's story at once]
  B --> C[Record the visit: start the journey if needed, progress +1]
  C --> D{All 3 visited?}
  D -->|No| E["Dock: Find place N"]
  E --> F[Wayfinding sheet: landmark in words + floor plan]
  F --> A
  D -->|Yes| G[Dock: Finish]
  G --> H[Finish: quiet moment + gift]
  H --> I[Help the parish: custom amount, placeholder]
  I --> J[Thank-you screen + email receipt later]
```

Home (`/`) is a landing and resume hub. It is not a required step: scanning the entrance QR goes straight to stop 1.

### 4.2 Route rules

Order is a **suggestion, not a gate.** Every stop always shows its full story and counts toward completion. Reasons: with 3 stops a gate adds little, crowds and Mass make the exact route unpredictable, and progress can be lost when a QR opens in a different browser (see section 8). A forgiving rule means lost state is harmless.

1. **First visit to any stop:** show the story, mark it visited, set `startedAt` if this is the first visit. Scanning the entrance QR therefore *is* the start; there is no Start tap and no redirect.
2. **Visiting a stop out of the suggested order:** same as rule 1, plus a one-line note: "The suggested route goes to stop N next. Any order works."
3. **Re-visiting a stop:** show the story again; progress unchanged.
4. **Journey complete (all stops visited):** any scan shows the story plus a slim "You have completed the journey" banner linking to Finish.
5. **Next suggested stop:** the lowest-numbered unvisited stop. The dock action "Find place N" targets it.
6. **"Find place N" never opens the next story.** It opens the wayfinding sheet (landmark + map). The next story opens by scanning that stop's QR (or, in trial mode only, the Skip button).

## 5. Screens

Element-level inventory, chrome rules, and color tokens live in [`DESIGN.md`](./DESIGN.md). Summary:

1. **Home (`/`):** landing and resume hub (welcome, continue, or complete). Not required on site; the entrance QR skips it.
2. **Stop detail** (`/s/[slug]`): hero photo, title, short story, "Did you know?", bottom dock with the map button (progress ring) and one primary action: **Find place N** (or **Finish**).
3. **Wayfinding sheet (map):** next stop's title and a plain-words landmark, SVG floor plan (completed / here / next). Opens from the map button or "Find place N". Available anytime. Trial mode adds a "Skip the scan" button.
4. **Out-of-order note:** a one-line banner on a stop visited out of the suggested order. No blocking screen.
5. **Finish:** reward first (success check + thank-you), then a compact quiet closing moment, then **inline** Help the parish (custom amount only, no presets), with **Start over** below it. No stop checklist. No "Not now" button.
6. **Donate route:** redirects to Finish.
7. **Thank you:** thanks; receipt when gateway is live.
8. **Offline / error state:** tour readable after start; donate needs network.

## 6. Map

- Hand-drawn simplified SVG floor plan of the cathedral (nave, aisles, entrance, altar), not an architectural drawing.
- POI markers positioned by coordinates in the SVG's own coordinate space.
- States: completed, current ("You are here"), next (highlighted/pulsing), locked.
- No GPS. Indoor GPS is unreliable; location = last scanned POI.
- No Mapbox or Google Maps. If zooming is needed later, Leaflet with `CRS.Simple` over the SVG.

## 7. Content (hardcoded, draft)

All copy below is **draft from public sources and must be verified by the parish** before launch.

> Section 7 keeps the original source-based draft for the parish to verify. The text visitors actually read is the Grade 3 rewrite in `src/lib/tour/content.ts` (see 7.3).

### POI 1: The Entrance and Façade
The Naga Metropolitan Cathedral is the seat of the Archdiocese of Cáceres, one of the oldest dioceses in the Philippines, created by papal bull on 14 August 1595. After fire destroyed an earlier church in 1768, construction of the present stone cathedral began in 1808 under Bishop Bernardo de la Concepción. It was completed and blessed in 1843. Look up: the squat façade, twin pilasters, and two short hexagonal belfries are typical of "Earthquake Baroque," built to survive the quakes that shaped this region.
*Did you know?* The façade carries the coat of arms of Castile and León.

### POI 2: The Interior Murals
Step into the nave and look at the columns, arches, and ceiling. The paintings use trompe-l'oeil, a technique that tricks the eye into seeing depth and carved detail on flat surfaces. The heavy arcades themselves were part of how the cathedral was strengthened after the 1820 earthquake.
*Did you know?* The cathedral was damaged by a typhoon in 1856 and an earthquake in 1887, and was restored each time. A major restoration began in 1987.

### POI 3: St. John the Evangelist
Near the sanctuary, pause at the statue of St. John the Evangelist, patron of this cathedral. Early tradition remembers him as the beloved disciple and the author of the Fourth Gospel. In a pilgrim city, this stop is a quiet moment to look, pray, and remember who the church is named for.
*Did you know?* The Archdiocese of Cáceres takes its name from the old Spanish colonial capital; the cathedral remains its mother church.
*Statue choice and exact location still to be confirmed with the parish.*

### 7.2 Landmarks (wayfinding copy)
Each stop has a one- or two-sentence `landmark` in plain words, shown in the wayfinding sheet under "Find place N". It tells the visitor where to look for the sign and QR code, since a map marker alone is not enough in a busy nave. Current lines are **placeholders** until the parish confirms where each QR sign will be mounted.

**Sources:** [Wikipedia: Naga Cathedral](https://en.wikipedia.org/wiki/Naga_Cathedral), [NHCP historical marker](http://nhcphistoricsites.blogspot.com/2011/10/church-of-naga.html), [City of Naga](https://www2.naga.gov.ph/the-cathedral-that-stood-the-test-of-time-naga-metropolitan-cathedral/), [TheOldChurches](https://www.theoldchurches.com/philippines/camarines-sur/naga-city/naga-city-metropolitan-cathedral/)

### 7.1 Content model

```ts
type Poi = {
  id: string;            // "entrance"
  slug: string;          // readable URL segment, e.g. "murals" -> /s/murals
  order: number;         // 1..3
  title: string;
  shortTitle: string;    // one word for the floor plan label
  landmark: string;      // plain-words directions to this stop's sign / QR
  heroImage: string;     // compressed, e.g. /img/entrance.webp
  body: string;          // short story (MDX or markdown)
  fact?: string;         // "Did you know?"
  map: { x: number; y: number }; // SVG coords
};

type Tour = { id: string; version: number; pois: Poi[] };
```

Stored as typed JSON/MDX in the repo. Keep route rules and content in plain TypeScript (no Next.js-specific code) so a future Expo app can reuse them.

### 7.3 Visitor-facing wording

Titles shown to visitors are the real names: **The Entrance and Façade**, **The Interior Murals**, **Saint John the Evangelist**. The stories in `src/lib/tour/content.ts` keep every name, date and key term from the drafts above and use short sentences with a plain-words explanation of each hard term (section 3.1). Because the wording changed, the parish should verify the rewritten text, not only the originals. Landmark lines and every UI string follow the same rules.

## 8. Progress and state

- Stored in `localStorage` via a small Zustand store with `persist`.
- Shape: `{ tourId, tourVersion, startedAt, completed: string[], finishedAt?, donated? }`
- If `tourVersion` changes, migrate or reset gracefully.
- No personal data stored. Clearing browser data resets progress (acceptable for MVP).
- `localStorage` is the right fit for "no accounts": no login, no server, works offline. Its limit is that it is **per browser context**. A QR opened from the iPhone camera (Safari), Android Chrome, or an in-app scanner (Facebook, GCash, Maya) can land in a different context than the previous scan, which then starts with empty progress.
- We do not try to fix this with accounts or server sessions. Instead the route rules are forgiving (section 4.2): any scan shows its full story and counts, so a fresh context loses only the progress ring, not the experience. Not synced between devices.
- Possible later: a shareable "resume link" that carries visited stops in the URL hash, if analytics show many people losing progress.

## 9. Donations

- Custom amount only (no presets). PHP currency.
- Optional email field for a receipt.
- **Gateway: deferred.** Build behind a `PaymentProvider` interface (`createPayment(amount, email?) -> redirectUrl`) so any gateway can plug in later. MVP uses a stub that goes straight to the thank-you screen (or shows "coming soon").
- When live: payments must settle to the parish or diocese account, not a personal account.
- Thank-you screen and emailed receipt are low priority.
- Donation needs a connection; show a clear offline message if none.

## 10. Offline (PWA)

- Next.js PWA using **Serwist** (service worker).
- Precache happens when the service worker **installs** (first load of any page), not on a button tap. By the time a visitor reaches stop 2, every stop page, the map, fonts, JS/CSS, and hero images are already on the phone.
- Precached: `/`, `/map`, `/finish`, `/~offline`, every `/s/<slug>`, `.next/static` (JS, CSS, fonts), and `public/` (images, icons). Donation pages are not cached.
- Hero images are served unoptimized from `public/` (not `/_next/image`) so they can be precached by fixed URL.
- Home shows "Tour saved on this phone" once every stop page is found in the precache.
- Target total tour payload under about 3 MB. Current build: about 2.7 MB (images dominate; converting `murals.png` and `statue.png` to JPEG/WebP would save roughly 1 MB).
- Not available in `next dev`; verify with `next build && next start`, then test in airplane mode.
- Strategy: cache-first for tour assets, network-only for donation.
- Web app manifest included so "Add to Home Screen" works, but installing is optional and not part of the flow.

## 11. Fullscreen

**Dropped from MVP.** Browsers require a user tap to enter fullscreen, and every QR scan leaves the page for the camera app, which exits fullscreen anyway. It cost the visitor an extra tap at the entrance for almost no benefit. The layout uses full height (`100dvh`, safe-area insets) instead. Revisit only if the app moves to an in-page scanner.

## 12. Analytics

**Tool: Umami** (cookieless, so no consent banner; tiny script; free self-host or free cloud tier; custom events and funnels).

Events:
| Event | Properties |
|-------|------------|
| `journey_start` | entry POI |
| `poi_view` | poi id, order, in_route (bool) |
| `poi_progress` | poi id, progress (1..3) |
| `out_of_order_scan` | visited poi, suggested poi |
| `map_open` | from poi |
| `journey_complete` | duration |
| `donate_view` / `donate_submit` | amount bucket (not exact), has_email |

Key funnel: `journey_start` -> POI 2 -> POI 3 -> `journey_complete` -> `donate_submit`.

## 13. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js (App Router) + TypeScript | Mostly static, fast on cheap phones, easy hosting |
| Styling | Tailwind CSS | Fast iteration, small CSS |
| Offline | Serwist (Turbopack) | Maintained PWA/service-worker tooling for Next.js 16 |
| State | Zustand + persist (localStorage) | Tiny, simple |
| Map | Inline SVG | No indoor GPS needed; lightweight |
| Images | `next/image`, WebP/AVIF | Small payloads |
| Analytics | Umami | Cookieless, light, funnels |
| Hosting | Vercel | Static/edge, simple deploys |
| Payments | `PaymentProvider` interface, stub | Gateway TBD |

### Why not Flutter or Expo now
- **Flutter web:** large initial bundle and slow first load on low-end Android; weaker fit for a scan-and-go web experience.
- **Expo:** great for native later, but app-store installs at a church entrance kill adoption. A web link from the phone's camera is zero friction.
- **Future native path (someday):** Expo (React Native) reusing the shared TypeScript content and route-rule modules. Reasons to pivot: push notifications, app-store presence, or on-device CV/AR.

### Computer vision
Not in MVP. Dim lighting, crowds, battery, and model size make recognition unreliable on low-end phones, and QR codes already solve "where am I." If revisited: on-device MediaPipe image recognition with QR as fallback.

## 14. QR codes

- Each encodes `https://<domain>/s/<slug>` (for example `/s/murals`). Slugs are short words so they can also be typed by hand if a code won't scan; print the short URL under the QR.
- Printed with Lakaw Katedral branding plus a short instruction: "Scan with your camera to begin / continue the journey."
- Use high error correction (level Q or H); print at least 4 x 4 cm; matte finish to avoid glare.
- Placement agreed with the parish; respectful of liturgical spaces.
- Slugs are stable, so codes never need reprinting for rotation. Keep a slug-to-POI table with each sticker's physical location (used for the `landmark` copy).

## 15. Non-functional requirements

- First load on 4G under 3 s on a low-end Android; subsequent POIs instant (cached).
- Lighthouse performance 90+ on mobile.
- Accessible: WCAG AA contrast, large text option, alt text on images.
- Works on Android Chrome 100+ and iOS Safari 16+.
- No cookies, no personal data beyond optional receipt email.

## 16. Milestones

1. **Week 1:** content model, route rules, POI and map screens with placeholder content.
2. **Week 2:** PWA offline caching, progress persistence, wayfinding sheet.
3. **Week 3:** Umami events, finish and donate (stub) screens, QR generation, on-site test with 3 printed codes.
4. **Week 4:** parish content review, polish, launch.

## 17. Open items

- Parish to verify all historical copy.
- Confirm the statue for POI 3 and its exact location.
- Confirm where each QR sign is mounted, then finalize the `landmark` wayfinding lines (section 7.2).
- Before launch: set `NEXT_PUBLIC_ALLOW_SKIP=false` to remove the trial "Skip the scan" button.
- Donation step is a placeholder: the button reads "coming soon" but still shows the thank-you screen. Replace with a real gateway, or hide the form, before launch.
- Photos for each POI (permission to photograph).
- Payment gateway and receiving account (deferred).
- Domain name.
- QR placement approval from the parish.
