"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginFieldError } from "@/lib/access/account";
import { FREE_PLACE_COUNT, PAY_PATH, PROFILE_PATH } from "@/lib/access/gate";
import { useAccessStore } from "@/lib/access/store";
import { useAccessHydrated } from "@/lib/access/use-access-hydrated";
import { GateFrame } from "@/components/gate-frame";
import { Btn } from "@/components/ui";

const FORM_ID = "walk-login";
const WORDS = ["", "one", "two", "three", "four", "five"];

export function LoginScreen() {
  const router = useRouter();
  const ready = useAccessHydrated();
  const account = useAccessStore((s) => s.account);
  const returnTo = useAccessStore((s) => s.returnTo);
  const setReturnTo = useAccessStore((s) => s.setReturnTo);
  const saveLogin = useAccessStore((s) => s.saveLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const left = useRef(false);

  // Once saved (now or earlier), move on. Logging in from Profile goes back
  // there. A walk gate goes on to pay.
  useEffect(() => {
    if (!ready || !account || left.current) return;
    left.current = true;
    const path = returnTo === PROFILE_PATH ? PROFILE_PATH : PAY_PATH;
    if (path === PROFILE_PATH) setReturnTo(null);
    router.replace(path);
  }, [ready, account, returnTo, setReturnTo, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const fieldError = loginFieldError(email, password);
    if (fieldError) {
      setError(fieldError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await saveLogin(email, password);
      if (result === "other-email") {
        setError("This phone already has an email. Use that email.");
        return;
      }
      if (result === "wrong-password") {
        setError("That password does not match.");
        return;
      }
      // The effect above takes it from here.
    } catch {
      setError("We could not save your login. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || account) {
    return <main className="view not-ready" />;
  }

  const free = WORDS[FREE_PLACE_COUNT] ?? String(FREE_PLACE_COUNT);

  return (
    <GateFrame
      image="/img/statue.webp"
      imageAlt="The Cathedra"
      kicker="The free walk"
      title="Continue the walk"
      lede={`The first ${free} places are free. Log in to open the rest. We will remember you on this phone.`}
      action={
        <Btn type="submit" form={FORM_ID} disabled={submitting}>
          {submitting ? "Please wait" : "Log in"}
        </Btn>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="gate-form" noValidate>
        <label className="gate-field">
          <span>Email</span>
          <span className="gate-field-box">
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </span>
        </label>

        <label className="gate-field">
          <span>Password</span>
          <span className="gate-field-box">
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </span>
          <span className="gate-help">Use at least 8 characters.</span>
        </label>

        <p className="gate-error" role="alert" hidden={!error}>
          {error}
        </p>
      </form>
    </GateFrame>
  );
}
