"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

type HlsVideoProps = {
  className?: string;
  flipped?: boolean;
};

const videoSource =
  "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

export function HlsVideo({ className, flipped = false }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setShouldLoadVideo(!mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setIsReady(false);

    if (!shouldLoadVideo) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    let hls: Hls | null = null;
    const markReady = () => setIsReady(true);

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(videoSource);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSource;
    }

    void video.play().catch(() => undefined);

    return () => {
      video.pause();
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [shouldLoadVideo]);

  const baseClassName = `${className ?? ""} ${flipped ? "-scale-y-100" : ""}`.trim();

  if (!shouldLoadVideo) {
    return <div className={baseClassName} aria-hidden="true" />;
  }

  return (
    <video
      ref={videoRef}
      className={`${baseClassName} transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`.trim()}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
