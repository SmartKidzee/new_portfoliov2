"use client"

import React, { HTMLAttributes, useCallback, useMemo } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
}

type BeamConfig = {
  width: string | number
  x: string | number
  delay: number
  duration: number
  hue: number
  aspectRatio: number
}

const getDeterministicValue = (seed: number, min: number, max: number) => {
  const normalized = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
  return min + normalized * (max - min)
}

const Beam = ({
  width,
  x,
  delay,
  duration,
  hue,
  aspectRatio,
}: {
  width: string | number
  x: string | number
  delay: number
  duration: number
  hue: number
  aspectRatio: number
}) => {
  return (
    <motion.div
      style={
        {
          "--x": `${x}`,
          "--width": `${width}`,
          "--aspect-ratio": `${aspectRatio}`,
          "--background": `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
        } as React.CSSProperties
      }
      className={`absolute top-0 left-(--x) aspect-[1/var(--aspect-ratio)] w-(--width) [background:var(--background)]`}
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "var(--border)",
  ...props
}) => {
  const generateBeams = useCallback((sideOffset: number) => {
    const beams: BeamConfig[] = []
    const cellsPerSide = Math.floor(100 / beamSize)
    const step = cellsPerSide / beamsPerSide

    for (let i = 0; i < beamsPerSide; i++) {
      const seed = sideOffset * 10 + i + 1
      const x = Math.min(Math.floor(i * step), Math.max(cellsPerSide - 1, 0))
      const delay = getDeterministicValue(seed, beamDelayMin, beamDelayMax)
      const hue = Math.round(getDeterministicValue(seed + 0.25, 195, 225))
      const aspectRatio = Math.max(2, Math.round(getDeterministicValue(seed + 0.5, 3, 9)))

      beams.push({
        x: `${x * beamSize}%`,
        width: `${beamSize}%`,
        delay,
        duration: beamDuration,
        hue,
        aspectRatio,
      })
    }
    return beams
  }, [beamDelayMax, beamDelayMin, beamDuration, beamSize, beamsPerSide])

  const topBeams = useMemo(() => generateBeams(1), [generateBeams])
  const rightBeams = useMemo(() => generateBeams(2), [generateBeams])
  const bottomBeams = useMemo(() => generateBeams(3), [generateBeams])
  const leftBeams = useMemo(() => generateBeams(4), [generateBeams])

  return (
    <div className={cn("relative", className)} {...props}>
      <div
        style={
          {
            "--perspective": `${perspective}px`,
            "--grid-color": gridColor,
            "--beam-size": `${beamSize}%`,
          } as React.CSSProperties
        }
        className={
          "@container-[size] pointer-events-none absolute top-0 left-0 size-full overflow-hidden [clipPath:inset(0)] perspective-(--perspective) transform-3d"
        }
      >
        {/* top side */}
        <div className="@container absolute z-20 h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {topBeams.map((beam, index) => (
            <Beam
              key={`top-${index}`}
              width={beam.width}
              x={beam.x}
              delay={beam.delay}
              duration={beam.duration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* bottom side */}
        <div className="@container absolute top-full h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {bottomBeams.map((beam, index) => (
            <Beam
              key={`bottom-${index}`}
              width={beam.width}
              x={beam.x}
              delay={beam.delay}
              duration={beam.duration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* left side */}
        <div className="@container absolute top-0 left-0 h-[100cqmax] w-[100cqh] origin-[0%_0%] transform-[rotate(90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {leftBeams.map((beam, index) => (
            <Beam
              key={`left-${index}`}
              width={beam.width}
              x={beam.x}
              delay={beam.delay}
              duration={beam.duration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* right side */}
        <div className="@container absolute top-0 right-0 h-[100cqmax] w-[100cqh] origin-[100%_0%] transform-[rotate(-90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {rightBeams.map((beam, index) => (
            <Beam
              key={`right-${index}`}
              width={beam.width}
              x={beam.x}
              delay={beam.delay}
              duration={beam.duration}
              hue={beam.hue}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
