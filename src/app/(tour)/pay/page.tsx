import type { Metadata } from "next";
import { PayScreen } from "@/components/pay-screen";

export const metadata: Metadata = {
  title: "Pay 50 pesos",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return <PayScreen />;
}
