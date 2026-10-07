import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phone / LAN testing: without this, Next blocks /_next/* from the LAN IP
  // (403), so JS never runs and the home page stays as the image-only SSR shell.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default withSerwist(nextConfig);
