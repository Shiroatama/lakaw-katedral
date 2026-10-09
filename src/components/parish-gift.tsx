"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useJourneyStore } from "@/lib/tour";
import { stubPaymentProvider } from "@/lib/payments/provider";
import { PrimaryButton } from "@/components/ui";

type ParishGiftProps = {
  /** Extra action under the give button (e.g. Start over) */
  footer?: React.ReactNode;
};

const AMOUNT_TEMPLATES = [20, 50, 100] as const;

export function ParishGift({ footer }: ParishGiftProps) {
  const router = useRouter();
  const pathname = usePathname();
  const markDonated = useJourneyStore((s) => s.markDonated);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedTemplate = AMOUNT_TEMPLATES.find(
    (value) => amount === String(value),
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const value = Number(amount);
      const { redirectUrl } = await stubPaymentProvider.createPayment({
        amount: value,
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
          Your gift helps care for this church and the people who come here.
        </p>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium text-[var(--foreground)]">
          How much?
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {AMOUNT_TEMPLATES.map((value) => {
            const selected = selectedTemplate === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmount(String(value))}
                className={`inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-md border px-5 py-2.5 text-sm font-semibold leading-none transition-[transform,background-color,border-color,color] duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]/50"
                }`}
              >
                ₱{value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Or type your own
        </span>
        <div className="flex min-h-11 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(184,92,56,0.15)]">
          <span className="text-sm font-semibold leading-none text-[var(--muted-fg)]">
            ₱
          </span>
          <input
            required
            inputMode="decimal"
            pattern="[0-9]+([.][0-9]{1,2})?"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold leading-none outline-none"
            placeholder="0"
          />
        </div>
      </label>

      <div className="flex flex-col gap-2 pt-0.5">
        <PrimaryButton type="submit">
          {submitting ? "Please wait…" : "Give (coming soon)"}
        </PrimaryButton>
        {footer}
      </div>
    </form>
  );
}
