import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";

interface BlogPostHeroProps {
  post: {
    id: string;
    title: string;
    category: string;
    created_at: string;
    src?: string | null;
    tags: string[];
    isAchievement?: boolean;
  };
  readTime: number;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export function BlogPostHero({ post, readTime }: BlogPostHeroProps) {
  const formattedDate = formatDate(post.created_at);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(137,170,204,0.18),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(78,133,191,0.16),transparent_22%),linear-gradient(180deg,rgba(8,10,14,0.98)_0%,rgba(8,10,14,1)_100%)]" />

        <div className="relative mx-auto max-w-[900px] px-6 pb-12 pt-28 md:px-10 md:pb-16 md:pt-32">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-sm text-text-primary">
              <SiteLogo className="h-12 w-12" imageClassName="p-1.5" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Shreyas</span>
            </Link>

            <Link
              href="/blogs"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-surface/70 px-4 py-2 text-sm text-muted transition hover:border-white/20 hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blogs
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
            <span>{post.category}</span>
            {post.isAchievement ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] tracking-[0.22em] text-emerald-200">
                Achievement
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight text-text-primary md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readTime} min read</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/3 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {post.src ? (
        <section className="mx-auto max-w-[1000px] px-6 md:px-10">
          <div className="relative -mt-6 aspect-video overflow-hidden rounded-3xl border border-white/10 md:-mt-8">
            <Image src={post.src} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1000px" priority />
            <div className="absolute inset-0 bg-linear-to-t from-bg/60 via-transparent to-transparent" />
          </div>
        </section>
      ) : null}
    </>
  );
}
