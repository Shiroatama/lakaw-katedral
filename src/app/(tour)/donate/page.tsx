import { redirect } from "next/navigation";

/** Gift and next ideas live on /finish behind the success modal. */
export default function DonatePage() {
  redirect("/finish");
}
