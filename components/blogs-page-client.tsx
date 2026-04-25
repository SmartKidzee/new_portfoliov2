"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SiteLogo } from "@/components/site-logo";
import { buildBlogExcerpt, estimateReadTime } from "@/lib/blog-content";
import type { BlogPost } from "@/supabase/client";

type SortOption = "newest" | "oldest" | "readTime" | "title";

type BlogsPageClientProps = {
  posts: BlogPost[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function BlogsPageClient({ posts }: BlogsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const categories = useMemo(() => {
    const cats = new Set(posts.map((post) => post.category));
    return Array.from(cats).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (debouncedSearch.length >= 3) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    filtered.sort((left, right) => {
      switch (sortBy) {
        case "newest":
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        case "oldest":
          return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
        case "readTime":
          return estimateReadTime(left.content) - estimateReadTime(right.content);
        case "title":
          return left.title.localeCompare(right.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [debouncedSearch, posts, selectedCategory, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSortBy("newest");
  }, []);

  const hasActiveFilters = searchQuery.length >= 3 || selectedCategory || sortBy !== "newest";

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(137,170,204,0.18),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(78,133,191,0.16),transparent_22%),linear-gradient(180deg,rgba(8,10,14,0.98)_0%,rgba(8,10,14,1)_100%)]" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pb-16 pt-28 md:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3 text-sm text-text-primary">
              <SiteLogo className="h-12 w-12" imageClassName="p-1.5" priority />
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Shreyas</p>
                <p className="mt-1 text-sm text-text-primary/78">Portfolio and blog archive</p>
              </div>
            </Link>
            <Link
              href="/"
              className="w-fit rounded-full border border-white/10 bg-surface/70 px-4 py-2 text-sm text-muted transition hover:text-text-primary"
            >
              Back to home
            </Link>
          </div>

          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Insights & Reflections</p>
            <h1 className="mt-5 font-display text-5xl italic leading-none md:text-7xl">Thoughts & Writings</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted md:text-base">
              A curated collection of my thoughts, learnings, and experiences navigating software engineering, design, and continuous growth.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-white/5 bg-bg/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-6 py-4 md:px-10 lg:px-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search blogs (min 3 chars)..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-white/10 bg-surface/50 py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#89AACC]/50 focus:outline-none focus:ring-1 focus:ring-[#89AACC]/20"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  showFilters || hasActiveFilters
                    ? "border-[#89AACC]/30 bg-[#89AACC]/10 text-[#89AACC]"
                    : "border-white/10 bg-surface/50 text-muted hover:text-text-primary"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters ? (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#89AACC] text-[10px] font-bold text-bg">
                    {[searchQuery.length >= 3, selectedCategory, sortBy !== "newest"].filter(Boolean).length}
                  </span>
                ) : null}
              </button>

              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/50 px-4 py-2 text-sm text-muted transition hover:text-text-primary"
                >
                  <span className="text-xs uppercase tracking-wider">Sort</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 top-full z-20 mt-2 hidden w-40 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-xl group-hover:block">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "readTime", label: "Read Time" },
                    { value: "title", label: "Title A-Z" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={`w-full px-4 py-2 text-left text-sm transition hover:bg-white/5 ${
                        sortBy === option.value ? "text-[#89AACC]" : "text-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t border-white/5 pt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-muted">Categories:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        !selectedCategory
                          ? "bg-[#89AACC] text-bg"
                          : "border border-white/10 bg-white/5 text-muted hover:text-text-primary"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                        className={`rounded-full px-3 py-1 text-xs transition ${
                          selectedCategory === category
                            ? "bg-[#89AACC] text-bg"
                            : "border border-white/10 bg-white/5 text-muted hover:text-text-primary"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                        Clear all
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-4 text-xs text-muted">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"} found
            {searchQuery.length > 0 && searchQuery.length < 3 ? (
              <span className="ml-2 text-[#89AACC]">(type 3+ chars to search)</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16 lg:px-16">
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => {
              const readTime = estimateReadTime(post.content);
              const hasThumbnail = post.src && (post.src.startsWith("http") || post.src.startsWith("/"));

              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/blogs/${post.id}`} className="group block">
                    <article className="rounded-[32px] border border-white/10 bg-surface/40 p-5 backdrop-blur-xs transition-all duration-300 hover:border-white/20 hover:bg-surface/60 hover:shadow-lg hover:shadow-[#89AACC]/5 sm:p-6 md:p-8">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                        {hasThumbnail ? (
                          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl sm:h-56 lg:h-44 lg:w-64">
                            <img
                              src={post.src ?? undefined}
                              alt={post.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-surface/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        ) : (
                          <div className="flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-[#17202d] via-[#28456a] to-[#121212] sm:h-56 lg:h-44 lg:w-64">
                            <span className="text-4xl text-text-primary/20">{post.category[0]}</span>
                          </div>
                        )}

                        <div className="flex flex-1 flex-col">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 uppercase tracking-[0.2em]">
                              {post.category}
                            </span>
                            {post.isAchievement ? (
                              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-0.5 uppercase tracking-[0.2em] text-emerald-200">
                                Achievement
                              </span>
                            ) : null}
                            <span className="h-1 w-1 rounded-full bg-muted" />
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(post.created_at)}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted" />
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {readTime} min read
                            </span>
                          </div>

                          <h2 className="mt-3 text-xl text-text-primary transition group-hover:text-[#89AACC] sm:text-2xl md:text-3xl">
                            {post.title}
                          </h2>

                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">
                            {buildBlogExcerpt(post.content)}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            {post.tags.slice(0, 4).map((tag) => (
                              <span
                                key={`${post.id}-${tag}`}
                                className="rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-muted/80"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 4 ? (
                              <span className="text-[10px] text-muted/60">+{post.tags.length - 4}</span>
                            ) : null}
                          </div>

                          <div className="mt-5 flex items-center gap-2 text-sm text-[#89AACC] transition group-hover:gap-3">
                            <span>Read article</span>
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="rounded-full border border-white/10 bg-surface/50 p-6">
                <Search className="h-8 w-8 text-muted" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-text-primary">No posts found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full border border-white/10 bg-surface/50 px-6 py-2 text-sm text-muted transition hover:text-text-primary"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
