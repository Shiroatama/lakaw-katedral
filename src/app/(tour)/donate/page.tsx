import { redirect } from "next/navigation";

/** Donate lives inline on the finish screen. Keep this route as a redirect. */
export default function DonatePage() {
  redirect("/finish");
}
