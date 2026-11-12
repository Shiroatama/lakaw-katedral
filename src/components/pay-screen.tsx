"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LOGIN_PATH,
  TEMP_PAY_UNLOCK,
  WALK_PRICE_PESOS,
} from "@/lib/access/gate";
import { useAccessStore } from "@/lib/access/store";
import { useAccessHydrated } from "@/lib/access/use-access-hydrated";
import { GateFrame } from "@/components/gate-frame";
import { Btn } from "@/components/ui";

/**
 * Pay step. A confirmed payment sets `paid` and the visitor continues to
 * where they were headed. Internal builds confirm locally (TEMP_PAY_UNLOCK);
 * a real provider (SukiPay) will call the same `confirmPayment`.
 */
export function PayScreen() {
  const router = useRouter();
  const ready = useAccessHydrated();
  const account = useAccessStore((s) => s.account);
  const paid = useAccessStore((s) => s.paid);
  const returnTo = useAccessStore((s) => s.returnTo);
  const setReturnTo = useAccessStore((s) => s.setReturnTo);
  const confirmPayment = useAccessStore((s) => s.confirmPayment);
  const [notice, setNotice] = useState<string | null>(null);
  const left = useRef(false);

  useEffect(() => {
    if (!ready || left.current) return;
    if (!account) {
      left.current = true;
      router.replace(LOGIN_PATH);
      return;
    }
    if (paid) {
      left.current = true;
      setReturnTo(null);
      router.replace(returnTo ?? "/handoff");
    }
  }, [ready, account, paid, returnTo, setReturnTo, router]);

  if (!ready || !account || paid) {
    return <main className="view not-ready" />;
  }

  function pay() {
    if (TEMP_PAY_UNLOCK) {
      confirmPayment();
      return;
    }
    setNotice("SukiPay is not ready yet. The next places stay locked.");
  }

  return (
    <GateFrame
      image="/img/cathedral-interior.webp"
      imageAlt="Inside Naga Metropolitan Cathedral"
      kicker="The rest of the walk"
      title="Keep walking"
      lede="Unlock the rest of the places and finish the walk."
      action={<Btn onClick={pay}>Pay ₱{WALK_PRICE_PESOS}</Btn>}
    >
      <p className="gate-price">₱{WALK_PRICE_PESOS}</p>
      <span className="gate-price-rule" aria-hidden="true" />
      <p className="gate-help">Saved on this phone as {account.email}.</p>
      {notice ? (
        <p className="gate-notice" role="status">
          {notice}
        </p>
      ) : null}
    </GateFrame>
  );
}
