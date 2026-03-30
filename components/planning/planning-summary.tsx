"use client";

import { AnimatePresence, motion } from "motion/react";

import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import {
  PLANNING_FINAL_ESTIMATE_VALUES,
  type PlanningFinalEstimateValue,
} from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";

type PlanningSummaryProps = {
  isRevealed: boolean;
  taskLabel: string;
  storyPointLowerLabel: string;
  storyPointAverageLabel: string;
  storyPointUpperLabel: string;
  suggestedEstimate: PlanningFinalEstimateValue | null;
  manualFinalEstimate: PlanningFinalEstimateValue | null;
  resolvedFinalEstimate: PlanningFinalEstimateValue | null;
  complexityAverageLabel: string;
  timeAverageLabel: string;
  moodLabel: string;
  interpretationEmoji: string;
  interpretationLabel: string;
  interpretationDescription: string;
  canManageRound: boolean;
  onManualFinalEstimateChange: (value: PlanningFinalEstimateValue | null) => void;
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

function formatFinalEstimate(value: PlanningFinalEstimateValue | null): string {
  if (!value) {
    return "-";
  }

  if (value === "?") {
    return "?";
  }

  return `${value} SP`;
}

export function PlanningSummary({
  isRevealed,
  taskLabel,
  storyPointLowerLabel,
  storyPointAverageLabel,
  storyPointUpperLabel,
  suggestedEstimate,
  manualFinalEstimate,
  resolvedFinalEstimate,
  complexityAverageLabel,
  timeAverageLabel,
  moodLabel,
  interpretationEmoji,
  interpretationLabel,
  interpretationDescription,
  canManageRound,
  onManualFinalEstimateChange,
}: PlanningSummaryProps) {
  const { reducedMotion } = useMotionPreferences();
  const finalEstimateLabel = formatFinalEstimate(resolvedFinalEstimate);
  const suggestedLabel = formatFinalEstimate(suggestedEstimate);
  const manualLabel = formatFinalEstimate(manualFinalEstimate);

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`${isRevealed ? "revealed" : "hidden"}-${finalEstimateLabel}-${taskLabel}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={motionTransitions.fast}
          className={cn(
            "rounded-lg border px-2.5 py-2",
            isRevealed
              ? "border-primary/35 bg-primary/10 text-foreground"
              : "border-border/75 bg-surface-2/75 text-muted-foreground",
          )}
        >
          <p className="text-[11px] uppercase tracking-[0.14em]">Current Task</p>
          <p className="text-sm font-semibold text-foreground">{taskLabel || "No task selected"}</p>
          <p className="text-xs">
            {isRevealed ? (
              <>
                {interpretationEmoji} {finalEstimateLabel} - {interpretationLabel}
              </>
            ) : (
              "Reveal votes to unlock interpretation."
            )}
          </p>
          {isRevealed ? (
            <p className="mt-1 text-[11px] text-muted-foreground">{interpretationDescription}</p>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Lower Bound" value={storyPointLowerLabel} revealed={isRevealed} />
        <SummaryStat label="Average" value={storyPointAverageLabel} revealed={isRevealed} />
        <SummaryStat label="Upper Bound" value={storyPointUpperLabel} revealed={isRevealed} />
        <SummaryStat label="Suggested" value={suggestedLabel} revealed={isRevealed} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryStat
          label="Average Complexity"
          value={complexityAverageLabel}
          revealed={isRevealed}
        />
        <SummaryStat label="Average Time" value={timeAverageLabel} revealed={isRevealed} />
        <SummaryStat label="Final Result" value={finalEstimateLabel} revealed={isRevealed} />
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

      {canManageRound && isRevealed ? (
        <div className="space-y-2 rounded-lg border border-border/75 bg-surface-1/75 px-2.5 py-2">
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Facilitator Final Estimate
            </p>
            <p className="text-xs text-muted-foreground">
              Suggested: <span className="font-semibold text-foreground">{suggestedLabel}</span> |{" "}
              Override: <span className="font-semibold text-foreground">{manualLabel}</span>
            </p>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {PLANNING_FINAL_ESTIMATE_VALUES.map((value) => {
              const isSelected = manualFinalEstimate === value;
              const label = value === "?" ? "?" : `${value}`;

              return (
                <motion.button
                  key={value}
                  type="button"
                  initial={false}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  className={cn(
                    "h-8 rounded-md border text-xs font-semibold transition",
                    isSelected
                      ? "border-primary bg-primary/18 text-foreground"
                      : "border-border/75 bg-surface-2/85 text-foreground hover:border-primary/35 hover:bg-surface-3/85",
                  )}
                  onClick={() => onManualFinalEstimateChange(isSelected ? null : value)}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
