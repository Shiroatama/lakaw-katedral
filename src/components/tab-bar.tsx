"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/walk", label: "Walk", icon: "/icons/tab-walk.png" },
  { href: "/parish", label: "Parish", icon: "/icons/tab-parish.png" },
  { href: "/you", label: "Profile", icon: "/icons/tab-you.png" },
] as const;

/** Bottom tabs. Only the Walk, Parish, and Profile shells render this. */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="App">
      {TABS.map((tab) => {
        const on = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab${on ? " is-on" : ""}`}
            aria-current={on ? "page" : undefined}
          >
            <Image
              className="tab-icon"
              src={tab.icon}
              width={256}
              height={256}
              alt=""
              unoptimized
            />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
