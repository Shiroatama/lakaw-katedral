import { redirect } from "next/navigation";

/** Gift acknowledgment now lives as a modal on /finish. */
export default function ThankYouPage() {
  redirect("/finish");
}
