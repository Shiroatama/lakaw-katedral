import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding";

export const metadata: Metadata = {
  title: "Start at the entrance",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <Onboarding />;
}
