const PASSWORD_MIN = 8;
const PASSWORD_PREFIX = "lakaw-katedral-v1:";

export type SavedAccount = {
  email: string;
  passwordHash: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Plain-language field error, or null when email and password are usable. */
export function loginFieldError(email: string, password: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return "Type your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "That email does not look right.";
  }
  if (password.length < PASSWORD_MIN) return "Use at least 8 characters.";
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${PASSWORD_PREFIX}${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export type LoginAttempt =
  | { ok: true; account: SavedAccount }
  | { ok: false; reason: "other-email" | "wrong-password" };

/**
 * First visit on this phone creates the account. A later visit must use the
 * same email and password. One account per phone.
 */
export async function attemptLogin(
  existing: SavedAccount | null,
  email: string,
  password: string,
): Promise<LoginAttempt> {
  const normalized = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  if (!existing) {
    return { ok: true, account: { email: normalized, passwordHash } };
  }
  if (existing.email !== normalized) return { ok: false, reason: "other-email" };
  if (existing.passwordHash !== passwordHash) {
    return { ok: false, reason: "wrong-password" };
  }
  return { ok: true, account: existing };
}
