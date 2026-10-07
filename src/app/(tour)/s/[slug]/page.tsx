import { notFound } from "next/navigation";
import { PageTransition } from "@/components/page-transition";
import { ScanScreen } from "@/components/scan-screen";
import { getPoiBySlug, nagaTour } from "@/lib/tour";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return nagaTour.pois.map((poi) => ({ slug: poi.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const poi = getPoiBySlug(slug);
  if (!poi) return { title: "Place not found" };
  return { title: poi.title };
}

export default async function StopPage({ params }: PageProps) {
  const { slug } = await params;
  const poi = getPoiBySlug(slug);
  if (!poi) notFound();

  return (
    <PageTransition>
      <main className="flex flex-1 flex-col">
        <ScanScreen key={poi.slug} poi={poi} />
      </main>
    </PageTransition>
  );
}
