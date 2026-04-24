import Link from "next/link";

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
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(137,170,204,0.18),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(78,133,191,0.16),transparent_24%),linear-gradient(180deg,rgba(6,9,15,0.97)_0%,rgba(4,6,12,1)_100%)]" />
        <div className="grid-overlay absolute inset-0 opacity-20" />
        <div className="absolute left-[-8%] top-10 h-56 w-56 rounded-full bg-[#173050] blur-3xl md:h-72 md:w-72" />
        <div className="absolute bottom-0 right-[-8%] h-72 w-72 rounded-full bg-[#1a4f45] blur-3xl md:h-80 md:w-80" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px] px-6 py-8 md:px-10 lg:px-16">
        <header className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-[#05070d]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:flex-row md:items-center md:justify-between">
          <Link href="/" className="inline-flex items-center gap-4">
            <SiteLogo priority className="h-12 w-12" />
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#89AACC]">Shreyas J</p>
              <p className="mt-1 text-sm text-muted">Portfolio policies and legal information</p>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-3 text-sm text-muted">
            <Link
              href="/"
              className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/20 hover:text-text-primary"
            >
              Home
            </Link>
            <Link
              href="/privacy"
              className={`rounded-full border px-4 py-2 transition hover:text-text-primary ${
                canonicalPath === "/privacy"
                  ? "border-[#89AACC]/35 bg-[#89AACC]/10 text-text-primary"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`rounded-full border px-4 py-2 transition hover:text-text-primary ${
                canonicalPath === "/terms"
                  ? "border-[#89AACC]/35 bg-[#89AACC]/10 text-text-primary"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              Terms & Conditions
            </Link>
          </nav>
        </header>

        <section className="mt-8 overflow-hidden rounded-[36px] border border-white/10 bg-[#05070d]/88 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)] md:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.32em] text-[#89AACC]">{badge}</p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-text-primary md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-muted md:text-base">{description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)]"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{fact.label}</p>
                <p className="mt-3 text-sm leading-6 text-text-primary">{fact.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:border-[#89AACC]/35 hover:text-text-primary"
              >
                {section.title}
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
            <span>Effective date: {effectiveDate}</span>
            <span>Last updated: {lastUpdated}</span>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="self-start rounded-[30px] border border-white/10 bg-[#05070d]/88 p-6 shadow-[0_24px_72px_rgba(0,0,0,0.24)] lg:sticky lg:top-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">On this page</p>
            <div className="mt-5 space-y-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-text-primary transition hover:border-[#89AACC]/30 hover:bg-[#89AACC]/8"
                >
                  {section.title}
                </a>
              ))}
            </div>

            <div className="mt-6 rounded-[22px] border border-white/8 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#89AACC]">Important</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                This document describes how the website currently operates as of {lastUpdated}. If the site adds new
                features, service providers, or tracking technologies, this page may be updated accordingly.
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="rounded-[30px] border border-white/10 bg-[#05070d]/88 p-6 shadow-[0_24px_72px_rgba(0,0,0,0.24)] md:p-8"
              >
                <h2 className="text-2xl text-text-primary md:text-3xl">{section.title}</h2>

                {section.paragraphs?.length ? (
                  <div className="mt-5 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-8 text-muted md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {section.bullets?.length ? (
                  <ul className="mt-5 space-y-3 text-sm leading-8 text-muted md:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

            <div className="rounded-[30px] border border-[#89AACC]/20 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.12),transparent_42%),rgba(5,7,13,0.92)] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.24)] md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#89AACC]">Questions</p>
              <h2 className="mt-4 text-2xl text-text-primary md:text-3xl">{contactCardTitle}</h2>
              <p className="mt-4 text-sm leading-8 text-muted md:text-base">{contactCardDescription}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/#contact"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-text-primary transition hover:border-[#89AACC]/35 hover:bg-[#89AACC]/10"
                >
                  Open contact section
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-muted transition hover:border-white/20 hover:text-text-primary"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Shreyas J. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="transition hover:text-text-primary">
              Home
            </Link>
            <Link href="/privacy" className="transition hover:text-text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-text-primary">
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
