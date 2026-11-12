"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Btn } from "@/components/ui";
import { useWalkIntro } from "@/components/walk-intro";
import {
  isJourneyComplete,
  isJourneyStarted,
  nagaTour,
  showHomeAtOnce,
  useJourneyHydrated,
  useJourneyStore,
} from "@/lib/tour";

/**
 * First screen for a fresh visit: the church poster. Once the walk has
 * started, `/` sends them to the Walk tab. Finished walks go to Finish.
 */
export function HomeView() {
  const router = useRouter();
  const ready = useJourneyHydrated();
  const progress = useJourneyStore();
  const playIntro = useWalkIntro();

  const total = nagaTour.pois.length;
  const complete =
    ready &&
    (progress.finishedAt !== null || isJourneyComplete(progress, nagaTour));
  const started = ready && isJourneyStarted(progress);
  const redirecting = ready && (complete || started);
  // Hide the CTA while redirecting. After Start over, show it at once.
  const showCopy = !redirecting && (ready || showHomeAtOnce);

  useEffect(() => {
    if (!ready) return;
    if (complete) {
      router.replace("/finish");
      return;
    }
    if (started) router.replace("/walk");
  }, [ready, complete, started, router]);

  useEffect(() => {
    router.prefetch("/onboarding");
  }, [router]);

  const { steward } = nagaTour;
  const breakAt = steward.name.lastIndexOf(" ");
  const line1 = steward.name.slice(0, breakAt);
  const line2 = steward.name.slice(breakAt + 1);

  return (
    <main className="view home" aria-label="Church poster">
      <div className="home-media">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/img/entrance.webp"
          aria-label="The cathedral entrance"
        >
          <source src="/video/entrance.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="home-credit">
        <Image
          src={steward.logo}
          width={503}
          height={868}
          alt=""
          unoptimized
          priority
        />
        <span>
          <span>{line1}</span>
          <span>{line2}</span>
        </span>
      </div>
      <div className="home-body" data-ready={showCopy ? "true" : "false"}>
        <h1>
          <BrandMark priority className="home-brand" />
        </h1>
        <p className="home-line">
          {total} places. Learn each one. Finish for a prize.
        </p>
        <p className="home-terms">
          By continuing, I agree to the{" "}
          <Link href="/terms">terms and conditions</Link>.
        </p>
      </div>
      <div className="home-dock" data-ready={showCopy ? "true" : "false"}>
        <Btn onClick={() => playIntro("/onboarding")}>Start the walk</Btn>
      </div>
    </main>
  );
}
