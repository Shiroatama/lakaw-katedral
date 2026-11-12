import Link from "next/link";
import { MapPinIcon } from "@/components/icons";

/** "N of 16" chip on place and handoff. Goes to the Walk tab. */
export function MapChip({ order, total }: { order: number; total: number }) {
  return (
    <Link
      href="/walk"
      className="map-chip"
      aria-label={`Open walk map, place ${order} of ${total}`}
    >
      <MapPinIcon />
      <span>
        {order} of {total}
      </span>
    </Link>
  );
}
