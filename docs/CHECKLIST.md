# Lakaw Katedral: Open checklist

**Status:** Working list of unfinished work before and after MVP launch  
**Source of truth for open items.** Spec details stay in [`SPEC.md`](./SPEC.md). Design details stay in [`DESIGN.md`](./DESIGN.md). Parish content stays in [`PILGRIM-GUIDE.md`](./PILGRIM-GUIDE.md).

Mark items `[x]` when done. Add dates or owners in the Notes column when useful.

---

## Before launch (MVP)

| Done | Item | Notes |
|------|------|-------|
| [ ] | Parish verifies the Grade 3 rewrite in `src/lib/tour/content.ts` against [`PILGRIM-GUIDE.md`](./PILGRIM-GUIDE.md) | Facts and names must match the parish guide |
| [ ] | Confirm exact QR placement for the Cathedra (POI 3) | Agreed with parish |
| [ ] | Finalize all `landmark` wayfinding lines | Placeholders until QR mount points are fixed (SPEC §7.2) |
| [ ] | QR placement approval from the parish | All three MVP stops; respectful of liturgical spaces |
| [ ] | Print 3 QR codes and do an on-site walk test | High error correction (Q or H); at least 4 x 4 cm; matte |
| [ ] | Set `NEXT_PUBLIC_ALLOW_SKIP=false` | Removes trial "Skip the scan" before real visitors |
| [ ] | Donation: replace placeholder or hide the form | Button still says "coming soon" and shows thank-you; do not leave that live as-is |
| [ ] | Domain name chosen and pointed at hosting | |
| [ ] | Dedicated photos for each POI | Permission to photograph; MVP reuses existing assets for now |

## Map (outsource)

Current wayfinding uses a simple inline SVG floor plan. Plan is to replace it with a proper 2D illustrated map.

| Done | Item | Notes |
|------|------|-------|
| [ ] | Brief and hire an illustrator for a 2D cathedral floor map | Hand-drawn / illustrated style; not an architectural CAD drawing |
| [ ] | Deliver art assets (export sizes, formats) that fit the wayfinding sheet | Keep marker coordinates workable; SVG or layered export preferred |
| [ ] | Integrate the new map into the app and re-place POI markers | Update `map: { x, y }` in content when the art lands |
| [ ] | Confirm map labels match place names visitors already see | Entrance, mural, Cathedra |

Until the art lands, keep the current SVG. Do not block MVP launch on this if the parish accepts the placeholder map.

## Deferred (post-MVP)

| Done | Item | Notes |
|------|------|-------|
| [ ] | Real payment gateway behind `PaymentProvider` | Settles to parish or diocese account, not personal |
| [ ] | Thank-you email receipt | Low priority; needs gateway |
| [ ] | Umami analytics live and funnel checked | Events listed in SPEC §12 |
| [ ] | Pilgrim guide items 15–16 in the app | Places 9–16 now cover guide items 4–8 and 10–12. Items 15 (Mass) and 16 (souvenir shop) are still not places. Do not invent copy. |
| [ ] | Add Tagalog and Bicol translation support | English only for MVP; translate stop copy, UI chrome, and wayfinding; keep proper names as in the parish guide |
| [ ] | Shareable resume link (URL hash) if analytics show lost progress | Optional; see SPEC §8 |

## Milestone reminder

From SPEC §16 (keep as a rough clock, not a second checklist):

1. Week 1: content model, route rules, POI and map screens
2. Week 2: PWA offline, progress persistence, wayfinding sheet
3. Week 3: Umami, finish/donate stub, QR generation, on-site test
4. Week 4: parish content review, polish, launch
