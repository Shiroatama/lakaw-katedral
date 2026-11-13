# Lakaw Katedral

**Audience:** you and coding agents  
**Status:** Product source of truth (2026-11-13)  
**UX reference:** [`public/prototypes/place-loop.html`](../public/prototypes/place-loop.html)  
**Parish content:** [`PILGRIM-GUIDE.md`](./PILGRIM-GUIDE.md) → visitor copy in `src/lib/tour/content.ts`

Mobile PWA for a QR-guided walk through Naga Metropolitan Cathedral. The visitor plays a game-shaped walk: map board, one short lesson per place, tap-only quest, then the next pin.

When this file and older notes in code comments disagree, **this file wins** for product rules. When this file and the prototype disagree on UI or flow, prefer the prototype plus the locked decisions below. When ops reality conflicts (real QR, 16 POI ids, PWA), keep production capability and reshape it to the prototype.

---

## Locked decisions

| Topic | Rule |
|---|---|
| Places | **16** authored places. Progress always says **N of 16**. |
| Free segment | Places **1–3** (`FREE_PLACE_COUNT = 3`), then login → pay ₱50 → places 4–16. |
| Solving | **Only the next unsolved place** can be completed. |
| Completed place | Reopen shows full media + prose story + reveal. No quest again. |
| Story UI | Prototype **prose list** (not photo `StoryFlow`). |
| Typing | **Removed.** No free-text observation; no keyboard on the quest path. |
| Quest formats | Cloze, order, count, select all (optional single choice if needed). Answers come from looking and/or the on-page story. |
| Points | Stub: solved × 10 on Walk (Profile may mirror). |
| Pay | Temp unlock OK for internal builds. Wire SukiPay later; same continue path. |
| Visuals | Match the prototype (fonts, solid-offset buttons, light quest sheet, tab bar). |

---

## Shell and flow

```text
Tabs (only these three): Walk · Parish · Profile
No tabs on: home, intro, onboard, place, handoff, scan, login, pay, finish, terms

Home poster → Intro → Onboard (first start from Home)
Walk (map board, 16 pins) ↔ Place → Quest sheet → Handoff → Scan → Place
After place 3: Login → Pay → continue
After place 16: Finish → Parish
Church switcher: from Walk logo (Naga on; others Soon)
```

- **Walk** is the play home: compound/area map, tappable pins. No Scan dock on the map. No bottom explainer.
- **Scan opens the place**, never the map first.
- **Place:** media + full prose story → sticky **Solve the quest** → light rising sheet → Check → celebrate → reveal on page → **Next place** (or Finish).
- **Handoff** is its own step after Next: area map default, back to compound, pin drill, then Scan.
- **Parish** is always available (give + while-you-are-here).
- **Profile** shows identity/progress (N of 16) and login-to-save when logged out.

Do not ship a hybrid that leaves typing, a dark quest sheet, or map-bubble-as-home in place.

---

## Language (visitor-facing)

About Grade 3 reading level: short sentences, everyday words. Real names and key terms stay exact (from the pilgrim guide). The first time a hard term appears, explain it in plain words.

| Instead of | Say |
|---|---|
| stop / POI | place |
| journey / tour | walk |
| donate, support | give, help |

Code and internal docs may still say stop, POI, journey.

---

## Look (short)

- Light only. Cream canvas (`--background` `#f4eee4`). Tokens live in `src/app/globals.css`.
- Fonts: **EB Garamond** (display), **Source Serif 4** (story), **Source Sans 3** (UI).
- Shared inset: `--page-x: 16px`.
- Primary CTA: full width, ~56px, 16px radius, solid offset shadow (`4px 5px 0` accent-depth). Choices/chips/steppers use a lower-right solid lip. No soft multi-layer glows as the main affordance.
- Quest sheet: full width, page background, soft dark overlay, rises from bottom.

---

## Open items

1. Confirm the 16 authored quest answers on site.
2. Swap temporary pay unlock for SukiPay.
3. Parish verifies Grade 3 rewrite in `content.ts` against the pilgrim guide.

Optional later (not blockers): real avatar system, second church content, photo story beats, custom domain.
