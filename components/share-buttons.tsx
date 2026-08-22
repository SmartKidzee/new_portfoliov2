"use client";

import { motion } from "framer-motion";
import { Check, Link2 } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";

interface ShareButtonsProps {
  title: string;
  url: string;
  className?: string;
}

type SharePlatform = {
  name: string;
  color: string;
  Icon: IconType;
  getUrl: (title: string, url: string) => string;
};

const shareLinks: SharePlatform[] = [
  {
    name: "WhatsApp",
    color: "#25D366",
    Icon: FaWhatsapp,
    getUrl: (title, url) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${url}`)}`,
  },
  {
    name: "X",
    // X is deliberately light: a black brand mark disappears on this dark UI.
    color: "#F8FAFC",
    Icon: FaXTwitter,
    getUrl: (title, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this post: ${title} by @KidzeeSmart`)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    Icon: FaLinkedinIn,
    getUrl: (title, url) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "Facebook",
    color: "#1877F2",
    Icon: FaFacebookF,
    getUrl: (_title, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export function ShareButtons({ title, url, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const handleShare = (platform: SharePlatform) => {
    window.open(platform.getUrl(title, url), "_blank", "noopener,noreferrer,width=600,height=520");
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Share this article">
      {shareLinks.map(({ Icon, ...platform }, index) => (
        <motion.button
          key={platform.name}
          type="button"
          onClick={() => handleShare({ ...platform, Icon })}
          title={`Share on ${platform.name}`}
          aria-label={`Share on ${platform.name}`}
          style={{ "--share-color": platform.color } as CSSProperties}
          className="group relative flex h-10 w-10 items-center justify-center overflow-visible rounded-full border border-white/10 bg-white/[0.035] text-[var(--share-color)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition-[background-color,border-color,box-shadow,transform] duration-300 hover:border-[var(--share-color)] hover:bg-[color-mix(in_srgb,var(--share-color)_12%,transparent)] hover:shadow-[0_0_22px_color-mix(in_srgb,var(--share-color)_28%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--share-color)]"
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.045, duration: 0.28 }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[5deg]">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0d14] px-2 py-1 text-[10px] font-medium text-text-primary opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            {platform.name}
          </span>
        </motion.button>
      ))}

      <motion.button
        type="button"
        onClick={copyLink}
        title={copied ? "Link copied" : "Copy link"}
        aria-label={copied ? "Link copied" : "Copy link"}
        className="group relative flex h-10 w-10 items-center justify-center overflow-visible rounded-full border border-white/10 bg-white/[0.035] text-[#a8c5e2] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition-[background-color,border-color,box-shadow,transform] duration-300 hover:border-[#89AACC] hover:bg-[#89AACC]/10 hover:shadow-[0_0_22px_rgba(137,170,204,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89AACC]"
        whileHover={{ scale: 1.12, y: -2 }}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shareLinks.length * 0.045, duration: 0.28 }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[5deg]">
          {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        </span>
        <span className="pointer-events-none absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0d14] px-2 py-1 text-[10px] font-medium text-text-primary opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          {copied ? "Copied" : "Copy link"}
        </span>
      </motion.button>
    </div>
  );
}
