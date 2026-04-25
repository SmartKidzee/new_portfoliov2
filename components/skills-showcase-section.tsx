"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaBrain,
  FaCode,
  FaCodeBranch,
  FaCubes,
  FaDatabase,
  FaDiagramProject,
  FaLayerGroup,
  FaMobileScreenButton,
  FaNetworkWired,
  FaPalette,
  FaRobot,
  FaServer,
  FaSquareRootVariable,
  FaWandMagicSparkles,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import {
  SiAnthropic,
  SiC,
  SiCplusplus,
  SiDocker,
  SiFigma,
  SiFirebase,
  SiGithub,
  SiGoogle,
  SiOpenai,
  SiPython,
  SiReact,
  SiSupabase,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

import type { SkillShowcaseCategory, SkillShowcaseSkill } from "@/lib/skill-radar";
import { LiquidMetalButton } from "@/components/ui/liquid-metal";

import styles from "./skills-showcase-section.module.css";

type SkillsShowcaseSectionProps = {
  skillCategories: SkillShowcaseCategory[];
};

const progressEase = [0.22, 1, 0.36, 1] as const;

const iconMap: Record<string, IconType> = {
  anthropic: SiAnthropic,
  binary: FaCodeBranch,
  blocks: FaCubes,
  bot: FaRobot,
  boxes: FaCubes,
  brain: FaBrain,
  "brain-circuit": FaBrain,
  c: SiC,
  "code-2": FaCode,
  cplusplus: SiCplusplus,
  database: FaDatabase,
  "database-zap": FaDatabase,
  docker: SiDocker,
  figma: SiFigma,
  firebase: SiFirebase,
  github: SiGithub,
  google: SiGoogle,
  "layers-3": FaLayerGroup,
  "monitor-smartphone": FaMobileScreenButton,
  network: FaNetworkWired,
  openai: SiOpenai,
  oracle: FaServer,
  palette: FaPalette,
  python: SiPython,
  react: SiReact,
  "server-cog": FaServer,
  sigma: FaSquareRootVariable,
  sparkles: FaWandMagicSparkles,
  stars: FaWandMagicSparkles,
  supabase: SiSupabase,
  typescript: SiTypescript,
  vercel: SiVercel,
  workflow: FaDiagramProject,
};

function getTopSkill(category: SkillShowcaseCategory | undefined) {
  if (!category) {
    return null;
  }

  return [...category.skills].sort((left, right) => right.progress - left.progress)[0] ?? null;
}

function SkillLogo({
  iconKey,
  className,
}: {
  iconKey: string;
  className?: string;
}) {
  const Icon = iconMap[iconKey] ?? FaCode;
  return <Icon className={className} aria-hidden="true" />;
}

function CircularSkillProgress({
  iconKey,
  progress,
  delay = 0,
}: {
  iconKey: string;
  progress: number;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const radius = 26;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.ringWrap} aria-hidden="true">
      <svg className={styles.ringSvg} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          className={styles.ringTrack}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={stroke}
        />
        <motion.circle
          className={styles.ringFill}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: shouldReduceMotion ? strokeDashoffset : circumference }}
          animate={{ strokeDashoffset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 1.05,
                  delay,
                  ease: progressEase,
                }
          }
        />
      </svg>
      <motion.div
        className={styles.ringIconWrap}
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.65,
                delay: delay + 0.08,
                ease: progressEase,
              }
        }
      >
        <span className="text-[10px] font-bold tracking-wider text-white/90">{progress}%</span>
      </motion.div>
    </div>
  );
}

