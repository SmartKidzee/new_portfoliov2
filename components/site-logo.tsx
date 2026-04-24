import Image from "next/image";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function SiteLogo({ className, imageClassName, priority = false }: SiteLogoProps) {
  return (
    <div
      className={cn(
        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#05070d] shadow-[0_12px_36px_rgba(0,0,0,0.28)] ring-1 ring-white/8",
        className,
      )}
    >
      <div className="absolute inset-0 accent-gradient opacity-20" />
      <Image
        src="/logo.png"
        alt="Shreyas logo"
        fill
        priority={priority}
        sizes="44px"
        className={cn("object-contain p-1.5", imageClassName)}
      />
    </div>
  );
}
