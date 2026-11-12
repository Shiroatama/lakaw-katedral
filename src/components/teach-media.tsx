"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Poi } from "@/lib/tour";

type TeachMediaProps = {
  poi: Poi;
  /** Solved places show the still. The loop belongs to the first visit. */
  solved: boolean;
};

/**
 * Teach media slot at the top of a place: a looping video with sound, or a
 * still. Served from /public so the PWA can precache it.
 */
export function TeachMedia({ poi, solved }: TeachMediaProps) {
  const useVideo = Boolean(poi.heroVideo) && !solved;
  const frame = useVideo ? (poi.heroVideoFrame ?? "landscape") : "landscape";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!useVideo || !video) return;

    video.muted = false;
    void video.play().catch(() => {});

    return () => {
      video.pause();
    };
  }, [useVideo, poi.heroVideo]);

  return (
    <div className={`teach-media ${frame}`}>
      {useVideo ? (
        <video
          ref={videoRef}
          src={poi.heroVideo}
          poster={poi.heroVideoPoster ?? poi.heroImage}
          controls
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-label={poi.title}
        />
      ) : (
        <Image
          src={poi.heroImage}
          alt={poi.title}
          fill
          unoptimized
          priority
          sizes="(max-width: 480px) 100vw, 480px"
        />
      )}
    </div>
  );
}
