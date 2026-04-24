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
        <SkillLogo iconKey={iconKey} className={styles.ringIcon} />
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
              className="w-full"
              size="sm"
              borderWidth={2}
              metalConfig={
                isActive
                  ? {
                      colorBack: "#8eafd1",
                      colorTint: "#ffffff",
                      speed: 0.32,
                      repetition: 5,
                      distortion: 0.14,
                      scale: 1,
                    }
                  : {
                      colorBack: "#637a92",
                      colorTint: "#eef7ff",
                      speed: 0.28,
                      repetition: 4,
                      distortion: 0.1,
                      scale: 1,
                    }
              }
              innerClassName={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ""}`}
              labelClassName="w-full"
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
              <span className={styles.detailEyebrow}>{activeCategory?.label}</span>
              <h3 className={styles.detailTitle}>{activeCategory?.title}</h3>
            </div>
            <AnimatedProgressValue
              className={styles.detailScore}
              progress={activeSkill?.progress ?? activeCategory?.progress ?? 0}
              delay={0.08}
            />
          </div>

          <div className={styles.detailBody}>
            <CircularSkillProgress
              iconKey={activeSkill?.iconKey ?? "code-2"}
              progress={activeSkill?.progress ?? activeCategory?.progress ?? 0}
              delay={0.04}
            />
            <div className={styles.detailCopy}>
              <h4 className={styles.selectedSkillTitle}>{activeSkill?.label ?? activeCategory?.title}</h4>
              <p className={styles.selectedSkillSummary}>{activeSkill?.summary ?? activeCategory?.description}</p>
              <div className={styles.detailMeta}>
                <span className={styles.detailMetaChip}>{activeCategory?.skills.length ?? 0} skills</span>
                <span className={styles.detailMetaChip}>{activeCategory?.progress ?? 0}% avg</span>
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
            <span className={styles.gridCount}>{sortedSkills.length}</span>
          </div>

          <div className={styles.skillsGrid}>
            {sortedSkills.map((skill, index) => {
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
                    <CircularSkillProgress iconKey={skill.iconKey} progress={skill.progress} delay={delay} />
                    <AnimatedProgressValue className={styles.skillValue} progress={skill.progress} delay={delay} />
                  </div>
                  <div className={styles.skillBody}>
                    <h4 className={styles.skillTitle}>{skill.label}</h4>
                    <p className={styles.skillSummary}>{skill.summary}</p>
                  </div>
                  <span className={styles.skillTooltip} role="tooltip">
                    {skill.summary}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
