import type { Metadata } from "next";
import { LoginScreen } from "@/components/login-screen";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginScreen />;
}
