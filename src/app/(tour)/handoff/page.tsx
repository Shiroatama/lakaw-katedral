import type { Metadata } from "next";
import { HandoffView } from "@/components/handoff-view";

export const metadata: Metadata = {
  title: "Next place",
  robots: { index: false, follow: false },
};

export default function HandoffPage() {
  return <HandoffView />;
}
