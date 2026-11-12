import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Terms and conditions",
};

export default function TermsPage() {
  return (
    <main className="view">
      <div className="topbar">
        <Link href="/" className="place-back" aria-label="Back">
          <ChevronLeftIcon />
        </Link>
        <p className="count">Terms and conditions</p>
      </div>
      <div className="learn-body">
        <p className="prose">By continuing, you agree to these terms.</p>
        <p className="prose">
          The first three places are free. The rest of the walk costs ₱50.
          Your progress stays on this phone. We do not ask for your name.
        </p>
        <p className="prose">
          Walk quietly and kindly inside Naga Metropolitan Cathedral.
        </p>
        <p className="prose">
          Finish the walk for a surprise prize from the parish. You can help
          the parish if you like. That is your choice.
        </p>
      </div>
    </main>
  );
}
