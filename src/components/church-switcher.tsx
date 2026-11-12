"use client";

import Image from "next/image";
import { useEffect } from "react";

type ChurchSwitcherProps = {
  open: boolean;
  onClose: () => void;
  /** "On" while walking, "Done" once all places are solved. */
  nagaState: string;
  placeCount: number;
};

const COMING_SOON = [
  {
    name: "Peñafrancia Basilica",
    image: "/img/plaza-dome.webp",
  },
  {
    name: "San Francisco Church",
    image: "/img/porta-mariae.webp",
  },
] as const;

/**
 * Church list from the Walk logo. Naga is the only walk for now. Others are
 * listed as coming soon so the structure is ready.
 */
export function ChurchSwitcher({
  open,
  onClose,
  nagaState,
  placeCount,
}: ChurchSwitcherProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className="church-switcher"
      id="church-switcher"
      hidden={!open}
    >
      <button
        type="button"
        className="church-switcher-backdrop"
        aria-label="Close church list"
        onClick={onClose}
      />
      <div
        className="church-switcher-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="church-switcher-title"
      >
        <h2 id="church-switcher-title">Your walks</h2>
        <ul className="church-list">
          <li>
            <button
              type="button"
              className="church-row is-on"
              onClick={onClose}
            >
              <Image
                src="/img/home-facade.webp"
                width={96}
                height={96}
                alt=""
                unoptimized
              />
              <span>
                <strong>Naga Cathedral</strong>
                <span>{placeCount} places · Naga City</span>
              </span>
              <span className="church-state">{nagaState}</span>
            </button>
          </li>
          {COMING_SOON.map((church) => (
            <li key={church.name}>
              <button
                type="button"
                className="church-row"
                disabled
                aria-disabled="true"
              >
                <Image
                  src={church.image}
                  width={96}
                  height={96}
                  alt=""
                  unoptimized
                />
                <span>
                  <strong>{church.name}</strong>
                  <span>Coming soon · Naga City</span>
                </span>
                <span className="church-state">Soon</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
