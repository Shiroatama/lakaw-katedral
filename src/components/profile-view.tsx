"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontalIcon } from "@/components/icons";
import { StartOver } from "@/components/start-over";
import { Btn } from "@/components/ui";
import { LOGIN_PATH, PROFILE_PATH } from "@/lib/access/gate";
import { useAccessStore } from "@/lib/access/store";
import { useAccessHydrated } from "@/lib/access/use-access-hydrated";
import {
  getPoints,
  isJourneyComplete,
  nagaTour,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

/** Profile tab: who you are on this phone, N of 16, and login to save. */
export function ProfileView() {
  const router = useRouter();
  const journeyReady = useJourneyHydrated();
  const accessReady = useAccessHydrated();
  const progress = useJourneyStore();
  const account = useAccessStore((s) => s.account);
  const logout = useAccessStore((s) => s.logout);
  const setReturnTo = useAccessStore((s) => s.setReturnTo);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const total = nagaTour.pois.length;
  const done = journeyReady ? progress.completed.length : 0;
  const complete = journeyReady && isJourneyComplete(progress, nagaTour);
  const percent = Math.min(100, Math.round((done / total) * 100));
  const points = journeyReady ? getPoints(progress) : 0;

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onPointer(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, [menuOpen]);

  function login() {
    setReturnTo(PROFILE_PATH);
    router.push(LOGIN_PATH);
  }

  function onLogout() {
    setMenuOpen(false);
    logout();
  }

  return (
    <div className="you-body">
      <div className="you-banner">
        <Image
          src="/img/bernardo-avatar.png"
          width={600}
          height={600}
          alt="Bernardo de la Concepción"
          unoptimized
          priority
        />
        <div className="you-settings">
          <button
            ref={triggerRef}
            type="button"
            className="you-settings-btn"
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontalIcon />
          </button>
          {menuOpen ? (
            <div
              ref={menuRef}
              id={menuId}
              className="you-settings-menu"
              role="menu"
              aria-label="Settings"
            >
              <button
                type="button"
                role="menuitem"
                className="you-settings-item"
                disabled={!accessReady || !account}
                onClick={onLogout}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="you-identity">
        <h1 className="you-name">Bernardo de la Concepción</h1>
      </div>

      <section className="you-section" aria-labelledby="you-progress-heading">
        <h2 id="you-progress-heading">Your progress</h2>
        <div className="you-progress-block">
          <div className="you-progress-thumb">
            <Image
              src="/img/entrance.webp"
              width={144}
              height={144}
              alt=""
              unoptimized
            />
          </div>
          <div className="you-progress-copy">
            <div className="you-progress-meta">
              <strong>Naga Cathedral</strong>
              <span>
                {done} of {total}
                {complete ? " · Done" : ""}
              </span>
            </div>
            <div className="you-progress" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
        <p className="you-account-note" style={{ textAlign: "left" }}>
          {points} points so far.
        </p>
      </section>

      <section className="you-section you-account">
        {accessReady && account ? (
          <p className="you-account-note">
            Saved on this phone as {account.email}.
          </p>
        ) : (
          <>
            <Btn onClick={login} disabled={!accessReady}>
              Log in to save
            </Btn>
            <p className="you-account-note">
              Log in to save your progress on your account.
            </p>
          </>
        )}
      </section>

      <div className="you-quiet">
        <StartOver />
      </div>
    </div>
  );
}
