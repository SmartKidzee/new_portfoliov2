"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Anton } from "next/font/google";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

gsap.registerPlugin(useGSAP);

// --- EXPORTED TYPES ---
export type StaggerType = "left-to-right" | "right-to-left" | "center-out" | "edges-in";
export type MovementType = "top-down" | "bottom-up" | "fade-out" | "scale-vertical";

interface RevealLoaderProps {
  text?: string;
  textSize?: string;
  textColor?: string;
  bgColors?: string[];
  angle?: number;
  staggerOrder?: StaggerType;
  movementDirection?: MovementType;
  textFadeDelay?: number;
  className?: string;
  onComplete?: () => void;
}

const RevealLoader = ({
  text = "VENGEANCE",
  textSize = "100px",
  textColor = "white",
  bgColors = ["#000000"],
  angle = 0,
  staggerOrder = "left-to-right",
  movementDirection = "top-down",
  textFadeDelay = 0.5,
  className,
  onComplete,
}: RevealLoaderProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);

  const getBackgroundStyle = () => {
    if (bgColors.length === 0) return { backgroundColor: "black" };
    if (bgColors.length === 1) return { backgroundColor: bgColors[0] };
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${bgColors.join(", ")})`,
    };
  };

  const getStaggerFrom = (type: StaggerType): string | number => {
    switch (type) {
      case "right-to-left": return "end";
      case "center-out": return "center";
      case "edges-in": return "edges";
      case "left-to-right":
      default: return "start";
    }
  };

  const getAnimationProperties = (type: MovementType) => {
    switch (type) {
      case "bottom-up":
        return { y: "-100%", ease: "power2.inOut" };
      case "fade-out":
        return { autoAlpha: 0, ease: "power2.inOut" };
      case "scale-vertical":
        return { scaleY: 0, transformOrigin: "center", ease: "power2.inOut" };
      case "top-down":
      default:
        return { y: "100%", ease: "power2.inOut" };
    }
  };

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: onComplete,
      });

      const moveProps = getAnimationProperties(movementDirection);
      const staggerConfig = {
        each: 0.045,
        from: getStaggerFrom(staggerOrder) as any,
      };

      // 0. Initial Setup
      gsap.set(".name-text", { opacity: 1 });
      gsap.set(".name-text span", { yPercent: 110 });

      // 1. Reveal Text
      tl.to(".name-text span", {
        yPercent: 0,
        stagger: 0.032,
        duration: 0.56,
        ease: "expo.out",
      });

      // 2. Animate Bars (The main structural animation)
      // Preserve every stage of the reveal (letter draw-in, brief hold, bar
      // exit, and word fade) while tightening the whole timeline.
      tl.to(".preloader-item", {
        delay: Math.max(textFadeDelay, 0.18),
        duration: 0.52,
        stagger: staggerConfig,
        ...moveProps,
      })
        // 3. Fade Text Smoothly
        .to(".name-text span", { 
          autoAlpha: 0, 
          yPercent: -80, 
          scale: 0.95,
          duration: 0.34,
          stagger: 0.016,
          ease: "power2.out" 
        }, `<0.22`)

        // 4. Hide Container
        .to(preloaderRef.current, { autoAlpha: 0, duration: 0.08 }, "+=0.04");
    },
    { scope: preloaderRef, dependencies: [staggerOrder, movementDirection, textFadeDelay] },
  );

  return (
    <div
      className={cn(
        "absolute inset-0 z-[50] flex overflow-hidden bg-transparent",
        className,
      )}
      ref={preloaderRef}
    >
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="preloader-item h-full w-[10%]"
          style={getBackgroundStyle()}
        ></div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="overflow-hidden">
          <p
            className={cn(
              "name-text flex leading-none tracking-tighter opacity-0", // opacity-0 prevents FOUC
              anton.className
            )}
            style={{
              fontSize: textSize,
              color: textColor,
              fontWeight: "400",
              fontFeatureSettings: "normal",
              fontVariationSettings: "normal",
              textTransform: "uppercase",
              zIndex: 10, // Ensures text sits strictly on top
              position: "relative"
            }}
          >
            {text.split("").map((char, index) => (
              <span key={index} className="inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevealLoader;
