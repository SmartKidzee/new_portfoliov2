"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { ArrowUpRight, Calendar, Flame, Trophy } from "lucide-react";
import { SiLeetcode } from "react-icons/si";

import { LiquidMetalLink } from "@/components/ui/liquid-metal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type LeetcodeStats = {
  status: string;
  username: string;
  ranking: number;
  reputation: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  totalActiveDays: number;
  submissionCalendar: Record<string, number>;
};

type CellData = {
  date: Date;
  count: number;
  level: number;
  weekIndex: number;
  dayOfWeek: number;
};

type TooltipInfo = {
  date: Date;
  count: number;
  x: number;
  y: number;
} | null;

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const defaultMetalConfig = {
  colorBack: "#6f839a",
  colorTint: "#f7fbff",
  speed: 0.34,
  repetition: 4,
  distortion: 0.12,
  scale: 1,
};

const initialFallback: LeetcodeStats = {
  status: "fallback",
  username: "SmartKidzee",
  ranking: 3472771,
  reputation: 0,
  totalSolved: 32,
  easySolved: 24,
  mediumSolved: 7,
  hardSolved: 1,
  streak: 6,
  totalActiveDays: 14,
  submissionCalendar: {},
};

/* ── Green color scale for dark backgrounds ── */
const HEAT_COLORS = [
  "rgba(255, 255, 255, 0.05)",  // 0 — empty
  "#14532d",                     // 1 — dark green
  "#166534",                     // 2 — medium green
  "#22c55e",                     // 3 — bright green
  "#4ade80",                     // 4 — vivid green
] as const;

const HEAT_GLOWS = [
  "none",
  "0 0 4px rgba(20,83,45,0.5)",
  "0 0 6px rgba(22,101,52,0.6)",
  "0 0 8px rgba(34,197,94,0.5)",
  "0 0 12px rgba(74,222,128,0.5), 0 0 24px rgba(74,222,128,0.15)",
] as const;

function getHeatLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ------------------------------------------------------------------ */
/*  Build heatmap data from submission calendar                       */
/* ------------------------------------------------------------------ */
function useHeatmapData(submissionCalendar: Record<string, number>) {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() + 1);

    /* Align start to Sunday */
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const cells: CellData[] = [];
    const current = new Date(startDate);
    let weekIndex = 0;

    while (current <= today) {
      const utcMidnight = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
      const ts = Math.floor(utcMidnight / 1000).toString();
      const count = submissionCalendar[ts] || 0;

      cells.push({
        date: new Date(current),
        count,
        level: getHeatLevel(count),
        weekIndex,
        dayOfWeek: current.getDay(),
      });

      if (current.getDay() === 6) weekIndex++;
      current.setDate(current.getDate() + 1);
    }

    /* Month labels on the first Sunday of each new month */
    const monthLabels: { text: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    for (const c of cells) {
      if (c.dayOfWeek === 0 && c.date.getMonth() !== lastMonth) {
        monthLabels.push({ text: MONTHS[c.date.getMonth()], weekIdx: c.weekIndex });
        lastMonth = c.date.getMonth();
      }
    }

    return { cells, monthLabels, totalWeeks: weekIndex + 1 };
  }, [submissionCalendar]);
}

/* ------------------------------------------------------------------ */
/*  Animated Heatmap with scan-line sweep reveal                       */
/* ------------------------------------------------------------------ */
const MIN_CELL = 10;
const GAP = 3;
const DAY_W = 34;
const MONTH_H = 22;
const SWEEP_MS = 1800;

