/**
 * Absolute origin for printable QR codes.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://lakaw.example).
 * Falls back to a LAN-friendly default in development.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function stopUrl(slug: string, origin = getSiteUrl()): string {
  return `${origin}/s/${slug}`;
}
