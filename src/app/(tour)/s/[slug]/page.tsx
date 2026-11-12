import { notFound } from "next/navigation";
import { PlaceView } from "@/components/place-view";
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

  return <PlaceView key={poi.slug} poi={poi} />;
}
