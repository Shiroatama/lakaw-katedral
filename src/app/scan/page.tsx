import type { Metadata } from "next";
import { QrScanner } from "@/components/qr-scanner";

export const metadata: Metadata = {
  title: "Scan a place",
  robots: { index: false, follow: false },
};

export default function ScanPage() {
  return (
    <main className="flex flex-1 flex-col">
      <QrScanner />
    </main>
  );
}
