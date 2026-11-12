/**
 * Trial-mode switch. While QR codes are not printed yet, Scan and Handoff
 * offer a quiet "Skip the scan" link that opens the next place directly.
 *
 * On by default. Set NEXT_PUBLIC_ALLOW_SKIP=false to turn it off once real QR
 * codes are in place.
 */
export const ALLOW_SKIP = process.env.NEXT_PUBLIC_ALLOW_SKIP !== "false";