function SubmissionHeatmap({ submissionCalendar }: { submissionCalendar: Record<string, number> }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sentinelRef, { once: true, margin: "-40px" });
  const [tooltip, setTooltip] = useState<TooltipInfo>(null);
  const [cellSize, setCellSize] = useState(13);
  const [scrollable, setScrollable] = useState(false);
  const { cells, monthLabels, totalWeeks } = useHeatmapData(submissionCalendar);

  /* Dynamically size cells to fill container */
  useEffect(() => {
    function measure() {
      if (!outerRef.current || totalWeeks === 0) return;
      const availW = outerRef.current.clientWidth - DAY_W;
      const idealCell = Math.floor((availW + GAP) / totalWeeks - GAP);
      const clamped = Math.max(MIN_CELL, idealCell);
      const actualGridW = totalWeeks * (clamped + GAP) - GAP;
      setCellSize(clamped);
      setScrollable(actualGridW > availW + 2);
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (outerRef.current) observer.observe(outerRef.current);
    return () => observer.disconnect();
  }, [totalWeeks]);

  const step = cellSize + GAP;
  const gridW = totalWeeks * step - GAP;
  const colDelay = totalWeeks > 0 ? SWEEP_MS / totalWeeks : 30;

  const handleMouseEnter = useCallback(
    (cell: CellData, e: React.MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const scrollEl = outerRef.current;
      if (!scrollEl) return;
      const parentRect = scrollEl.getBoundingClientRect();
      const cellRect = el.getBoundingClientRect();
      setTooltip({
        date: cell.date,
        count: cell.count,
        x: cellRect.left - parentRect.left + scrollEl.scrollLeft + cellRect.width / 2,
        y: cellRect.top - parentRect.top - 4,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="relative">
      {/* Sentinel for scroll-trigger */}
      <div ref={sentinelRef} className="pointer-events-none absolute left-0 top-1/3 h-1 w-1" aria-hidden />

      <div
        ref={outerRef}
        className={`relative overflow-y-visible py-2 ${scrollable ? "hm-scroll overflow-x-auto" : "overflow-x-hidden"}`}
      >
        <div style={{ minWidth: scrollable ? DAY_W + gridW : undefined, position: "relative" }}>
          {/* ── Sweep scan-line ── */}
          {isInView && (
            <div
              className="hm-sweep-line"
              style={{
                animationDuration: `${SWEEP_MS}ms`,
                top: MONTH_H,
                bottom: 0,
                left: DAY_W,
              }}
            />
          )}

          {/* ── Tooltip ── */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-50 rounded-lg border border-white/15 bg-[#0a0f1c]/95 px-3 py-1.5 text-[11px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              <span className="font-semibold text-white">
                {tooltip.count} submission{tooltip.count !== 1 ? "s" : ""}
              </span>
              <span className="ml-1.5 text-white/45">
                on{" "}
                {tooltip.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* ── Month labels ── */}
          {monthLabels.map((m, i) => (
            <span
              key={`${m.text}-${i}`}
              className="absolute select-none text-[10px] text-white/45"
              style={{ left: DAY_W + m.weekIdx * step, top: 0 }}
            >
              {m.text}
            </span>
          ))}

          {/* ── Day labels + Cell grid ── */}
          <div className="flex" style={{ paddingTop: MONTH_H }}>
            {/* Day-of-week labels */}
            <div className="flex shrink-0 flex-col" style={{ width: DAY_W, height: 7 * step - GAP }}>
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span
                  key={i}
                  className="select-none text-[10px] text-white/40"
                  style={{
                    height: cellSize,
                    lineHeight: `${cellSize}px`,
                    marginBottom: i < 6 ? GAP : 0,
                    visibility: d ? "visible" : "hidden",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Cell grid — CSS Grid, column-first flow, dynamic cell size */}
            <div
              className={scrollable ? "" : "flex-1"}
              style={{
                display: "grid",
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
                gridAutoFlow: "column",
                gridAutoColumns: `${cellSize}px`,
                gap: `${GAP}px`,
              }}
            >
              {cells.map((cell) => {
                const delay = cell.weekIndex * colDelay;
                return (
                  <div
                    key={cell.date.toISOString()}
                    className={[
                      "hm-cell rounded-[3px]",
                      isInView ? "hm-cell-visible" : "",
                      cell.level > 0 && isInView ? "hm-cell-active" : "",
                      cell.level >= 4 && isInView ? "hm-cell-peak" : "",
                    ].join(" ")}
                    style={
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: HEAT_COLORS[cell.level],
                        boxShadow: isInView ? HEAT_GLOWS[cell.level] : "none",
                        "--hm-delay": `${Math.round(delay)}ms`,
                        transitionDelay: "var(--hm-delay)",
                        animationDelay: `${Math.round(delay + 500)}ms`,
                      } as React.CSSProperties
                    }
                    onMouseEnter={(e) => handleMouseEnter(cell, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function HeatmapSkeleton() {
  return (
    <div className="flex flex-col gap-[3px] py-4" style={{ paddingLeft: DAY_W }}>
      {Array.from({ length: 7 }).map((_, row) => (
        <div key={row} className="flex gap-[3px]">
          {Array.from({ length: 40 }).map((_, col) => (
            <div
              key={col}
              className="h-[13px] w-[13px] animate-pulse rounded-[3px] bg-white/[0.04]"
              style={{ animationDelay: `${(row * 40 + col) * 6}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main LeetCode section                                              */
/* ------------------------------------------------------------------ */
export function LeetcodeSection({ username = "SmartKidzee" }: { username?: string }) {
  const [stats, setStats] = useState<LeetcodeStats>(initialFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch(`/api/leetcode?username=${username}`);
        if (!res.ok) throw new Error("Failed to fetch LeetCode data");
        const data = (await res.json()) as LeetcodeStats;
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [username]);

  const easyPct = stats.totalSolved > 0 ? (stats.easySolved / stats.totalSolved) * 100 : 0;
  const medPct = stats.totalSolved > 0 ? (stats.mediumSolved / stats.totalSolved) * 100 : 0;
  const hardPct = stats.totalSolved > 0 ? (stats.hardSolved / stats.totalSolved) * 100 : 0;

  return (
    <section id="leetcode" className="relative overflow-hidden py-16 md:py-24">
      {/* Ambient bg */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-emerald-500/6 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-[#89AACC]/10 blur-[120px]" />

      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* ── Header ── */}
        <motion.div
          className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-stroke" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted">Coding Activity</span>
            </div>
            <h2 className="text-3xl text-text-primary md:text-5xl">
              LeetCode <span className="font-display italic">Consistency</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
              Daily algorithmic problem-solving, data structure challenges, and continuous coding discipline.
            </p>
          </div>
          <LiquidMetalLink
            href={`https://leetcode.com/u/${username}/`}
            target="_blank"
            rel="noreferrer"
            size="sm"
            borderWidth={2}
            metalConfig={defaultMetalConfig}
            className="inline-flex self-start"
            icon={<ArrowUpRight className="h-3.5 w-3.5" />}
          >
            View LeetCode profile
          </LiquidMetalLink>
        </motion.div>

        {/* ── Stats cards ── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total Solved */}
          <motion.div
            className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-[#f89e1b]/40 hover:bg-white/[0.045]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-muted">Total Solved</span>
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#f89e1b]/25 bg-[#f89e1b]/10 text-[#f89e1b]">
                <SiLeetcode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl md:text-5xl italic text-text-primary">{stats.totalSolved}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted">problems</span>
            </div>
            <div className="mt-4 sm:mt-5 space-y-2">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div style={{ width: `${easyPct}%` }} className="bg-emerald-400" />
                <div style={{ width: `${medPct}%` }} className="bg-yellow-300" />
                <div style={{ width: `${hardPct}%` }} className="bg-rose-400" />
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="font-medium text-emerald-400">Easy {stats.easySolved}</span>
                <span className="font-medium text-yellow-300">Med {stats.mediumSolved}</span>
                <span className="font-medium text-rose-400">Hard {stats.hardSolved}</span>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-orange-400/40 hover:bg-white/[0.045]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-muted">Current Streak</span>
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-orange-400/25 bg-orange-400/10 text-orange-400">
                <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl md:text-5xl italic text-text-primary">{stats.streak}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-orange-300/80">days</span>
            </div>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted">Consistent daily coding sprint &amp; momentum</p>
          </motion.div>

          {/* Active Days */}
          <motion.div
            className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-[#89AACC]/40 hover:bg-white/[0.045]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-muted">Active Days</span>
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#89AACC]/25 bg-[#89AACC]/10 text-[#89AACC]">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl md:text-5xl italic text-text-primary">{stats.totalActiveDays}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted">days active</span>
            </div>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted">Logged submissions across active sessions</p>
          </motion.div>

          {/* Global Ranking */}
          <motion.div
            className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-yellow-400/40 hover:bg-white/[0.045]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-muted">Global Ranking</span>
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-yellow-400/25 bg-yellow-400/10 text-yellow-400">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl md:text-4xl italic text-text-primary">
                {stats.ranking > 0 ? `#${stats.ranking.toLocaleString()}` : "Active"}
              </span>
            </div>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted">Among competitive LeetCode programmers</p>
          </motion.div>
        </div>

        {/* ── Heatmap card ── */}
        <motion.div
          className="relative mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[#050810]/80 p-4 sm:p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Header with legend */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-text-primary">
                Submission Heatmap
              </h3>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] sm:text-xs text-white/45">
              <span>Less</span>
              <div className="flex items-center gap-[3px]">
                {HEAT_COLORS.map((c, i) => (
                  <span
                    key={i}
                    className="h-[10px] w-[10px] rounded-[3px]"
                    style={{ backgroundColor: c, boxShadow: i > 0 ? HEAT_GLOWS[i] : "none" }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Heatmap */}
          {loading ? <HeatmapSkeleton /> : <SubmissionHeatmap submissionCalendar={stats.submissionCalendar} />}
        </motion.div>
      </div>
    </section>
  );
}
