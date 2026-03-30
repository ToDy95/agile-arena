"use client";

import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import { STORY_POINT_LEGEND } from "@/lib/constants/planning";
import { cn } from "@/lib/utils/cn";

export function PlanningLegend() {
  const { reducedMotion } = useMotionPreferences();

  return (
    <div className="space-y-2 rounded-xl border border-border/75 bg-surface-1/70 p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden />
        <span>Story Point Legend</span>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {STORY_POINT_LEGEND.map((item, index) => (
          <motion.div
            key={item.label}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.985 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{
              ...motionTransitions.fast,
              delay: reducedMotion ? 0 : index * 0.03,
            }}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm",
              item.toneClassName,
            )}
          >
            <p className="font-semibold">{item.label}</p>
            <p className="text-[11px] opacity-90">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
