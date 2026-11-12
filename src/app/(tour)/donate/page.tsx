import { redirect } from "next/navigation";

/** Gifts are given from the Parish tab. */
export default function DonatePage() {
  redirect("/parish");
}
