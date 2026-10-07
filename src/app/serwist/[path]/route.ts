import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import { nagaTour } from "@/lib/tour/content";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

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
