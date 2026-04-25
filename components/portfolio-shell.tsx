"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "./animated-counter";
import { BlogCarousel } from "./blog-carousel";
import gsap from "gsap";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HlsVideo } from "@/components/hls-video";
import { SkillsShowcaseSection } from "@/components/skills-showcase-section";
import { SiteLogo } from "@/components/site-logo";
import { LiquidMetalButton, LiquidMetalLink } from "@/components/ui/liquid-metal";
import { Timeline } from "@/components/ui/timeline";
import { TestimonialsSection } from "@/components/testimonials-section";
import { WarpBackground } from "@/components/ui/warp-background";
import type { PortfolioContent } from "@/lib/content";
import type { SkillShowcaseCategory } from "@/lib/skill-radar";
import type { BlogPost } from "@/supabase/client";

type PortfolioShellProps = {
  content: PortfolioContent;
  latestPosts: BlogPost[];
  skillCategories: SkillShowcaseCategory[];
  isInitialLoad?: boolean;
};

type NavSection = "home" | "work" | "skills" | "timeline" | "education" | "contact";

type SocialLink = {
  label: string;
  url: string;
};

type HeroStat = {
  value: number;
  label: string;
  caption?: string | null;
  prefix?: string;
  suffix?: string | null;
  decimals?: number;
  useGrouping?: boolean;
};

type ContactStatus =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const socialIconMap = (label: string) => {
  const value = label.toLowerCase();

  if (value.includes("form") || value.includes("mail")) {
    return Mail;
  }

  return ExternalLink;
};

const formatMetricLabel = (value: string) => value.replace(/_/g, " ").toUpperCase();
const formatEducationFocus = (value: string) =>
  value.replace(/^Bachelor of Engineering\s*-\s*BE,\s*/i, "");
const defaultMetalConfig = {
  colorBack: "#6f839a",
  colorTint: "#f7fbff",
  speed: 0.34,
  repetition: 4,
  distortion: 0.12,
  scale: 1,
};
const accentMetalConfig = {
  colorBack: "#86a9cc",
  colorTint: "#ffffff",
  speed: 0.32,
  repetition: 5,
  distortion: 0.14,
  scale: 1,
};