function AnimatedProgressValue({
  progress,
  className,
  delay = 0,
}: {
  progress: number;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const progressRef = useRef(shouldReduceMotion ? progress : 0);
  const [displayProgress, setDisplayProgress] = useState(progressRef.current);

  useEffect(() => {
    if (shouldReduceMotion) {
      progressRef.current = progress;
      setDisplayProgress(progress);
      return;
    }

    const controls = animate(progressRef.current, progress, {
      duration: 1.05,
      delay,
      ease: progressEase,
      onUpdate: (latest) => {
        progressRef.current = latest;
        setDisplayProgress(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [delay, progress, shouldReduceMotion]);

  return <span className={className}>{displayProgress}%</span>;
}

function HorizontalSkillProgress({ progress, delay = 0 }: { progress: number; delay?: number }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className={styles.horizontalBarWrap}>
      <div className={styles.horizontalBarTrack} />
      <motion.div
        className={styles.horizontalBarFill}
        initial={{ width: shouldReduceMotion ? `${progress}%` : "0%" }}
        animate={{ width: `${progress}%` }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.05, delay, ease: progressEase }}
      />
    </div>
  );
}

export function SkillsShowcaseSection({ skillCategories }: SkillsShowcaseSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(skillCategories[0]?.id ?? "");
  const activeCategory = useMemo(
    () => skillCategories.find((category) => category.id === activeCategoryId) ?? skillCategories[0],
    [activeCategoryId, skillCategories],
  );
  const [activeSkillSlug, setActiveSkillSlug] = useState(getTopSkill(activeCategory)?.slug ?? "");

  useEffect(() => {
    const fallbackCategoryId = skillCategories[0]?.id ?? "";
    const nextCategoryId = skillCategories.some((category) => category.id === activeCategoryId)
      ? activeCategoryId
      : fallbackCategoryId;

    if (nextCategoryId !== activeCategoryId) {
      setActiveCategoryId(nextCategoryId);
    }
  }, [activeCategoryId, skillCategories]);

  useEffect(() => {
    const nextTopSkill = getTopSkill(activeCategory);

    if (!nextTopSkill) {
      setActiveSkillSlug("");
      return;
    }

    setActiveSkillSlug((current) =>
      activeCategory?.skills.some((skill) => skill.slug === current) ? current : nextTopSkill.slug,
    );
  }, [activeCategory]);

  const activeSkill =
    activeCategory?.skills.find((skill) => skill.slug === activeSkillSlug) ?? getTopSkill(activeCategory);
  const sortedSkills = useMemo(
    () => [...(activeCategory?.skills ?? [])].sort((left, right) => right.progress - left.progress),
    [activeCategory],
  );

  const [currentSkillPage, setCurrentSkillPage] = useState(0);

  useEffect(() => {
    setCurrentSkillPage(0);
  }, [activeCategoryId]);

  const chunkedSkills = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < sortedSkills.length; i += 5) {
      chunks.push(sortedSkills.slice(i, i + 5));
    }
    return chunks;
  }, [sortedSkills]);

  const maxPage = Math.max(0, chunkedSkills.length - 1);

  const paginate = (direction: number) => {
    setCurrentSkillPage((prev) => Math.max(0, Math.min(prev + direction, maxPage)));
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 50;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      paginate(-1);
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      paginate(1);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.categoryRail} role="tablist" aria-label="Skill categories">
        {skillCategories.map((category) => {
          const isActive = category.id === activeCategory?.id;

          return (
            <LiquidMetalButton
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              borderWidth={1}
              className="w-full"
              labelClassName="w-full"
              metalConfig={
                isActive
                  ? {
                      colorBack: "#1a2c42",
                      colorTint: "#2b4b7c",
                      speed: 0.25,
                      repetition: 4,
                      distortion: 0.1,
                      scale: 1,
                    }
                  : {
                      colorBack: "#030509",
                      colorTint: "#05070d",
                      speed: 0.1,
                      repetition: 2,
                      distortion: 0.05,
                      scale: 1,
                    }
              }
              innerClassName={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ""}`}
              onClick={() => setActiveCategoryId(category.id)}
            >
              <span className="flex w-full items-center justify-between gap-4">
                <span className={styles.categoryTitle}>{category.title}</span>
                <span className={styles.categoryProgress}>{category.progress}%</span>
              </span>
            </LiquidMetalButton>
          );
        })}
      </div>

      <div className={styles.layout}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
          className={styles.detailCard}
        >
          <div className={styles.detailHeader}>
            <div>
              <span className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-white/50 mb-4 font-semibold">
                <FaWandMagicSparkles className="h-3 w-3" /> CATEGORY
              </span>
            </div>
            <CircularSkillProgress
              iconKey={activeSkill?.iconKey ?? "code-2"}
              progress={activeCategory?.progress ?? 0}
              delay={0.04}
            />
          </div>

          <div className={styles.detailBody}>
            <div className={styles.detailCopy}>
              <h3 className={styles.detailTitle}>{activeCategory?.title}</h3>
              <p className={styles.selectedSkillSummary}>{activeCategory?.description}</p>
              <div className={styles.detailMeta}>
                <span className={styles.detailMetaChip}>{activeCategory?.skills.length ?? 0} skills</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          viewport={{ once: true, margin: "-80px" }}
          className={styles.skillsCard}
        >
          <div className={styles.gridHeader}>
            <span className={styles.gridLabel}>{activeCategory?.title}</span>
            <div className="flex items-center gap-2">
              <span className={styles.gridCount}>{sortedSkills.length}</span>
              {maxPage > 0 && (
                <div className="flex items-center gap-1 ml-2">
                  <button 
                    onClick={() => paginate(-1)} 
                    disabled={currentSkillPage === 0} 
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
                    aria-label="Previous skills"
                  >
                    <FaChevronLeft className="h-3 w-3 text-white/70" />
                  </button>
                  <button 
                    onClick={() => paginate(1)} 
                    disabled={currentSkillPage === maxPage} 
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
                    aria-label="Next skills"
                  >
                    <FaChevronRight className="h-3 w-3 text-white/70" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden mt-4">
            <motion.div
              className="flex"
              animate={{ x: `-${currentSkillPage * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            >
              {chunkedSkills.map((chunk, pageIndex) => (
                <div key={pageIndex} className={`w-full shrink-0 flex flex-col gap-4 px-1 ${pageIndex !== currentSkillPage ? 'pointer-events-none' : ''}`}>
                  {chunk.map((skill, index) => {
                    const isActive = skill.slug === activeSkill?.slug;
                    const delay = index * 0.05;

                    return (
                      <button
                        key={skill.slug}
                        type="button"
                        className={`${styles.skillCard} ${isActive ? styles.skillCardActive : ""}`}
                        onClick={() => setActiveSkillSlug(skill.slug)}
                        title={skill.summary}
                        aria-label={`${skill.label}, ${skill.progress}%`}
                      >
                        <div className={styles.skillTopRow}>
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10">
                            <SkillLogo iconKey={skill.iconKey} className="h-4 w-4 text-white/70" />
                          </div>
                        </div>
                        <div className={styles.skillBody}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className={styles.skillTitle} style={{ marginBottom: 0 }}>
                              {skill.label}
                            </h4>
                            <span className="text-[11px] font-bold tracking-wider text-white/70">{skill.progress}%</span>
                          </div>
                          <HorizontalSkillProgress progress={skill.progress} delay={delay} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
