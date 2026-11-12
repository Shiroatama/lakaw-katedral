import { redirect } from "next/navigation";

/** The map is the Walk tab now. Old links land there. */
export default function MapPage() {
  redirect("/walk");
}
