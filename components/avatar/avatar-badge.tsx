"use client";

import { motion } from "motion/react";

import { AvatarPreview } from "@/components/avatar/avatar-preview";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { cn } from "@/lib/utils/cn";

type AvatarBadgeProps = {
  config: AvatarConfig;
  className?: string;
};

export function AvatarBadge({ config, className }: AvatarBadgeProps) {
  const { reducedMotion } = useMotionPreferences();

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 3 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      transition={motionTransitions.fast}
      whileHover={reducedMotion ? undefined : { y: -1, scale: 1.01 }}
      whileTap={reducedMotion ? undefined : { scale: 0.99 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/30 bg-[radial-gradient(circle_at_24%_20%,var(--arena-accent-glow),transparent_56%),linear-gradient(145deg,rgba(8,13,24,0.9),rgba(4,8,16,0.94))] p-1 shadow-[0_0_0_1px_rgba(125,211,252,0.22),0_16px_28px_rgba(2,6,23,0.48)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(56,189,248,0.18),transparent_45%)]" />
      <AvatarPreview
        config={config}
        size="xs"
        className="h-14 w-14 border-primary/28 sm:h-16 sm:w-16"
      />
    </motion.div>
  );
}
