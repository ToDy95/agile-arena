"use client";

import { AnimatePresence, motion } from "motion/react";

import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import { cn } from "@/lib/utils/cn";

type PlanningSummaryProps = {
  isRevealed: boolean;
  storyPointsAverageLabel: string;
  complexityAverageLabel: string;
  timeAverageLabel: string;
  moodLabel: string;
};

function SummaryStat({
  label,
  value,
  revealed,
}: {
  label: string;
  value: string;
  revealed: boolean;
}) {
  const { reducedMotion } = useMotionPreferences();

  return (
    <div className="rounded-lg border border-border/75 bg-surface-1/75 px-2.5 py-2">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`${label}-${revealed ? value : "hidden"}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={motionTransitions.fast}
          className={cn(
            "text-sm font-semibold",
            revealed ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {revealed ? value : "Hidden"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function PlanningSummary({
  isRevealed,
  storyPointsAverageLabel,
  complexityAverageLabel,
  timeAverageLabel,
  moodLabel,
}: PlanningSummaryProps) {
  const { reducedMotion } = useMotionPreferences();

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        <SummaryStat label="Average SP" value={storyPointsAverageLabel} revealed={isRevealed} />
        <SummaryStat
          label="Average Complexity"
          value={complexityAverageLabel}
          revealed={isRevealed}
        />
        <SummaryStat label="Average Time" value={timeAverageLabel} revealed={isRevealed} />
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={isRevealed ? moodLabel : "hidden-mood"}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={motionTransitions.fast}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-xs font-medium",
            isRevealed
              ? "border-primary/35 bg-primary/10 text-foreground"
              : "border-border/75 bg-surface-2/70 text-muted-foreground",
          )}
        >
          Task mood: {isRevealed ? moodLabel : "Reveal to analyze"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
