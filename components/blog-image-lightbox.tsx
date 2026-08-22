"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type GalleryImage = {
  alt: string;
  src: string;
};

type BlogImageLightboxProps = {
  children: ReactNode;
};

const SWIPE_THRESHOLD = 48;

export function BlogImageLightbox({ children }: BlogImageLightboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null && images.length > 0;
  const activeImage = isOpen ? images[activeIndex] : null;
  const resolvedIndex = activeIndex ?? 0;

  const close = useCallback(() => setActiveIndex(null), []);

  const goTo = useCallback(
    (direction: -1 | 1) => {
      setActiveIndex((current) => {
        if (current === null || images.length < 2) {
          return current;
        }

        return (current + direction + images.length) % images.length;
      });
    },
    [images.length],
  );

  const openFromTrigger = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-blog-image-trigger]") : null;
    const root = rootRef.current;

    if (!target || !root) {
      return;
    }

    const triggers = Array.from(root.querySelectorAll<HTMLElement>("[data-blog-image-trigger]")).filter(
      (item) => (item.dataset.blogImageSrc?.trim().length ?? 0) > 0,
    );
    const selectedIndex = triggers.indexOf(target);

    if (selectedIndex < 0) {
      return;
    }

    const gallery = triggers.map((item) => ({
      src: item.dataset.blogImageSrc?.trim() ?? "",
      alt: item.dataset.blogImageAlt?.trim() ?? "",
    }));

    setImages(gallery);
    setActiveIndex(selectedIndex);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }

      if (event.key === "ArrowLeft") {
        goTo(-1);
      }

      if (event.key === "ArrowRight") {
        goTo(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, goTo, isOpen]);

  useEffect(() => {
    if (!activeImage || images.length < 2 || activeIndex === null) {
      return;
    }

    const neighboringSources = [
      images[(activeIndex + 1) % images.length]?.src,
      images[(activeIndex - 1 + images.length) % images.length]?.src,
    ];

    neighboringSources.forEach((src) => {
      if (!src) {
        return;
      }

      const preload = new Image();
      preload.src = src;
    });
  }, [activeImage, activeIndex, images]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    touchStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (!start) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    goTo(deltaX < 0 ? 1 : -1);
  };

  return (
    <div ref={rootRef} onClick={openFromTrigger}>
      {children}

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-[#02040a]/94 p-3 backdrop-blur-xl sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Expanded image${activeImage.alt ? `: ${activeImage.alt}` : ""}`}
            onClick={close}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(137,170,204,0.17),transparent_28%),radial-gradient(circle_at_82%_82%,rgba(78,133,191,0.16),transparent_30%)]" />

            <motion.div
              className="relative z-10 flex h-[min(76dvh,860px)] w-full max-w-[min(94vw,1360px)] items-center justify-center overflow-hidden rounded-[24px] border border-white/15 bg-[#060912] shadow-[0_28px_110px_rgba(0,0,0,0.58)] sm:h-[min(82dvh,900px)] sm:rounded-[32px]"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={activeImage.src}
                  src={activeImage.src}
                  alt={activeImage.alt || "Expanded blog image"}
                  className="h-full w-full select-none object-contain"
                  draggable={false}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.015 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#03050a]/90 via-[#03050a]/35 to-transparent px-5 pb-5 pt-16 sm:px-7 sm:pb-6">
                <p className="max-w-[78ch] text-sm leading-6 text-white/84">{activeImage.alt || "Blog image"}</p>
                {images.length > 1 ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a9c3dd]">
                    {resolvedIndex + 1} / {images.length} · Swipe or use arrow keys
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={close}
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#070b13]/82 text-text-primary shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#89AACC]/55 hover:bg-[#102033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89AACC] sm:right-5 sm:top-5"
                aria-label="Close image viewer"
              >
                <X className="h-5 w-5" />
              </button>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(-1)}
                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#070b13]/82 text-text-primary shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#89AACC]/55 hover:bg-[#102033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89AACC] sm:left-5 sm:h-12 sm:w-12"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#070b13]/82 text-text-primary shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#89AACC]/55 hover:bg-[#102033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89AACC] sm:right-5 sm:h-12 sm:w-12"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function BlogImageExpandHint() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#02040a]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#05070d]/84 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.38)] backdrop-blur-md">
        <Expand className="h-3.5 w-3.5" />
        Expand
      </span>
    </span>
  );
}
