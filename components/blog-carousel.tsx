"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  created_at: string;
  src?: string | null;
  content: string;
  isAchievement?: boolean;
  tags?: string[];
}

interface BlogCarouselProps {
  posts: BlogPost[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const estimateReadTime = (content: string) => {
  const wordCount = content.replace(/\s+/g, " ").trim().split(" ").length;
  return Math.max(3, Math.round(wordCount / 220));
};

export function BlogCarousel({ posts }: BlogCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const gap = 20;
  
  // Responsive card width
  const getCardWidth = () => {
    if (containerWidth >= 1024) return 360;
    if (containerWidth >= 768) return 320;
    if (containerWidth >= 640) return 280;
    return containerWidth - 40; // mobile: almost full width
  };

  const cardWidth = getCardWidth();
  const visibleItems = Math.max(1, Math.floor((containerWidth) / (cardWidth + gap)));
  const maxIndex = Math.max(0, posts.length - visibleItems);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const paginate = useCallback((direction: number) => {
    setCurrentIndex((prev) => {
      const newIndex = prev + direction;
      return Math.max(0, Math.min(newIndex, maxIndex));
    });
  }, [maxIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  // Touch/drag handling
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = cardWidth / 3;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      paginate(-1);
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      paginate(1);
    }
  };

  if (posts.length === 0) return null;

  const translateX = currentIndex * (cardWidth + gap);

  return (
    <div className="relative w-full">
      {/* Main Container */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface/10 p-4 md:p-6"
      >
        {/* Cards Track */}
        <motion.div
          className="flex"
          animate={{ x: -translateX }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: -(maxIndex * (cardWidth + gap)), right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ gap: `${gap}px` }}
        >
          {posts.map((post) => {
            const readTime = estimateReadTime(post.content);
            const hasImage = post.src && (post.src.startsWith("http") || post.src.startsWith("/"));

            return (
              <motion.div
                key={post.id}
                className="shrink-0"
                style={{ width: cardWidth }}
              >
                <Link href={`/blogs/${post.id}`} className="block h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/40 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#89AACC]/5">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden shrink-0">
                      {hasImage && post.src ? (
                        <div className="h-full w-full overflow-hidden">
                          <img
                            src={post.src}
                            alt={post.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#17202d] via-[#28456a] to-[#121212]">
                          <span className="text-5xl font-bold text-text-primary/20">{post.category[0]}</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
                      
                      {/* Category badge */}
                      <div className="absolute left-3 top-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                            {post.category}
                          </span>
                          {post.isAchievement ? (
                            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100 backdrop-blur-sm">
                              Achievement
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-base font-medium text-text-primary transition group-hover:text-[#89AACC] md:text-lg">
                        {post.title}
                      </h3>

                      {/* Meta */}
                      <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-muted" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {readTime} min
                        </span>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80 md:left-4 md:p-3"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {currentIndex < maxIndex && (
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80 md:right-4 md:p-3"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Progress dots */}
      {maxIndex > 0 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-[#89AACC]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint - mobile only */}
      <p className="mt-2 text-center text-xs text-muted/60 sm:hidden">
        Swipe to browse
      </p>
    </div>
  );
}
