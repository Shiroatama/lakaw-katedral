import { getPoiBySlug, nagaTour } from "@/lib/tour";

export type ParseScanResult =
  | { ok: true; slug: string; href: string }
  | { ok: false; reason: "empty" | "unknown" | "not_a_stop" };

/**
 * Turn a QR payload into a stop path. Accepts full URLs to /s/<slug>,
 * bare /s/<slug> paths, or a known slug alone.
 */
export function parseScanPayload(raw: string): ParseScanResult {
  const text = raw.trim();
  if (!text) return { ok: false, reason: "empty" };

  const slug = extractSlug(text);
  if (!slug) return { ok: false, reason: "not_a_stop" };

  const poi = getPoiBySlug(slug);
  if (!poi) return { ok: false, reason: "unknown" };

  return { ok: true, slug: poi.slug, href: `/s/${poi.slug}` };
}

function extractSlug(text: string): string | null {
  // Known slug typed or encoded alone
  if (nagaTour.pois.some((poi) => poi.slug === text.toLowerCase())) {
    return text.toLowerCase();
  }

  try {
    const url = new URL(text);
    return slugFromPath(url.pathname);
  } catch {
    // Relative path or path-like string
    if (text.startsWith("/")) {
      return slugFromPath(text.split("?")[0]?.split("#")[0] ?? text);
    }
    return null;
  }
}

function slugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/s\/([a-z0-9-]+)\/?$/i);
  return match?.[1]?.toLowerCase() ?? null;
}
