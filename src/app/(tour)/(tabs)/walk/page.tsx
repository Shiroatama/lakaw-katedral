import type { Metadata } from "next";
import { WalkView } from "@/components/walk-view";

export const metadata: Metadata = {
  title: "Walk",
};

export default function WalkPage() {
  return <WalkView />;
}
