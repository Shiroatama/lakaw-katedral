import type { Metadata } from "next";
import { ParishView } from "@/components/parish-view";

export const metadata: Metadata = {
  title: "Parish",
};

export default function ParishPage() {
  return <ParishView />;
}
