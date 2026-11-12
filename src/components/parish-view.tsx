"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/ui";
import { stubPaymentProvider } from "@/lib/payments/provider";
import {
  isJourneyComplete,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

const GIFT_TEMPLATES = [20, 50, 100, 500] as const;
const GIFT_MIN = 20;
const THANKS_MS = 1200;

const IDEAS = [
  {
    title: "Offer a Mass",
    body: "Ask at the parish office.",
    image: "/img/prayer.webp",
    position: "center 30%",
  },
  {
    title: "Holy Family Chapel",
    body: "A quieter place to pray.",
    image: "/img/bell-sagrada-familia.webp",
    position: "center",
  },
  {
    title: "Souvenir shop",
    body: "Small keepsakes when open.",
    image: "/img/porta-mariae-museum.webp",
    position: "center",
  },
] as const;

function parseGift(value: string): number | null {
  const trimmed = value.trim();
  if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount < GIFT_MIN) return null;
  return amount;
}

function formatGift(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/** Parish tab: always on. Prize cue after the walk, a gift, and ideas. */
export function ParishView() {
  const ready = useJourneyHydrated();
  const progress = useJourneyStore();
  const markDonated = useJourneyStore((s) => s.markDonated);
  const [text, setText] = useState("20");
  const [thanks, setThanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<number | null>(null);

  const walkDone =
    ready &&
    (progress.finishedAt !== null || isJourneyComplete(progress, nagaTour));
  const amount = parseGift(text);
  const invalid = amount === null;

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  async function give() {
    if (amount === null || submitting) return;
    setSubmitting(true);
    try {
      await stubPaymentProvider.createPayment({ amount, currency: "PHP" });
      markDonated();
      setThanks(true);
      timer.current = window.setTimeout(() => {
        setThanks(false);
        timer.current = null;
      }, THANKS_MS);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="parish-body">
      <div className="parish-hero">
        <Image
          src={
            walkDone
              ? "/img/finish-prize-side-pilgrim.jpg"
              : "/img/give-people.webp"
          }
          width={1200}
          height={600}
          alt={
            walkDone
              ? "A pilgrim at the parish side office holding a small prize"
              : "People gathered near the cathedral"
          }
          style={{ objectPosition: walkDone ? "center 35%" : "center 40%" }}
          unoptimized
          priority
        />
      </div>

      {walkDone ? (
        <section className="parish-section parish-prize">
          <h2>Your surprise prize</h2>
          <p>
            Ask at the parish office for the small prize the church has for
            you.
          </p>
        </section>
      ) : null}

      <section className="parish-section" aria-labelledby="parish-gift-heading">
        <h2 id="parish-gift-heading">Help the parish</h2>
        <p>If you liked this walk, a small gift helps keep it going.</p>
        <div className="gift-row" role="group" aria-label="Gift amount">
          {GIFT_TEMPLATES.map((value) => (
            <button
              key={value}
              type="button"
              className={`gift-amt${amount === value ? " is-on" : ""}`}
              aria-pressed={amount === value}
              onClick={() => setText(String(value))}
            >
              ₱{value}
            </button>
          ))}
        </div>
        <label className="gift-field">
          <span className="gift-field-prefix">₱</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            aria-label="Gift amount"
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <p className="gift-hint" hidden={!invalid}>
          Minimum gift is ₱{GIFT_MIN}.
        </p>
        <Btn onClick={give} disabled={invalid || thanks || submitting}>
          {thanks
            ? "Thank you"
            : amount === null
              ? "Give"
              : `Give ₱${formatGift(amount)}`}
        </Btn>
      </section>

      <section className="parish-section" aria-labelledby="parish-ideas-heading">
        <h2 id="parish-ideas-heading">While you are here</h2>
        <ul className="idea-list">
          {IDEAS.map((idea) => (
            <li key={idea.title}>
              <div className="idea-row is-static">
                <span className="idea-thumb">
                  <Image
                    src={idea.image}
                    width={144}
                    height={144}
                    alt=""
                    style={{ objectPosition: idea.position }}
                    unoptimized
                  />
                </span>
                <span className="idea-copy">
                  <strong>{idea.title}</strong>
                  <span>{idea.body}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
