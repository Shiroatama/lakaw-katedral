/**
 * Trial-mode switch. While QR codes are not printed yet, the wayfinding sheet
 * offers a "Skip the scan" button that opens the next stop directly.
 *
 * On by default. Set NEXT_PUBLIC_ALLOW_SKIP=false to turn it off once real QR
 * codes are in place.
 */
export const ALLOW_SKIP = process.env.NEXT_PUBLIC_ALLOW_SKIP !== "false";
