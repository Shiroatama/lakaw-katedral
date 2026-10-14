"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useJourneyStore } from "@/lib/tour";
import { stubPaymentProvider } from "@/lib/payments/provider";
import { PrimaryButton } from "@/components/ui";

const AMOUNT_TEMPLATES = [20, 50, 100, 500] as const;

function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function formatPeso(amount: number): string {
  return Number.isInteger(amount) ? `₱${amount}` : `₱${amount.toFixed(2)}`;
}

export function ParishGift() {
  const router = useRouter();
  const pathname = usePathname();
  const markDonated = useJourneyStore((s) => s.markDonated);
  const [amountText, setAmountText] = useState("20");
  const [submitting, setSubmitting] = useState(false);
  const amount = parseAmount(amountText);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (amount == null || submitting) return;
    setSubmitting(true);
    try {
      const { redirectUrl } = await stubPaymentProvider.createPayment({
        amount,
        currency: "PHP",
      });
      markDonated();
      // Stay on /finish when already there; ThankYouModal opens from donated.
      if (pathname !== redirectUrl) {
        router.replace(redirectUrl);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-3 text-left"
      aria-labelledby="parish-gift-heading"
      aria-describedby="parish-gift-description"
    >
      <div className="space-y-1">
        <h2
          id="parish-gift-heading"
          className="font-display text-xl text-[var(--foreground)]"
        >
          Help the parish
        </h2>
        <p
          id="parish-gift-description"
          className="max-w-sm text-sm leading-relaxed text-[var(--muted-fg)]"
        >
          If you liked this walk, your help matters. It makes this experience
          better, and helps us serve everyone who comes.
        </p>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium text-[var(--foreground)]">
          How much?
        </legend>
        <div className="flex w-full flex-wrap gap-1.5">
          {AMOUNT_TEMPLATES.map((value) => {
            const selected = amount === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmountText(String(value))}
                className={`inline-flex min-h-11 min-w-[3.75rem] flex-1 items-center justify-center rounded-md px-2 py-2.5 text-sm font-semibold leading-none transition-[transform,background-color,color] duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${
                  selected
                    ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                    : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--stone-light)]"
                }`}
              >
                ₱{value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="sr-only">Amount</span>
        <div className="flex min-h-11 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(184,92,56,0.25)]">
          <span className="text-sm font-semibold leading-none text-[var(--muted-fg)]">
            ₱
          </span>
          <input
            required
            inputMode="decimal"
            autoComplete="off"
            pattern="[0-9]+([.][0-9]{1,2})?"
            value={amountText}
            onChange={(event) => setAmountText(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold leading-none text-[var(--foreground)] outline-none"
          />
        </div>
      </label>

      <div className="pt-0.5">
        <PrimaryButton type="submit" disabled={amount == null || submitting}>
          {submitting
            ? "Please wait…"
            : amount == null
              ? "Give"
              : `Give ${formatPeso(amount)}`}
        </PrimaryButton>
      </div>
    </form>
  );
}
