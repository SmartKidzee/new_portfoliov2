import Link from "next/link";
import { ArrowLeft, ChevronDown, Mail, ShieldCheck } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  title: string;
  badge: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  facts: Array<{
    label: string;
    value: string;
  }>;
  sections: LegalSection[];
  contactCardTitle: string;
  contactCardDescription: string;
  canonicalPath: "/privacy" | "/terms";
};

export function LegalPage({
  title,
  badge,
  description,
  effectiveDate,
  lastUpdated,
  facts,
  sections,
  contactCardTitle,
  contactCardDescription,
  canonicalPath,
}: LegalPageProps) {
  return (
    <div className="relative min-h-screen bg-[#04060a] font-sans text-text-primary antialiased selection:bg-[#89AACC]/30 selection:text-white">
      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(137,170,204,0.12),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(78,133,191,0.1),transparent_30%)]" />
        <div className="grid-overlay absolute inset-0 opacity-15" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1140px] px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
        {/* Navigation Header */}
        <header className="flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-[#070a12]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.3)] backdrop-blur-md sm:rounded-[24px] sm:p-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="group inline-flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90">
            <SiteLogo priority className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
            <div className="min-w-0">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#89AACC] sm:text-sm">
                Shreyas J
              </p>
              <p className="truncate font-sans text-xs text-muted sm:text-sm">Legal & Policies</p>
            </div>
          </Link>

          <nav aria-label="Legal navigation" className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 font-sans text-xs sm:text-sm">
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-muted transition hover:bg-white/5 hover:text-text-primary sm:flex-none sm:rounded-full sm:px-4 sm:py-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <Link
              href="/privacy"
              className={`flex-1 rounded-lg px-3 py-1.5 text-center font-medium transition sm:flex-none sm:rounded-full sm:px-4 sm:py-2 ${
                canonicalPath === "/privacy"
                  ? "border border-[#89AACC]/40 bg-[#89AACC]/20 text-[#89AACC]"
                  : "border border-transparent text-muted hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`flex-1 rounded-lg px-3 py-1.5 text-center font-medium transition sm:flex-none sm:rounded-full sm:px-4 sm:py-2 ${
                canonicalPath === "/terms"
                  ? "border border-[#89AACC]/40 bg-[#89AACC]/20 text-[#89AACC]"
                  : "border border-transparent text-muted hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              Terms of Use
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#070a12]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-md sm:rounded-[28px] sm:p-7 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/10 px-3.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#89AACC]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{badge}</span>
          </div>

          <h1 className="mt-4 break-words font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl font-sans text-sm leading-relaxed text-muted sm:text-base sm:leading-7">
            {description}
          </p>

          {/* Quick Facts Grid */}
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="min-w-0 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 sm:rounded-2xl sm:p-4"
              >
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89AACC] sm:text-[11px]">
                  {fact.label}
                </p>
                <p className="mt-1.5 break-words font-sans text-xs font-medium leading-5 text-text-primary sm:text-sm sm:leading-6">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          {/* Dates metadata */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 pt-4 font-sans text-xs text-muted sm:text-sm">
            <span>
              Effective date: <strong className="font-medium text-text-primary">{effectiveDate}</strong>
            </span>
            <span className="hidden text-white/20 sm:inline">•</span>
            <span>
              Last updated: <strong className="font-medium text-text-primary">{lastUpdated}</strong>
            </span>
          </div>
        </section>

        {/* Content Layout */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Mobile Collapsible TOC */}
          <details className="group rounded-2xl border border-white/10 bg-[#070a12]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)] open:border-[#89AACC]/30 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sans text-sm font-semibold text-text-primary select-none">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#89AACC]">
                <span>Table of Contents</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted">
                  {sections.length}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="mt-3.5 max-h-64 space-y-1.5 overflow-y-auto border-t border-white/8 pr-1 pt-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2 font-sans text-xs leading-5 text-muted transition hover:border-[#89AACC]/30 hover:bg-[#89AACC]/10 hover:text-text-primary sm:text-sm"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </details>

          {/* Desktop Sticky TOC Sidebar */}
          <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] flex-col gap-4 overflow-y-auto rounded-[24px] border border-white/10 bg-[#070a12]/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md lg:flex">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[#89AACC]">On this page</p>
            <nav className="space-y-1.5 pr-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 font-sans text-xs font-medium leading-5 text-muted transition hover:border-[#89AACC]/30 hover:bg-[#89AACC]/10 hover:text-text-primary"
                >
                  {section.title}
                </a>
              ))}
            </nav>

            <div className="mt-2 rounded-xl border border-white/8 bg-black/40 p-3.5">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89AACC]">Notice</p>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-muted">
                Applies as of {lastUpdated}. Subject to revisions for future features and integrations.
              </p>
            </div>
          </aside>

          {/* Main Sections Body */}
          <main className="min-w-0 space-y-5">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-20 rounded-2xl border border-white/10 bg-[#070a12]/90 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-md sm:rounded-[24px] sm:p-7"
              >
                <h2 className="break-words font-sans text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
                  {section.title}
                </h2>

                {section.paragraphs?.length ? (
                  <div className="mt-4 space-y-3 sm:space-y-3.5">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="break-words font-sans text-xs leading-relaxed text-muted sm:text-sm sm:leading-7"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3.5 font-sans text-xs leading-relaxed text-muted sm:rounded-2xl sm:p-4 sm:text-sm sm:leading-6"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#89AACC]" aria-hidden="true" />
                        <span className="min-w-0 break-words">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

            {/* Inquiries / Questions Card */}
            <div className="rounded-2xl border border-[#89AACC]/25 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.1),transparent_50%),rgba(7,10,18,0.95)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md sm:rounded-[24px] sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/10 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#89AACC]">
                <Mail className="h-3.5 w-3.5" />
                <span>Contact & Questions</span>
              </div>

              <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-white sm:text-2xl">
                {contactCardTitle}
              </h2>

              <p className="mt-3 font-sans text-xs leading-relaxed text-muted sm:text-sm sm:leading-6">
                {contactCardDescription}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center rounded-full border border-[#89AACC]/40 bg-[#89AACC]/15 px-5 py-2.5 font-sans text-xs font-semibold text-text-primary transition hover:border-[#89AACC]/60 hover:bg-[#89AACC]/25 sm:text-sm"
                >
                  Open contact section
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 font-sans text-xs font-medium text-muted transition hover:border-white/20 hover:text-text-primary sm:text-sm"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 font-sans text-xs text-muted sm:mt-10 sm:flex-row sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Shreyas J. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/" className="transition hover:text-text-primary">
              Home
            </Link>
            <Link href="/privacy" className="transition hover:text-text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-text-primary">
              Terms of Use
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
