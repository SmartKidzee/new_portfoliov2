"use client";

import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────
   Individual Timeline Card
   - Desktop: alternates left/right of a center spine
   - Mobile: always to the right of a left-aligned spine
   ───────────────────────────────────────────────────────── */
function TimelineItem({
  item,
  index,
  total,
}: {
  item: TimelineEntry;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px -60px 0px" });
  const isEven = index % 2 === 0; // left side on desktop
  const isLast = index === total - 1;

  return (
    <div
      ref={ref}
      className={cn(
        "timeline-item relative grid w-full gap-x-6 md:gap-x-10",
        /* Mobile: icon-col + content | Desktop: left-content + icon-col + right-content */
        "grid-cols-[40px_1fr] md:grid-cols-[1fr_56px_1fr]",
        !isLast && "pb-10 sm:pb-12 md:pb-16"
      )}
    >
      {/* ── Desktop Left Column ── */}
      <div
        className={cn(
          "hidden md:flex items-start pt-1",
          isEven ? "justify-end" : "justify-end"
        )}
      >
        {isEven ? (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
            className="w-full max-w-[460px]"
          >
            <TimelineCard item={item} index={index} align="right" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="flex h-full w-full max-w-[460px] items-start justify-end pt-2"
          >
            <YearBadge year={item.title} index={index} />
          </motion.div>
        )}
      </div>

      {/* ── Center Spine Node (both mobile & desktop) ── */}
      <div className="relative flex flex-col items-center">
        {/* Vertical line ABOVE the dot */}
        {index > 0 && (
          <div className="absolute bottom-[calc(100%-2px)] left-1/2 w-px -translate-x-1/2 h-full bg-gradient-to-b from-transparent via-white/[0.07] to-white/[0.12]" />
        )}

        {/* Glowing dot */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.05,
          }}
          className="relative z-10 mt-1.5"
        >
          <span className="absolute -inset-2 rounded-full bg-[#89AACC]/20 blur-md" />
          <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#89AACC]/60 bg-[#0B0F19] shadow-[0_0_12px_rgba(137,170,204,0.5)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#89AACC]" />
          </span>
        </motion.div>

        {/* Vertical line BELOW the dot */}
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-transparent" />
        )}
      </div>

      {/* ── Desktop Right Column ── */}
      <div
        className={cn(
          "hidden md:flex items-start pt-1",
          !isEven ? "justify-start" : "justify-start"
        )}
      >
        {!isEven ? (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
            className="w-full max-w-[460px]"
          >
            <TimelineCard item={item} index={index} align="left" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="flex h-full w-full max-w-[460px] items-start pt-2"
          >
            <YearBadge year={item.title} index={index} />
          </motion.div>
        )}
      </div>

      {/* ── Mobile Content (always right of spine) ── */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mb-3"
        >
          <YearBadge year={item.title} index={index} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        >
          <TimelineCard item={item} index={index} align="left" />
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Year Badge — the prominent year label
   ───────────────────────────────────────────────────────── */
function YearBadge({ year, index }: { year: string; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/60 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="bg-[linear-gradient(180deg,#f7fbff_0%,#dbeaf8_40%,#9fc3e7_75%,#83add7_100%)] bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl md:text-4xl leading-none">
        {year}
      </h3>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TimelineCard — glassmorphic content card
   ───────────────────────────────────────────────────────── */
function TimelineCard({
  item,
  index,
  align,
}: {
  item: TimelineEntry;
  index: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.08),transparent_50%),linear-gradient(180deg,rgba(8,12,20,0.92)_0%,rgba(4,7,12,0.96)_100%)] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.18)] transition-all duration-500 hover:border-[#89AACC]/25 hover:shadow-[0_12px_50px_rgba(0,0,0,0.28)] sm:p-5 md:rounded-[26px]",
        /* Subtle pointer arrow towards the spine on desktop */
        align === "right" ? "md:mr-0" : "md:ml-0"
      )}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:rounded-[26px]">
        <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_50%_0%,rgba(137,170,204,0.12),transparent_60%)] md:rounded-[26px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {item.content}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Timeline Container — the main exported component
   ───────────────────────────────────────────────────────── */
export const Timeline = ({
  data,
  className,
}: {
  data: TimelineEntry[];
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateHeight = () => setHeight(node.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.02], [0, 1]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Animated progress line — follows the center spine on desktop, left spine on mobile */}
      <div
        style={{ height: height + "px" }}
        className="pointer-events-none absolute top-0 left-[19px] md:left-1/2 md:-translate-x-1/2 w-px overflow-hidden z-0"
      >
        {/* Background track */}
        <div className="absolute inset-0 w-full bg-white/[0.04] [mask-image:linear-gradient(to_bottom,transparent_0%,black_4%,black_96%,transparent_100%)]" />
        {/* Animated glow fill */}
        <motion.div
          style={{
            height: heightTransform,
            opacity: opacityTransform,
          }}
          className="absolute inset-x-0 top-0 w-full rounded-full bg-[linear-gradient(to_bottom,rgba(137,170,204,0)_0%,rgba(137,170,204,0.5)_15%,rgba(14,165,233,0.8)_50%,rgba(14,165,233,0.6)_80%,rgba(14,165,233,0)_100%)] shadow-[0_0_12px_rgba(14,165,233,0.4)]"
        />
      </div>

      {/* Timeline entries */}
      <div className="relative z-10">
        {data.map((item, index) => (
          <TimelineItem
            key={index}
            item={item}
            index={index}
            total={data.length}
          />
        ))}
      </div>
    </div>
  );
};