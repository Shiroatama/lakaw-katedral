import { nagaTour } from "@/lib/tour";
import { PrintButton } from "@/components/print-button";
import { makeQrSvg } from "@/lib/qr/make-qr";
import { getSiteUrl, stopUrl } from "@/lib/qr/site-url";

export const metadata = {
  title: "Print QR codes",
  robots: { index: false, follow: false },
};

export default async function PrintQrPage() {
  const origin = getSiteUrl();
  const cards = await Promise.all(
    nagaTour.pois.map(async (poi) => {
      const url = stopUrl(poi.slug, origin);
      const svg = await makeQrSvg(url);
      return { poi, url, svg };
    }),
  );

  return (
    <main className="print-qr mx-auto w-full max-w-4xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="print-hide mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-fg)]">
          Lakaw Katedral
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
          Print QR codes
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[var(--muted-fg)]">
          Each code opens that place in the walk. Print at least 4 cm by 4 cm,
          matte if you can, so glare does not block the scan. Base URL:{" "}
          <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-sm text-[var(--foreground)]">
            {origin}
          </code>
        </p>
        <p className="text-sm text-[var(--muted-fg)]">
          Set{" "}
          <code className="rounded bg-[var(--surface)] px-1.5 py-0.5">
            NEXT_PUBLIC_SITE_URL
          </code>{" "}
          before printing for the real domain. Use your phone&apos;s LAN URL
          while testing on site.
        </p>
        <PrintButton />
      </header>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
        {cards.map(({ poi, url, svg }) => (
          <li
            key={poi.id}
            className="print-card flex flex-col items-center gap-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
              Place {poi.order}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight text-[var(--foreground)]">
              {poi.shortTitle}
            </h2>
            <div
              className="qr-svg w-full max-w-[220px] [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="text-sm font-medium text-[var(--foreground)]">
              Scan with your camera to begin or continue the walk.
            </p>
            <p className="break-all font-mono text-xs text-[var(--muted-fg)]">
              {url}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