function SectionHeading({
  eyebrow,
  title,
  emphasis,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-2xl">
        <div className="mb-4 flex items-center gap-4">
          <span className="h-px w-8 bg-stroke" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted">{eyebrow}</span>
        </div>
        <h2 className="text-3xl text-text-primary md:text-5xl">
          {title} <span className="font-display italic">{emphasis}</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}

export function PortfolioShell({ content, latestPosts, skillCategories, isInitialLoad = false }: PortfolioShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const lastScrollYRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactStatus, setContactStatus] = useState<ContactStatus>({ type: "idle", message: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const profileName = content.metadata.personStructuredData.name.replace(/\s+J$/, "");

  const sections: { id: NavSection; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "work", label: "Work" },
    { id: "skills", label: "Skills" },
    { id: "timeline", label: "Timeline" },
    { id: "education", label: "Education" },
  ];
  const heroStats: HeroStat[] = content.stats.items
    .filter((item) => !item.label.toLowerCase().includes("github"))
    .slice(0, 4)
    .map((item) => ({
      value: item.value,
      label: item.label,
      caption: item.caption ?? null,
      prefix: "prefix" in item ? item.prefix ?? "" : "",
      suffix: item.suffix ?? "",
      decimals: "decimals" in item ? item.decimals ?? 0 : 0,
      useGrouping: "useGrouping" in item ? item.useGrouping ?? true : true,
    }));
  const primaryEducation = content.education.institutions[0];
  const primaryEducationFocus = primaryEducation ? formatEducationFocus(primaryEducation.credential) : null;
  const educationActivities = Array.from(
    new Set(
      content.education.institutions.flatMap((item) => item.activities).filter((activity) => activity.length > 0),
    ),
  ).slice(0, 6);
  const timelineEntries = content.timeline.entries.map((entry) => ({
    title: entry.year,
    content: (
      <>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#89AACC]/20 bg-[#89AACC]/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-[#bdd3ea]">
            {entry.phase}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-1">
          {[
            { label: "Belief", value: entry.belief },
            { label: "Learned", value: entry.learned },
            { label: "Change", value: entry.change },
          ].map((detail) => (
            <div
              key={`${entry.year}-${detail.label}`}
              className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3.5 sm:p-4"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#89AACC]/80">{detail.label}</p>
              <p className="mt-2 text-sm leading-6 text-text-primary/82">{detail.value}</p>
            </div>
          ))}
        </div>
      </>
    ),
  }));
  useEffect(() => {
    const interval = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % content.roles.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [content.roles.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const headerRevealLine = isMobile ? 118 : 148;
        const delta = currentY - lastScrollYRef.current;

        setIsScrolled(currentY > 20);

        const positions: { id: NavSection; top: number }[] = [
          { id: "home", top: document.getElementById("home")?.offsetTop ?? 0 },
          { id: "work", top: document.getElementById("work")?.offsetTop ?? 0 },
          { id: "skills", top: document.getElementById("skills")?.offsetTop ?? 0 },
          { id: "timeline", top: document.getElementById("timeline")?.offsetTop ?? 0 },
          { id: "education", top: document.getElementById("education")?.offsetTop ?? 0 },
          { id: "contact", top: document.getElementById("contact")?.offsetTop ?? 0 },
        ];

        const current = [...positions]
          .reverse()
          .find((section) => currentY + (isMobile ? 150 : 180) >= section.top);

        if (current) {
          setActiveSection(current.id);
        }

        if (currentY <= 24) {
          setIsHeaderVisible(true);
        } else if (Math.abs(delta) > 16) {
          if (delta > 0 && currentY > headerRevealLine) {
            setIsHeaderVisible(false);
            setIsMenuOpen(false);
          } else if (delta < -8) {
            setIsHeaderVisible(true);
          }
        }

        lastScrollYRef.current = currentY;
        ticking = false;
      });
    };

    lastScrollYRef.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!(isMobile && isMenuOpen)) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    // If the loader was played, delay the hero animations until the loader bars slide away.
    // This prevents the expensive blur() filters from tanking the frame rate during the loader outro.
    const delayOffset = isInitialLoad ? 1.4 : 0.1;

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".name-reveal",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.2, delay: delayOffset },
        )
        .fromTo(
          ".blur-in",
          { opacity: 0, filter: "blur(10px)", y: 20 },
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1, delay: delayOffset + 0.2 },
          0,
        );
    }, rootRef);

    return () => context.revert();
  }, [isInitialLoad]);

  const scrollToSection = (id: NavSection) => {
    const section = document.getElementById(id);

    if (!section) {
      return;
    }

    const headerOffset = isMobile ? 92 : 88;
    const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  const handleSectionLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    id: NavSection,
  ) => {
    event.preventDefault();
    setIsMenuOpen(false);
    setIsHeaderVisible(true);
    scrollToSection(id);
  };

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingContact) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      _gotcha: String(formData.get("_gotcha") ?? ""),
    };

    const errors: Record<string, string> = {};
    if (!payload.name || payload.name.length < 2) {
      errors.name = "Please enter your name.";
    }
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!payload.message || payload.message.length < 12) {
      errors.message = "Please enter a message with a bit more detail.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmittingContact(true);
    setContactStatus({ type: "idle", message: "" });
    setFormErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message right now. Please try again shortly.");
      }

      form.reset();
      setContactStatus({
        type: "success",
        message: result.message || content.contact.form.successMessage,
      });

      if (!payload._gotcha) {
        fetch("/api/contact")
          .then((res) => res.json())
          .then((web3Data) => {
            if (web3Data.key) {
              fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                  access_key: web3Data.key,
                  name: payload.name,
                  email: payload.email,
                  message: payload.message,
                  subject: `New portfolio contact from ${payload.name}`,
                  from_name: "Shreyas Cloud",
                  replyto: payload.email,
                  botcheck: false,
                }),
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }
    } catch (error) {
      setContactStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to send your message right now.",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const headerShown = isHeaderVisible || isMenuOpen;

  return (
    <div ref={rootRef} className="relative overflow-x-clip">
      <motion.main className="relative">
        <motion.header
          initial={false}
          animate={{
            y: headerShown ? 0 : -112,
            opacity: headerShown ? 1 : 0.88,
            scale: headerShown ? 1 : 0.985,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 28,
            mass: 0.92,
          }}
          className={`fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6 ${
            headerShown ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            className={`mx-auto flex w-full max-w-[860px] items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[#02040a]/98 px-3 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.42)] ring-1 ring-white/5 transition-shadow duration-300 supports-backdrop-filter:bg-[#02040a]/92 supports-backdrop-filter:backdrop-blur-xl md:w-auto md:max-w-fit md:gap-2 md:rounded-full md:px-2 md:py-2 ${
              isScrolled ? "shadow-md shadow-black/20" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsHeaderVisible(true);
                scrollToSection("home");
              }}
              className="rounded-full transition-transform duration-300 hover:scale-105"
              aria-label="Back to home"
            >
              <SiteLogo priority className="h-10 w-10 md:h-11 md:w-11" imageClassName="p-1.5" />
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => handleSectionLinkClick(event, section.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-stroke/60 text-text-primary"
                      : "text-muted hover:bg-stroke/40 hover:text-text-primary"
                  }`}
                >
                  {section.label}
                </a>
              ))}
              <Link
                href="/blogs"
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-stroke/40 hover:text-text-primary"
              >
                Blogs
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <LiquidMetalLink
                href="#contact"
                onClick={(event) => handleSectionLinkClick(event, "contact")}
                size="sm"
                borderWidth={2}
                metalConfig={defaultMetalConfig}
                className="hidden md:inline-flex"
                icon={<ArrowUpRight className="h-3.5 w-3.5" />}
              >
                Say hi
              </LiquidMetalLink>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/3 text-text-primary transition hover:border-white/20 hover:bg-white/6 md:hidden"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-site-nav"
                aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
                onClick={() => {
                  setIsHeaderVisible(true);
                  setIsMenuOpen((current) => !current);
                }}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="mx-auto mt-3 w-full max-w-[860px] md:hidden"
              >
                <nav
                  id="mobile-site-nav"
                  aria-label="Mobile navigation"
                  className="rounded-[26px] border border-white/10 bg-[#02040a] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/6"
                >
                  <div className="grid gap-2">
                    {sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(event) => handleSectionLinkClick(event, section.id)}
                        className={`rounded-[18px] border px-4 py-3 text-[15px] font-medium tracking-[0.02em] transition-colors ${
                          activeSection === section.id
                            ? "border-[#89AACC]/35 bg-[#89AACC]/10 text-text-primary"
                            : "border-white/8 bg-white/[0.035] text-text-primary/82 hover:border-white/14 hover:bg-white/6 hover:text-text-primary"
                        }`}
                      >
                        {section.label}
                      </a>
                    ))}
                    <Link
                      href="/blogs"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-[18px] border border-white/8 bg-white/[0.035] px-4 py-3 text-[15px] font-medium tracking-[0.02em] text-text-primary/82 transition-colors hover:border-white/14 hover:bg-white/6 hover:text-text-primary"
                    >
                      Blogs
                    </Link>
                    <div className="mt-2">
                      <LiquidMetalLink
                        href="#contact"
                        onClick={(event) => handleSectionLinkClick(event, "contact")}
                        size="sm"
                        borderWidth={2}
                        metalConfig={defaultMetalConfig}
                        className="w-full"
                        innerClassName="w-full justify-center"
                        icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                      >
                        Say hi
                      </LiquidMetalLink>
                    </div>
                  </div>
                </nav>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.header>

        <AnimatePresence>
          {isMenuOpen ? (
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
          ) : null}
        </AnimatePresence>

        <section
          id="home"
          ref={heroRef}
          className="relative flex min-h-screen items-center justify-start overflow-hidden scroll-mt-28 md:scroll-mt-32"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#030509]" />
            <HlsVideo className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(137,170,204,0.24),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(78,133,191,0.18),transparent_26%),linear-gradient(90deg,rgba(3,5,9,0.92)_0%,rgba(3,5,9,0.7)_40%,rgba(3,5,9,0.25)_72%,rgba(3,5,9,0.5)_100%)]" />
            <div className="grid-overlay absolute inset-0 opacity-40" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-bg to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-20 pt-28 text-left md:px-10 md:pb-24 md:pt-32 lg:px-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,420px)] lg:gap-14">
              <div className="order-2 max-w-2xl lg:order-1">
                <p className="blur-in mb-6 text-xs uppercase tracking-[0.3em] text-muted">Collection &#39;26</p>
                <h1 className="name-reveal mb-6 max-w-5xl font-display text-6xl italic leading-[0.9] tracking-tight text-text-primary md:text-8xl">
                  {profileName}
                </h1>
                <div className="blur-in mb-6 min-h-[96px] max-w-2xl md:min-h-[128px]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={content.roles[roleIndex]}
                      initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="text-2xl leading-tight text-text-primary/88 md:text-[2.2rem]"
                    >
                      <span className="font-display italic text-text-primary">{content.roles[roleIndex]}</span>
                    </motion.p>
                  </AnimatePresence>
                </div>
                <p className="blur-in max-w-xl text-sm leading-7 text-muted md:text-base">
                  {content.home.intro}
                </p>

                <div className="blur-in mt-10 inline-flex flex-wrap items-center gap-4">
                  <LiquidMetalButton
                    type="button"
                    onClick={() => scrollToSection("work")}
                    size="md"
                    borderWidth={2}
                    metalConfig={accentMetalConfig}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    See Works
                  </LiquidMetalButton>
                  <LiquidMetalButton
                    type="button"
                    onClick={() => scrollToSection("contact")}
                    size="md"
                    borderWidth={2}
                    metalConfig={defaultMetalConfig}
                    icon={<Mail className="h-4 w-4" />}
                  >
                    Reach out...
                  </LiquidMetalButton>
                </div>

                <div className="blur-in mt-8 flex flex-wrap items-center gap-3 text-[11px] tracking-[0.18em] text-text-primary/70">
                  {content.home.techStrip.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-surface/70 px-3 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="blur-in order-1 flex w-full justify-center lg:order-2 lg:justify-end">
                <div className="hero-photo-shell w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px]">
                  <div className="hero-photo-aura" />
                  <div className="hero-photo-backdrop" />
                  <div className="hero-photo-orbit" />
                  <div className="hero-photo-orbit hero-photo-orbit-delay" />
                  <WarpBackground
                    className="hero-photo-panel overflow-hidden rounded-[38px] border border-white/12 bg-[#05070d]/92 p-5 sm:p-6 shadow-[0_32px_90px_rgba(0,0,0,0.48)]"
                    perspective={220}
                    beamsPerSide={5}
                    beamSize={6}
                    beamDuration={7}
                    beamDelayMin={0.2}
                    beamDelayMax={2.6}
                    gridColor="rgba(137,170,204,0.2)"
                  >
                    <div className="hero-photo-sheen absolute inset-0" />
                    <div className="hero-photo-corner hero-photo-corner-top" />
                    <div className="hero-photo-corner hero-photo-corner-bottom" />
                    <div className="absolute inset-[2px] rounded-[34px] border border-white/10" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-[#07101a] sm:rounded-[30px]">
                      <Image
                        src="/hero_image.png"
                        alt={content.home.portrait.alt || profileName}
                        fill
                        priority
                        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 460px"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.18),transparent_40%),linear-gradient(180deg,rgba(4,7,12,0.02)_28%,rgba(4,7,12,0.24)_62%,rgba(4,7,12,0.88)_100%)]" />
                      <div className="hero-photo-scanline" />
                      <div className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/75">
                        <span className="h-2 w-2 rounded-full bg-[#89AACC]" />
                        Visual profile
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        {["AI Systems", "Next.js", "Full-Stack"].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </WarpBackground>
                </div>
              </div>
            </div>

            <div className="blur-in mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: index * 0.08, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-60px" }}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.18),transparent_42%),linear-gradient(180deg,rgba(6,10,16,0.96)_0%,rgba(3,6,10,0.98)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(137,170,204,0.16),transparent_48%)]" />
                    <div className="absolute inset-x-0 top-0 h-px accent-gradient" />
                  </div>

                  <div className="relative">
                    <p className="text-3xl text-text-primary md:text-[2.2rem]">
                      <AnimatedCounter
                        value={item.value}
                        decimals={item.decimals}
                        prefix={item.prefix}
                        suffix={item.suffix ?? ""}
                        useGrouping={item.useGrouping}
                      />
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted">{item.label}</p>
                    {item.caption ? (
                      <p className="mt-3 max-w-[24ch] text-sm leading-6 text-text-primary/72">{item.caption}</p>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center md:mt-10">
              <div className="flex flex-col items-center" aria-hidden="true">
                <span className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Scroll</span>
                <div className="relative h-10 w-px overflow-hidden bg-stroke">
                  <span className="animate-scroll-down absolute inset-x-0 top-0 h-4 accent-gradient" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="scroll-mt-28 bg-bg py-12 md:scroll-mt-32 md:py-16">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
            <SectionHeading
              eyebrow="Selected Work"
              title="Featured"
              emphasis="projects"
              description="A selection of projects and milestones shaped by shipping, learning in public, and building products with intent."
              action={
                <LiquidMetalLink
                  href={content.contact.socialLinks.find((link) => link.label === "GitHub")?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:inline-flex"
                  size="sm"
                  borderWidth={2}
                  metalConfig={defaultMetalConfig}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  View all work
                </LiquidMetalLink>
              }
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
              {content.featuredWorks.map((work, index) => (
                <article
                  key={work.id}
                  className={`group relative overflow-hidden rounded-[28px] border border-stroke bg-surface ${
                    index % 4 === 0 || index % 4 === 3 ? "md:col-span-7" : "md:col-span-5"
                  }`}
                >
                  <div className="relative aspect-[1.15/1] overflow-hidden">
                    {work.image ? (
                      <Image
                        src={work.image}
                        alt={work.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 58vw, 700px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`h-full w-full bg-linear-to-br ${work.accent}`} />
                    )}
                    <div className="halftone-overlay absolute inset-0 opacity-20 mix-blend-multiply" />
                    <div className={`absolute inset-0 bg-linear-to-br ${work.accent} opacity-65`} />
                    <div className="absolute inset-0 bg-bg/70 opacity-0 transition duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-black/25 backdrop-blur-0 transition duration-300 group-hover:backdrop-blur-lg" />
                  </div>

                  <div className="absolute left-5 top-5 flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/80">
                      {work.pillLabel}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {work.meta.map((item) => (
                        <span
                          key={`${work.id}-${item}`}
                          className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/75"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl text-white md:text-3xl">{work.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{work.description}</p>
                    <div className="mt-5">
                      <LiquidMetalLink
                        href={work.href}
                        target="_blank"
                        rel="noreferrer"
                        size="sm"
                        borderWidth={2}
                        metalConfig={accentMetalConfig}
                        icon={<ArrowUpRight className="h-4 w-4" />}
                      >
                        View {work.title}
                      </LiquidMetalLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-bg py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
            <SectionHeading
              eyebrow="Journal"
              title="Recent"
              emphasis="thoughts"
              description="Recent writing across education, shipping products, and the technology shaping how I learn and build."
              action={
                <LiquidMetalLink
                  href="/blogs"
                  className="hidden md:inline-flex"
                  size="sm"
                  borderWidth={2}
                  metalConfig={defaultMetalConfig}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  View all
                </LiquidMetalLink>
              }
            />

            <BlogCarousel posts={latestPosts} />
          </div>
        </section>

        <section id="skills" className="relative overflow-hidden scroll-mt-28 bg-bg py-16 md:scroll-mt-32 md:py-24">
          <div className="absolute inset-0 opacity-95">
            <div className="absolute left-[-8%] top-14 h-56 w-56 rounded-full bg-[#173050] blur-3xl md:h-80 md:w-80" />
            <div className="absolute right-[-4%] top-1/3 h-52 w-52 rounded-full bg-[#1a4f45] blur-3xl md:h-72 md:w-72" />
            <div className="absolute bottom-6 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#0d1a2b] blur-3xl md:h-64 md:w-64" />
            <div className="grid-overlay absolute inset-0 opacity-12" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
            <SectionHeading
              eyebrow="Capabilities"
              title="My"
              emphasis="Capabilities"
              description="A comprehensive overview of my technical expertise, creative tools, and strategic methodologies developed over years of shipping products in the AI-first era."
            />
            <SkillsShowcaseSection skillCategories={skillCategories} />
          </div>
        </section>

        <section id="timeline" className="relative scroll-mt-28 bg-bg py-16 md:scroll-mt-32 md:py-24">
          <div className="absolute inset-0 opacity-95">
            <div className="absolute left-[-6%] top-10 h-56 w-56 rounded-full bg-[#16304a] blur-3xl md:h-80 md:w-80" />
            <div className="absolute right-[-4%] top-1/4 h-48 w-48 rounded-full bg-[#1c4468] blur-3xl md:h-72 md:w-72" />
            <div className="absolute bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#0f1828] blur-3xl md:h-60 md:w-60" />
            <div className="grid-overlay absolute inset-0 opacity-10" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
            <SectionHeading
              eyebrow={content.timeline.title}
              title="Learning"
              emphasis="timeline"
              description={content.timeline.description}
            />

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,10,16,0.9)_0%,rgba(4,7,12,0.96)_100%)] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] md:p-6 lg:p-8">
              <div className="mb-8 flex flex-col gap-4 rounded-[26px] border border-white/8 bg-black/10 p-5 md:mb-10 md:flex-row md:items-end md:justify-between md:p-6">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Journey Overview</p>
                  <h3 className="mt-3 text-2xl text-text-primary md:text-3xl">{content.timeline.heading}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted md:text-base">
                    Each year sharpened how I think: from curiosity, to building, to designing systems and experiences
                    with real intent.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.22em] text-text-primary/80">
                  {["Curiosity to clarity", "Build and learn", "Systems and UX"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <Timeline data={timelineEntries} />
            </div>
          </div>
        </section>

        <section id="education" className="scroll-mt-28 bg-bg py-16 md:scroll-mt-32 md:py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
            <SectionHeading
              eyebrow={content.education.title}
              title="Academic"
              emphasis="foundation"
              description="The coursework, campus journey, and performance milestones shaping the systems, products, and experiments featured across this portfolio."
            />

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-stroke bg-surface p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Institutions</p>
                <div className="mt-6 space-y-6">
                  {content.education.institutions.map((item) => (
                    <div key={item.institution} className="rounded-[26px] border border-white/5 bg-black/10 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl text-text-primary">{item.institution}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted">{item.credential}</p>
                        </div>
                        <span className="rounded-full border border-stroke px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted">
                          {item.period ?? "Completed"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {Object.entries(item.metrics).map(([key, value]) => (
                          <span
                            key={`${item.institution}-${key}`}
                            className="rounded-full bg-stroke/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-primary"
                          >
                            {formatMetricLabel(key)}: {value}
                          </span>
                        ))}
                        {item.activities.map((activity) => (
                          <span
                            key={`${item.institution}-${activity}`}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[32px] border border-stroke bg-surface p-6 md:p-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Current Focus</p>
                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#89AACC]">Current Track</p>
                      <h3 className="mt-3 text-2xl text-text-primary">
                        {primaryEducationFocus ?? primaryEducation?.credential}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        Focused on core CS, applied AI, and product-building work that carries straight into the
                        projects and experiments shipped across this portfolio.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-black/10 p-5">
                      <div className="flex items-center gap-3 text-sm text-text-primary">
                        <Clock3 className="h-4 w-4 text-[#89AACC]" />
                        <span>{primaryEducation?.period ?? "In progress"}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {primaryEducation
                          ? Object.entries(primaryEducation.metrics).map(([key, value]) => (
                              <span
                                key={`primary-${key}`}
                                className="rounded-full bg-stroke/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-primary"
                              >
                                {formatMetricLabel(key)}: {value}
                              </span>
                            ))
                          : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-stroke bg-surface p-6 md:p-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Campus Highlights</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {educationActivities.length > 0 ? (
                      educationActivities.map((activity) => (
                        <span
                          key={activity}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-text-primary"
                        >
                          {activity}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-text-primary">
                        Independent learning
                      </span>
                    )}
                  </div>
                  <div className="mt-6 rounded-[24px] border border-white/8 bg-black/10 p-5">
                    <div className="flex items-center gap-3 text-sm text-text-primary">
                      <MapPin className="h-4 w-4 text-[#89AACC]" />
                      <span>Mysuru, India</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      Campus learning stays tightly connected to systems thinking, hands-on product work, and the AI
                      ideas I keep testing in public.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <TestimonialsSection />

        <section
          id="contact"
          className="relative overflow-hidden scroll-mt-28 bg-bg pb-8 pt-16 md:scroll-mt-32 md:pb-12 md:pt-20"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(137,170,204,0.2),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(78,133,191,0.18),transparent_22%),linear-gradient(180deg,rgba(7,10,16,0.9)_0%,rgba(7,10,16,0.98)_100%)]" />
            <div className="grid-overlay absolute inset-0 opacity-20" />
          </div>

          <div className="relative z-10 overflow-hidden border-y border-white/10 py-4">
            <div className="whitespace-nowrap font-display text-4xl italic text-text-primary/80 md:text-6xl">
              <div className="animate-[marquee_40s_linear_infinite]">
                {Array.from({ length: 10 }, () => "BUILDING THE FUTURE / ").join("")}
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-12 md:px-10 lg:px-16">
            <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#05070d]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Contact</p>
                <h2 className="mt-4 text-4xl text-text-primary md:text-6xl">
                  Let&#39;s build something <span className="font-display italic">meaningful</span>
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-muted md:text-base">
                  {content.contact.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <LiquidMetalLink
                    href={content.contact.socialLinks.find((link) => link.label === "LinkedIn")?.url}
                    target="_blank"
                    rel="noreferrer"
                    size="md"
                    borderWidth={2}
                    metalConfig={accentMetalConfig}
                    icon={<ArrowUpRight className="h-4 w-4" />}
                  >
                    Connect on LinkedIn
                  </LiquidMetalLink>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-muted">
                  {["Remote collaboration", "Fast replies", "AI-first builds"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <form
                id="contact-form"
                onSubmit={handleContactSubmit}
                noValidate
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#05070d]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:p-8"
              >
                <AnimatePresence>
                  {contactStatus.type === "success" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#05070d]/95 backdrop-blur-md"
                    >
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#89AACC]/10 border border-[#89AACC]/30 shadow-[0_0_60px_rgba(137,170,204,0.3)]"
                      >
                        <CheckCircle2 className="h-12 w-12 text-[#89AACC]" />
                      </motion.div>
                      <h3 className="text-2xl text-text-primary text-center px-4">Message sent successfully</h3>
                      <p className="mt-2 text-muted text-center px-6 max-w-sm">
                        {contactStatus.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => setContactStatus({ type: "idle", message: "" })}
                        className="mt-8 rounded-full border border-white/10 bg-white/5 py-2 px-6 text-sm text-text-primary transition hover:bg-white/10"
                      >
                        Send another
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`grid gap-4 transition-opacity duration-300 ${contactStatus.type === "success" ? "opacity-0" : "opacity-100"}`}>
                  <div
                    className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
                    aria-hidden="true"
                  >
                    <label htmlFor="contact-gotcha">Website</label>
                    <input
                      id="contact-gotcha"
                      type="text"
                      name="_gotcha"
                      tabIndex={-1}
                      autoComplete="new-password"
                      placeholder="Leave this field empty"
                    />
                  </div>

                  {content.contact.form.fields.map((field) => {
                    const error = formErrors[field.name];

                    return field.type === "textarea" ? (
                      <label key={field.name} className="grid gap-2 text-sm text-text-primary">
                        <span className="flex items-center justify-between">
                          {field.label}
                          {error && <span className="text-rose-400 text-xs animate-in fade-in slide-in-from-left-1">{error}</span>}
                        </span>
                        <textarea
                          name={field.name}
                          rows={field.rows ?? 5}
                          placeholder={field.placeholder}
                          maxLength={4000}
                          onChange={() => setFormErrors((prev) => ({ ...prev, [field.name]: "" }))}
                          className={`min-h-[140px] rounded-[24px] border bg-black/35 px-5 py-4 text-sm text-text-primary outline-hidden transition ${
                            error ? "border-rose-500/50 focus:border-rose-400" : "border-white/10 focus:border-[#89AACC]"
                          }`}
                        />
                      </label>
                    ) : (
                      <label key={field.name} className="grid gap-2 text-sm text-text-primary">
                        <span className="flex items-center justify-between">
                          {field.label}
                          {error && <span className="text-rose-400 text-xs animate-in fade-in slide-in-from-left-1">{error}</span>}
                        </span>
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          onChange={() => setFormErrors((prev) => ({ ...prev, [field.name]: "" }))}
                          className={`rounded-full border bg-black/35 px-5 py-4 text-sm text-text-primary outline-hidden transition ${
                            error ? "border-rose-500/50 focus:border-rose-400" : "border-white/10 focus:border-[#89AACC]"
                          }`}
                        />
                      </label>
                    );
                  })}

                  <LiquidMetalButton
                    type="submit"
                    disabled={isSubmittingContact}
                    size="md"
                    borderWidth={2}
                    metalConfig={accentMetalConfig}
                    className="mt-2"
                    icon={isSubmittingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  >
                    {isSubmittingContact ? "Sending..." : "Send message"}
                  </LiquidMetalButton>

                  <div className="grid gap-2 pt-1">
                    <AnimatePresence mode="wait">
                      {contactStatus.type === "error" ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          role="alert"
                          className="flex items-start gap-3 rounded-[20px] border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100 shadow-[0_8px_30px_rgba(244,63,94,0.12)] backdrop-blur-md"
                        >
                          <div className="mt-0.5 shrink-0">
                            <AlertCircle className="h-5 w-5 text-rose-400" />
                          </div>
                          <p>{contactStatus.message}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {content.contact.socialLinks.map((link: SocialLink, i: number) => {
                  const Icon = socialIconMap(link.label);

                  return (
                    <motion.a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm text-muted backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
                      {link.label}
                    </motion.a>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-sm text-text-primary">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                Available for projects
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
              <p>{content.footer.copyright}</p>
              <div className="flex flex-wrap gap-4">
                {content.footer.links.map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-text-primary">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
