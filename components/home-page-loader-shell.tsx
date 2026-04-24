"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import RevealLoader from "@/components/ui/reveal-loader";
import { PortfolioShell } from "@/components/portfolio-shell";
import type { PortfolioContent } from "@/lib/content";
import type { SkillShowcaseCategory } from "@/lib/skill-radar";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/supabase/client";

type HomePageLoaderShellProps = {
  content: PortfolioContent;
  latestPosts: BlogPost[];
  skillCategories: SkillShowcaseCategory[];
};

declare global {
  interface Window {
    __homeLoaderHandled?: boolean;
  }
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const getInitialPathname = () => {
  if (typeof window === "undefined") {
    return "/";
  }

  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

  if (!navigationEntry?.name) {
    return window.location.pathname;
  }

  try {
    return new URL(navigationEntry.name).pathname;
  } catch {
    return window.location.pathname;
  }
};

const shouldPlayHomeLoader = () => {
  if (typeof window === "undefined" || window.__homeLoaderHandled) {
    return false;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const navigationType = navigationEntry?.type;
  const isInitialHomeDocument = getInitialPathname() === "/";
  const isFreshHomeVisit = navigationType === "navigate" || navigationType === "reload";

  if (!isInitialHomeDocument || !isFreshHomeVisit) {
    return false;
  }

  window.__homeLoaderHandled = true;
  return true;
};

export function HomePageLoaderShell({
  content,
  latestPosts,
  skillCategories,
}: HomePageLoaderShellProps) {
  const [showLoader, setShowLoader] = useState(true);

  useIsomorphicLayoutEffect(() => {
    if (!shouldPlayHomeLoader()) {
      setShowLoader(false);
    }
  }, []);

  useEffect(() => {
    if (!showLoader) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showLoader]);

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

  return (
    <div className="relative min-h-screen bg-bg">
      <div
        className={cn(showLoader ? "pointer-events-none select-none" : "pointer-events-auto")}
        aria-hidden={showLoader}
      >
        <PortfolioShell content={content} latestPosts={latestPosts} skillCategories={skillCategories} />
      </div>

      {showLoader ? (
        <RevealLoader
          text="SHREYAS"
          textSize="clamp(3rem, 14vw, 8rem)"
          textColor="#f8fafc"
          bgColors={["#02040a", "#0b1421", "#05070d"]}
          angle={135}
          staggerOrder="edges-in"
          movementDirection="bottom-up"
          textFadeDelay={0.2}
          className="fixed inset-0 z-[200] h-dvh w-screen"
          onComplete={handleLoaderComplete}
        />
      ) : null}
    </div>
  );
}
