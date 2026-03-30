"use client";

import { motion } from "motion/react";

import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getCardInteractionProps, motionTransitions } from "@/lib/animations/presets";
import { PLANNING_METRIC_DECK } from "@/lib/constants/planning";
import type { PlanningMetricValue } from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";

type PlanningMetricSelectorProps = {
  label: string;
  value: PlanningMetricValue;
  disabled?: boolean;
  onChange: (value: PlanningMetricValue) => void;
};

export function PlanningMetricSelector({
  label,
  value,
  disabled = false,
  onChange,
}: PlanningMetricSelectorProps) {
  const { reducedMotion } = useMotionPreferences();
  const cardInteraction = getCardInteractionProps(reducedMotion);

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {PLANNING_METRIC_DECK.map((entry) => {
          const isActive = entry === value;

          return (
            <motion.button
              key={entry}
              type="button"
              disabled={disabled}
              {...cardInteraction}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1.01 : 1,
                    }
              }
              transition={motionTransitions.spring}
              className={cn(
                "h-10 rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                isActive
                  ? "border-primary bg-primary/18 text-foreground"
                  : "border-border/75 bg-surface-2/85 text-foreground hover:border-primary/35 hover:bg-surface-3/85",
              )}
              onClick={() => onChange(entry)}
            >
              {entry}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
