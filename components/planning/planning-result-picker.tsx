"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import {
  PLANNING_FINAL_ESTIMATE_VALUES,
  type PlanningFinalEstimateValue,
} from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";

type PlanningResultPickerProps = {
  isRevealed: boolean;
  lowerEstimate: PlanningFinalEstimateValue | null;
  averageLabel: string;
  upperEstimate: PlanningFinalEstimateValue | null;
  selectedFinalEstimate: PlanningFinalEstimateValue | null;
  canManageRound: boolean;
  disabled?: boolean;
  onSelectEstimate: (value: PlanningFinalEstimateValue | null) => void;
  onFinalizeTask: () => void;
};

function ResultChip({
  label,
  value,
  isSelected,
  isDisabled,
  onClick,
}: {
  label: string;
  value: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        "rounded-lg border px-2.5 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
        isSelected
          ? "border-primary bg-primary/18 text-foreground"
          : "border-border/75 bg-surface-1/75 text-foreground hover:border-primary/35 hover:bg-surface-2/80",
      )}
      onClick={onClick}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </button>
  );
}

export function PlanningResultPicker({
  isRevealed,
  lowerEstimate,
  averageLabel,
  upperEstimate,
  selectedFinalEstimate,
  canManageRound,
  disabled = false,
  onSelectEstimate,
  onFinalizeTask,
}: PlanningResultPickerProps) {
  const { reducedMotion } = useMotionPreferences();
  const [showCustom, setShowCustom] = useState(false);

  if (!isRevealed) {
    return (
      <div className="rounded-lg border border-border/75 bg-surface-1/75 px-2.5 py-2 text-xs text-muted-foreground">
        Reveal votes to pick a final estimate.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-border/75 bg-surface-1/70 p-3">
      <div className="grid grid-cols-3 gap-2">
        <ResultChip
          label="Lower"
          value={lowerEstimate ?? "-"}
          isSelected={selectedFinalEstimate === lowerEstimate && lowerEstimate !== null}
          isDisabled={!canManageRound || disabled || lowerEstimate === null}
          onClick={lowerEstimate ? () => onSelectEstimate(lowerEstimate) : undefined}
        />
        <ResultChip label="Average" value={averageLabel} isDisabled />
        <ResultChip
          label="Upper"
          value={upperEstimate ?? "-"}
          isSelected={selectedFinalEstimate === upperEstimate && upperEstimate !== null}
          isDisabled={!canManageRound || disabled || upperEstimate === null}
          onClick={upperEstimate ? () => onSelectEstimate(upperEstimate) : undefined}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canManageRound || disabled}
          onClick={() => setShowCustom((current) => !current)}
        >
          Custom
        </Button>
        <p className="text-xs text-muted-foreground">
          Final:{" "}
          <span className="font-semibold text-foreground">
            {selectedFinalEstimate ? selectedFinalEstimate : "Not selected"}
          </span>
        </p>
      </div>

      <AnimatePresence initial={false}>
        {showCustom ? (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, height: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, height: 0 }}
            transition={motionTransitions.fast}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-6 gap-1.5">
              {PLANNING_FINAL_ESTIMATE_VALUES.map((value) => {
                const isSelected = selectedFinalEstimate === value;

                return (
                  <motion.button
                    key={value}
                    type="button"
                    initial={false}
                    whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                    disabled={!canManageRound || disabled}
                    className={cn(
                      "h-8 rounded-md border text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                      isSelected
                        ? "border-primary bg-primary/18 text-foreground"
                        : "border-border/75 bg-surface-2/85 text-foreground hover:border-primary/35 hover:bg-surface-3/85",
                    )}
                    onClick={() => onSelectEstimate(isSelected ? null : value)}
                  >
                    {value}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {canManageRound ? (
        <Button disabled={disabled || !selectedFinalEstimate} onClick={onFinalizeTask}>
          Finalize task
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          Waiting for facilitator to choose and finalize the estimate.
        </p>
      )}
    </div>
  );
}
