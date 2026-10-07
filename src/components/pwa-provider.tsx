"use client";

import { SerwistProvider } from "@serwist/turbopack/react";

/**
 * Service worker only in production. In `next dev`, a SW can cache 403s from
 * blocked LAN origins and make phone testing look permanently broken.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "development") {
    return children;
  }

  return (
    <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
  );
}
