import { createSerwistRoute } from "@serwist/turbopack";
import { nagaTour } from "@/lib/tour/content";

/**
 * Cache-busting revision for precached pages. Prefer CI commit SHAs so we
 * never shell out to `git` (Workers cannot run child_process).
 */
const revision =
  process.env.WORKERS_CI_COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  Date.now().toString(36);

/**
 * Pages saved on the visitor's phone the first time the service worker
 * installs, so every later scan works with no signal (SPEC §10).
 * Donation pages are intentionally left out: giving needs a network.
 */
const OFFLINE_PAGES = [
  "/",
  "/map",
  "/finish",
  "/~offline",
  ...nagaTour.pois.map((poi) => `/s/${poi.slug}`),
];

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: OFFLINE_PAGES.map((url) => ({ url, revision })),
    // Serwist's default patterns, plus web fonts (.woff/.woff2), which the
    // default misses. Hero images live in public/ and are covered by the second pattern.
    globPatterns: [
      ".next/static/**/*.{js,css,html,ico,apng,png,avif,jpg,jpeg,jfif,pjpeg,pjp,gif,svg,webp,json,webmanifest,woff,woff2}",
      "public/**/*",
    ],
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });
