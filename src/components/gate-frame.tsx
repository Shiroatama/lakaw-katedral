import Image from "next/image";
import Link from "next/link";

type GateFrameProps = {
  image: string;
  imageAlt: string;
  kicker: string;
  title: string;
  lede: string;
  children: React.ReactNode;
  action: React.ReactNode;
};

/**
 * Frame for the login and pay steps: hero, kicker, display title, copy, then
 * the dock with the primary action and a way back to the walk. No tabs.
 */
export function GateFrame({
  image,
  imageAlt,
  kicker,
  title,
  lede,
  children,
  action,
}: GateFrameProps) {
  return (
    <main className="view gate">
      <div className="gate-body">
        <div className="gate-hero">
          <Image
            src={image}
            width={1280}
            height={720}
            alt={imageAlt}
            unoptimized
            priority
          />
        </div>
        <div className="gate-copy">
          <p className="gate-kicker">{kicker}</p>
          <h1 className="gate-title">{title}</h1>
          <p className="gate-lede">{lede}</p>
          {children}
        </div>
      </div>
      <div className="gate-dock">
        {action}
        <Link href="/walk" className="gate-back">
          Back to the walk
        </Link>
      </div>
    </main>
  );
}
