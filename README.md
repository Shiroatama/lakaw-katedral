# Lakaw Katedral

Mobile web app for a QR-guided walk through Naga Metropolitan Cathedral.

See [docs/SPEC.md](docs/SPEC.md) for the MVP product and technical spec, and [docs/DESIGN.md](docs/DESIGN.md) for color, UX flow, and screen inventory.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Zustand (persisted journey progress)
- Serwist (PWA / offline via Turbopack)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test on your phone (same Wi‑Fi)

```bash
npm run dev:lan
ipconfig getifaddr en0   # your Mac's LAN IP, e.g. 192.168.1.67
```

On the phone open `http://<that-ip>:3000/s/entrance`.

`next.config.ts` allows private LAN origins in development (`allowedDevOrigins`). Without that, Next returns 403 for `/_next` JS/CSS from the phone, React never starts, and you only see the hero image.

If the phone still shows a half-broken page after a config change:

1. Chrome Android: tap the lock/tune icon in the address bar → **Permissions** / site settings → **Clear & reset**, or Chrome menu → **Delete browsing data** → cached images and files (for that site).
2. Or open the URL in a **Chrome Incognito** tab (no service worker / old cache).
3. Confirm the IP again; DHCP can change it.

Stop URLs (readable on purpose, so they can be typed by hand):

| Stop | URL |
|------|-----|
| Entrance | `/s/entrance` |
| Murals | `/s/murals` |
| Statue | `/s/statue` |

### QR codes

- Print sheet: [http://localhost:3000/print/qr](http://localhost:3000/print/qr) (set `NEXT_PUBLIC_SITE_URL` to the public or LAN origin before printing).
- In-app scanner: `/scan` (also from the map sheet: **Scan with this phone**). Needs camera permission. On a phone, prefer HTTPS or `localhost`; plain `http://192.168…` may block the camera.
- Phone camera app still works: each printed code is a normal `/s/<slug>` link.

Visitor-facing copy uses plain words around real names (say "place", not "stop", but keep names like Naga Metropolitan Cathedral; see SPEC section 3.1). Until QR codes are printed, the map sheet has a "Skip the scan" button. Turn it off with `NEXT_PUBLIC_ALLOW_SKIP=false`.

Offline mode only works in a production build: `npm run build && npm run start`, then test in airplane mode. `next dev` does not register the service worker.

## Scripts

- `npm run dev` — development server
- `npm run build` — Next.js production build
- `npm run start` — serve Next.js production build
- `npm run lint` — ESLint
- `npm run preview` — OpenNext build + local Workers preview
- `npm run deploy` — OpenNext build + deploy to Cloudflare Workers

## Cloudflare Workers

This app deploys with [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare/get-started).

`npm run build` runs the OpenNext Cloudflare build (not plain `next build`), so the default Cloudflare Workers Git settings work:

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` (repo root) |

Also set the Worker variable / env:

- `NEXT_PUBLIC_SITE_URL` = `https://<your-worker>.workers.dev` (or your custom domain)

For a plain Node server locally, use `npm run build:next && npm start`.

Local Cloudflare check:

```bash
npm run build
```
