"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useJourneyStore } from "@/lib/tour";
import { stubPaymentProvider } from "@/lib/payments/provider";
import { PrimaryButton } from "@/components/ui";

type ParishGiftProps = {
  /** Extra action under the donate button (e.g. Not now / Home) */
  footer?: React.ReactNode;
};

export function ParishGift({ footer }: ParishGiftProps) {
  const router = useRouter();
  const markDonated = useJourneyStore((s) => s.markDonated);
  const [amount, setAmount] = useState("");
  const [offline, setOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOffline(true);
      return;
    }
    setSubmitting(true);
    try {
      const value = Number(amount);
      const { redirectUrl } = await stubPaymentProvider.createPayment({
        amount: value,
        currency: "PHP",
      });
      markDonated();
      router.push(redirectUrl, { transitionTypes: ["nav-forward"] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-5 text-left"
      aria-labelledby="parish-gift-heading"
    >
      <div className="space-y-2">
        <h2
          id="parish-gift-heading"
          className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]"
        >
          Help the parish
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted-fg)]">
          Your gift helps care for the Cathedral and welcome the next visitors.
          Every peso stays with the parish.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--foreground)]">
          How much? (PHP)
        </span>
        <div className="flex min-h-12 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(184,92,56,0.15)]">
          <span className="text-base text-[var(--muted-fg)]">PHP</span>
          <input
            required
            inputMode="decimal"
            pattern="[0-9]+([.][0-9]{1,2})?"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setOffline(false);
            }}
            className="w-full bg-transparent text-lg outline-none"
            placeholder="0.00"
          />
        </div>
      </label>

      {offline ? (
        <p
          className="fade-up rounded-md border border-[var(--danger)]/35 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--danger)]"
          role="alert"
        >
          You need internet to give. Try again when you have signal.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-1">
        <PrimaryButton type="submit">
          {submitting ? "Please wait…" : "Give (coming soon)"}
        </PrimaryButton>
        {footer}
      </div>
    </form>
  );
}
