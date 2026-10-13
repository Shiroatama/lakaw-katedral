import { nagaTour } from "@/lib/tour";
import { makeQrSvg } from "@/lib/qr/make-qr";
import { getSiteUrl, stopUrl } from "@/lib/qr/site-url";

export const metadata = {
  title: "QR codes",
  robots: { index: false, follow: false },
};

export default async function QrPage() {
  const origin = getSiteUrl();
  const cards = await Promise.all(
    nagaTour.pois.map(async (poi) => {
      const url = stopUrl(poi.slug, origin);
      const svg = await makeQrSvg(url);
      return { poi, svg };
    }),
  );

  return (
    <main className="print-qr mx-auto w-full max-w-4xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
        {cards.map(({ poi, svg }) => (
          <li
            key={poi.id}
            className="print-card flex flex-col items-center gap-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
          >
            <h2 className="font-display text-xl leading-tight text-[var(--foreground)]">
              {poi.shortTitle}
            </h2>
            <div
              className="qr-svg w-full max-w-[220px] [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
