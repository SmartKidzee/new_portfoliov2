"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";

import { getSupabaseClient } from "@/supabase/client";

interface LikeButtonProps {
  blogId: string;
  initialLikes?: number;
  className?: string;
}

const supabase = getSupabaseClient();

// Session ID for tracking likes per user
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("blog_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("blog_session_id", sessionId);
  }
  return sessionId;
}

// Particle type
interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

export function LikeButton({
  blogId,
  initialLikes = 0,
  className = "",
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bigBang, setBigBang] = useState(false);

  // Fetch initial like state from Supabase
  useEffect(() => {
    const fetchLikeData = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const sessionId = getSessionId();

        // Get like count
        const { count, error: countError } = await supabase
          .from("blog_likes")
          .select("*", { count: "exact", head: true })
          .eq("blog_id", blogId);

        if (!countError) {
          setLikes(count || 0);
        }

        // Check if user has liked
        const { data, error: likedError } = await supabase
          .from("blog_likes")
          .select("id")
          .eq("blog_id", blogId)
          .eq("session_id", sessionId)
          .single();

        if (!likedError && data) {
          setIsLiked(true);
        }
      } catch {
        // Silent fail - use initial values
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeData();
  }, [blogId]);

  // Generate particles for explosion effect
  const createParticles = useCallback((): Particle[] => {
    const colors = ["#ff1759", "#ff4d8d", "#ff85b3", "#ffb8d1", "#ff0055", "#ff6b9d"];
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i * 22.5) + (Math.random() * 20 - 10);
      return {
        id: Date.now() + i,
        angle,
        distance: 25 + Math.random() * 35,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      };
    });
  }, []);

  const handleLike = async () => {
    if (isLoading || !supabase) return;

    const wasLiked = isLiked;
    const sessionId = getSessionId();

    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLikes((prev) => wasLiked ? prev - 1 : prev + 1);

    // Trigger animations
    if (!wasLiked) {
      setBigBang(true);
      setParticles(createParticles());
      setTimeout(() => {
        setParticles([]);
        setBigBang(false);
      }, 700);
    }

    try {
      if (wasLiked) {
        // Unlike: Delete from Supabase
        await supabase
          .from("blog_likes")
          .delete()
          .eq("blog_id", blogId)
          .eq("session_id", sessionId);
      } else {
        // Like: Insert to Supabase
        await supabase
          .from("blog_likes")
          .insert({ blog_id: blogId, session_id: sessionId });
      }

      // Verify the count
      const { count } = await supabase
        .from("blog_likes")
        .select("*", { count: "exact", head: true })
        .eq("blog_id", blogId);

      setLikes(count || 0);
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikes((prev) => wasLiked ? prev + 1 : prev - 1);
      console.error("Like error:", error);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={isLoading}
      className={`group relative flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 transition-all duration-200 hover:border-rose-500/30 hover:bg-white/[0.06] active:scale-95 disabled:opacity-50 ${className}`}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Explosive particle ring - Outer burst */}
      <AnimatePresence>
        {bigBang && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute h-1.5 w-1.5 rounded-full bg-rose-400"
                style={{
                  left: "50%",
                  top: "50%",
                  marginLeft: -3,
                  marginTop: -3,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * 35,
                  y: Math.sin((angle * Math.PI) / 180) * 35,
                  scale: [0, 1.5, 1, 1],
                  opacity: [1, 1, 0.8, 0],
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flying particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
            }}
            initial={{ 
              x: (Math.random() - 0.5) * 10, 
              y: (Math.random() - 0.5) * 10, 
              scale: 0, 
              opacity: 1 
            }}
            animate={{
              x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
              scale: [1, 1.3, 0.5],
              opacity: [1, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        ))}
      </AnimatePresence>

      {/* Heart container */}
      <div className="relative h-6 w-6">
        {/* Pulsing ring behind heart when liked */}
        <AnimatePresence>
          {isLiked && (
            <motion.div
              className="absolute inset-0 rounded-full bg-rose-500/40"
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Main heart with spring animation */}
        <motion.div
          className="relative h-full w-full"
          animate={isLiked ? {
            scale: [1, 1.35, 0.95, 1.05, 1],
          } : {
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            ease: [0.175, 0.885, 0.32, 1.275], // Custom spring-like bezier
            times: [0, 0.3, 0.5, 0.7, 1],
          }}
        >
          <Heart
            className={`h-6 w-6 transition-all duration-150 ${
              isLiked
                ? "fill-rose-500 text-rose-500"
                : "fill-transparent text-muted group-hover:text-rose-300/70"
            }`}
            strokeWidth={isLiked ? 2.5 : 1.5}
            style={{
              filter: isLiked 
                ? "drop-shadow(0 0 12px rgba(244,63,94,0.6)) drop-shadow(0 0 4px rgba(244,63,94,0.8))"
                : "none",
            }}
          />
        </motion.div>

        {/* Mini sparkle dots around heart */}
        <AnimatePresence>
          {isLiked && (
            <>
              {[
                { angle: 0, dist: 14 },
                { angle: 72, dist: 12 },
                { angle: 144, dist: 14 },
                { angle: 216, dist: 12 },
                { angle: 288, dist: 14 },
              ].map((item, i) => (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
                  initial={{ 
                    x: "-50%", 
                    y: "-50%", 
                    scale: 1, 
                    opacity: 1 
                  }}
                  animate={{
                    x: `calc(-50% + ${Math.cos((item.angle * Math.PI) / 180) * item.dist}px)`,
                    y: `calc(-50% + ${Math.sin((item.angle * Math.PI) / 180) * item.dist}px)`,
                    scale: 2,
                    opacity: 0,
                  }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.1 + i * 0.03,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Like count with smooth transition */}
      <div className="relative h-6 min-w-8 overflow-hidden">
        <motion.span
          key={likes}
          className="flex h-full items-center justify-center text-sm font-semibold"
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.8 }}
          transition={{ 
            duration: 0.2, 
            ease: [0.25, 0.1, 0.25, 1],
            scale: { type: "spring", stiffness: 500, damping: 25 }
          }}
        >
          <span
            className={`tabular-nums transition-colors duration-200 ${
              isLiked ? "text-rose-400" : "text-muted group-hover:text-rose-200"
            }`}
          >
            {likes.toLocaleString()}
          </span>
        </motion.span>
      </div>
    </motion.button>
  );
}
