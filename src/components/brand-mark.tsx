import Image from "next/image";

export const BRAND_MARK = "/brand/lakaw-katedral.png";

/** Cutout wordmark for hero titles and the start-walk handoff. */
export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={BRAND_MARK}
      alt="Lakaw Katedral"
      width={940}
      height={516}
      unoptimized
      priority={priority}
      className={className}
    />
  );
}
