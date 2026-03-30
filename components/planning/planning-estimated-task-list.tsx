"use client";

import { motion } from "motion/react";

import { Card } from "@/components/ui/card";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getItemRevealVariants } from "@/lib/animations/presets";
import type { PlanningFinalizedTask } from "@/lib/types/domain";

type PlanningEstimatedTaskListProps = {
  tasks: PlanningFinalizedTask[];
};

function formatFinalEstimate(estimate: PlanningFinalizedTask["finalEstimate"]) {
  if (estimate === "?") {
    return "?";
  }

  return `${estimate} SP`;
}

function formatBounds(task: PlanningFinalizedTask): string {
  const lower = task.lowerBound === null ? "-" : String(task.lowerBound);
  const avg =
    task.average === null
      ? "-"
      : Number.isInteger(task.average)
        ? String(task.average)
        : task.average.toFixed(1);
  const upper = task.upperBound === null ? "-" : String(task.upperBound);

  return `${lower} / ${avg} / ${upper}`;
}

export function PlanningEstimatedTaskList({ tasks }: PlanningEstimatedTaskListProps) {
  const { reducedMotion } = useMotionPreferences();
  const reveal = getItemRevealVariants(reducedMotion);

  return (
    <motion.div variants={reveal} initial="hidden" animate="show" layout>
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Estimated Tasks This Session
          </p>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>

        {tasks.length === 0 ? (
          <p className="rounded-lg border border-border/75 bg-surface-1/70 px-3 py-2 text-sm text-muted-foreground">
            No finalized tasks yet. Reveal votes, choose final estimate, and finalize.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border/75 bg-surface-1/75 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {task.taskUrl ? (
                    <a
                      href={task.taskUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {task.taskKey ?? task.taskTitle}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">
                      {task.taskKey ?? task.taskTitle}
                    </p>
                  )}
                  <span className="rounded-full border border-primary/35 bg-primary/12 px-2 py-0.5 text-xs font-semibold text-foreground">
                    {formatFinalEstimate(task.finalEstimate)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {task.interpretationEmoji} {task.interpretationLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bounds (L/A/U): {formatBounds(task)} • Finalized by {task.finalizedByName}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
