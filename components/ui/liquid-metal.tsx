"use client";

import {
  forwardRef,
  memo,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { LiquidMetal as LiquidMetalShader } from "@paper-design/shaders-react";

import { cn } from "@/lib/utils";

// ============================================================================
// LiquidMetal - Base shader wrapper component
// ============================================================================

export interface LiquidMetalProps {
  colorBack?: string;
  colorTint?: string;
  speed?: number;
  repetition?: number;
  distortion?: number;
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

export const LiquidMetal = memo(function LiquidMetal({
  colorBack = "#aaaaac",
  colorTint = "#ffffff",
  speed = 0.5,
  repetition = 4,
  distortion = 0.1,
  scale = 1,
  className,
  style,
}: LiquidMetalProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)} style={style}>
      <LiquidMetalShader
        colorBack={colorBack}
        colorTint={colorTint}
        speed={speed}
        repetition={repetition}
        distortion={distortion}
        softness={0}
        shiftRed={0.3}
        shiftBlue={-0.3}
        angle={45}
        shape="none"
        scale={scale}
        fit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
});

LiquidMetal.displayName = "LiquidMetal";

type SharedActionProps = {
  children: ReactNode;
  icon?: ReactNode;
  borderWidth?: number;
  metalConfig?: Omit<LiquidMetalProps, "className" | "style">;
  size?: "sm" | "md" | "lg";
  className?: string;
  innerClassName?: string;
  labelClassName?: string;
};

export interface LiquidMetalButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    SharedActionProps {}

export interface LiquidMetalLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">,
    SharedActionProps {}

export interface LiquidMetalBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SharedActionProps {}

const sizeStyles = {
  sm: "min-h-10 gap-2.5 px-3 py-2 text-sm",
  md: "min-h-12 gap-3 px-4 py-3 text-sm md:text-base",
  lg: "min-h-14 gap-3.5 px-5 py-4 text-base md:text-lg",
};

const iconSizes = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

function LiquidMetalFace({
  children,
  icon,
  size = "md",
  borderWidth = 2,
  metalConfig,
  innerClassName,
  labelClassName,
}: Omit<SharedActionProps, "className">) {
  return (
    <div
      className="relative overflow-hidden rounded-full shadow-[0_18px_45px_-14px_rgba(0,0,0,0.45)]"
      style={{ padding: borderWidth }}
    >
      <LiquidMetal
        colorBack={metalConfig?.colorBack ?? "#6c7e94"}
        colorTint={metalConfig?.colorTint ?? "#f4fbff"}
        speed={metalConfig?.speed ?? 0.32}
        repetition={metalConfig?.repetition ?? 4}
        distortion={metalConfig?.distortion ?? 0.12}
        scale={metalConfig?.scale ?? 1}
        className="absolute inset-0 rounded-full"
      />

      <div
        className={cn(
          "relative z-10 flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(4,8,14,0.94),rgba(2,5,10,0.98))] text-white transition-colors duration-200 group-hover:bg-[linear-gradient(180deg,rgba(6,11,18,0.96),rgba(3,7,12,0.99))]",
          sizeStyles[size],
          innerClassName,
        )}
      >
        {icon ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-[#dcefff]",
              iconSizes[size],
            )}
          >
            {icon}
          </span>
        ) : null}
        <span className={cn("min-w-0 font-medium tracking-[0.01em] text-white", labelClassName)}>{children}</span>
      </div>
    </div>
  );
}

export const LiquidMetalButton = forwardRef<
  HTMLButtonElement,
  LiquidMetalButtonProps
>(
  (
    { children, icon, borderWidth = 2, metalConfig, size = "md", className, innerClassName, labelClassName, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative inline-flex shrink-0 cursor-pointer border-none bg-transparent p-0 outline-none transition-transform hover:-translate-y-0.5 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-55",
          className,
        )}
        {...props}
      >
        <LiquidMetalFace
          icon={icon}
          borderWidth={borderWidth}
          metalConfig={metalConfig}
          size={size}
          innerClassName={innerClassName}
          labelClassName={labelClassName}
        >
          {children}
        </LiquidMetalFace>
      </button>
    );
  },
);

LiquidMetalButton.displayName = "LiquidMetalButton";

export const LiquidMetalLink = forwardRef<HTMLAnchorElement, LiquidMetalLinkProps>(
  (
    { children, icon, borderWidth = 2, metalConfig, size = "md", className, innerClassName, labelClassName, ...props },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        className={cn("group relative inline-flex shrink-0 transition-transform hover:-translate-y-0.5", className)}
        {...props}
      >
        <LiquidMetalFace
          icon={icon}
          borderWidth={borderWidth}
          metalConfig={metalConfig}
          size={size}
          innerClassName={innerClassName}
          labelClassName={labelClassName}
        >
          {children}
        </LiquidMetalFace>
      </a>
    );
  },
);

LiquidMetalLink.displayName = "LiquidMetalLink";

export const LiquidMetalBadge = forwardRef<HTMLDivElement, LiquidMetalBadgeProps>(
  (
    { children, icon, borderWidth = 2, metalConfig, size = "sm", className, innerClassName, labelClassName, ...props },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("inline-flex shrink-0", className)} {...props}>
        <LiquidMetalFace
          icon={icon}
          borderWidth={borderWidth}
          metalConfig={metalConfig}
          size={size}
          innerClassName={innerClassName}
          labelClassName={labelClassName}
        >
          {children}
        </LiquidMetalFace>
      </div>
    );
  },
);

LiquidMetalBadge.displayName = "LiquidMetalBadge";

export default LiquidMetalButton;
