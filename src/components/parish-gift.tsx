"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useJourneyStore } from "@/lib/tour";
import { stubPaymentProvider } from "@/lib/payments/provider";
import { PrimaryButton } from "@/components/ui";

const AMOUNT_TEMPLATES = [20, 50, 100] as const;

export function ParishGift() {
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
        <h2 id="parish-gift-heading" className="text-base font-bold">
          Help the parish
        </h2>
        <p
          id="parish-gift-description"
          className="max-w-sm text-sm leading-relaxed text-[var(--accent-fg)]/90"
        >
          Your gift helps care for this church and the people who come here.
        </p>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium text-[var(--accent-fg)]">
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
                    : "border-white/20 bg-white/10 text-[var(--accent-fg)] hover:border-white/40"
                }`}
              >
                ₱{value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--accent-fg)]">
          Or type your own
        </span>
        <div className="flex min-h-11 items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3.5 py-2.5 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(184,92,56,0.25)]">
          <span className="text-sm font-semibold leading-none text-[var(--accent-fg)]/45">
            ₱
          </span>
          <input
            required
            inputMode="decimal"
            pattern="[0-9]+([.][0-9]{1,2})?"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold leading-none text-[var(--accent-fg)] outline-none placeholder:text-[var(--accent-fg)]/45"
            placeholder="0"
          />
        </div>
      </label>

      <div className="pt-0.5">
        <PrimaryButton type="submit">
          {submitting ? "Please wait…" : "Donate"}
        </PrimaryButton>
      </div>
    </form>
  );
}
