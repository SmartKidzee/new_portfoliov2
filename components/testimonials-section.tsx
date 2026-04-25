"use client";

import { Quote, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Quote chips extracted from the review ─── */
const chipsRow1 = [
  "Feedback was impressively accurate",
  "Tailored to specific job roles",
  "Helped build confidence",
];

const chipsRow2 = [
  "Pinpointed strengths & areas for improvement",
  "Interactive voice-based sessions",
  "Mimics real-life scenarios",
];

/* ─── Pure-CSS Infinite Marquee ─── */
function MarqueeRow({
  items,
  reverse = false,
  durationSec = 25,
}: {
  items: string[];
  reverse?: boolean;
  durationSec?: number;
}) {
  /* Render 3 copies so there's always enough content to fill the viewport */
  const repeated = [...items, ...items, ...items];

  return (
    <div className="testimonial-marquee-wrap">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[hsl(var(--bg))] to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[hsl(var(--bg))] to-transparent sm:w-20" />

      <div
        className={cn(
          "testimonial-marquee-track",
          reverse && "testimonial-marquee-track--reverse"
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {repeated.map((chip, i) => (
          <div key={i} className="testimonial-chip">
            <Quote className="h-3 w-3 shrink-0 text-[#89AACC]/50" />
            <span>{chip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Section ─── */
export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative scroll-mt-28 overflow-hidden bg-bg py-16 md:scroll-mt-32 md:py-24"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(137,170,204,0.06),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-10">
        {/* Section header */}
        <div className="mb-10 flex flex-col items-center text-center md:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            What people say
          </p>
          <h2 className="mt-3 font-display text-3xl italic text-text-primary md:text-4xl">
            Testimonials
          </h2>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-transparent via-[#89AACC]/50 to-transparent" />
        </div>

        {/* Testimonial card */}
        <div className="mx-auto max-w-2xl">
          <div className="relative rounded-[24px] border border-white/8 bg-surface/40 p-6 backdrop-blur-sm sm:p-8">
            <div className="absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#89AACC]/40 to-transparent" />

            <Quote className="mb-4 h-7 w-7 text-[#89AACC]/20" />

            <blockquote className="text-sm leading-7 text-white/70 sm:text-[15px] sm:leading-8">
              &ldquo;I gave it a quick try, not expecting much, but the feedback
              was impressively accurate. It pinpointed both my strengths and
              areas for improvement.&rdquo;
            </blockquote>

            <p className="mt-3 text-sm italic text-[#89AACC]/70">
              — on Talk2Job
            </p>

            {/* Author row */}
            <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#89AACC]/20 to-[#4e85bf]/20 text-xs font-semibold text-[#89AACC]">
                  AB
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Abdiker Boya
                  </p>
                  <p className="text-[11px] text-muted">
                    Founder & CEO at Memoji
                  </p>
                </div>
              </div>

              <a
                href="https://www.linkedin.com/feed/update/urn:li:ugcPost:7320737874964897793/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5",
                  "text-[11px] tracking-wide text-muted transition-colors duration-200 hover:border-white/16 hover:text-text-primary"
                )}
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">View post</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee chips — pure CSS infinite scroll */}
      <div className="relative z-10 mt-10 flex flex-col gap-3 md:mt-14">
        <MarqueeRow items={chipsRow1} durationSec={22} />
        <MarqueeRow items={chipsRow2} reverse durationSec={28} />
      </div>
    </section>
  );
}
