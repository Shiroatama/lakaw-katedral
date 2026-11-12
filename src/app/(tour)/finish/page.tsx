import type { Metadata } from "next";
import { FinishView } from "@/components/finish-view";

export const metadata: Metadata = {
  title: "You finished the walk",
  robots: { index: false, follow: false },
};

export default function FinishPage() {
  return <FinishView />;
}
