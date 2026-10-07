import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phone / LAN testing: without this, Next blocks /_next/* from the LAN IP
  // (403), so JS never runs and the home page stays as the image-only SSR shell.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default withSerwist(nextConfig);

// Cloudflare bindings during `next dev` only.
// @see https://opennext.js.org/cloudflare/get-started
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}
