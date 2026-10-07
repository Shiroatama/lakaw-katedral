import { ViewTransition } from "react";

const directional = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;

/**
 * Wrap a page's content so in-app navigations move vertically: forward rises
 * from below, back drops in from above (CSS in globals.css). Only navigations
 * tagged with `transitionTypes` animate; QR scans, refreshes and the browser
 * back button just load normally. Browsers without View Transitions skip the
 * animation and work as usual.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={directional} exit={directional} default="none">
      {children}
    </ViewTransition>
  );
}
