"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { PlanningLegend } from "@/components/planning/planning-legend";
import { PlanningMetricSelector } from "@/components/planning/planning-metric-selector";
import { PlanningSummary } from "@/components/planning/planning-summary";
import type { RoomPlayer } from "@/components/room/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import {
  getCardInteractionProps,
  getItemRevealVariants,
  getReadyPulseAnimation,
  motionTransitions,
} from "@/lib/animations/presets";
import { PLANNING_DECK } from "@/lib/constants/planning";
import type { PlanningEstimate, PlanningMetricValue, PlanningVoteValue } from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";
import {
  calculatePlanningAverages,
  derivePlanningMood,
  formatVoteAverage,
} from "@/lib/utils/votes";

type PlanningModeProps = {
  players: RoomPlayer[];
  taskInput: string;
  issueKey: string | null;
  votes: ReadonlyMap<string, PlanningEstimate>;
  isRevealed: boolean;
  myVote: PlanningEstimate | null;
  disabled?: boolean;
  onTaskChange: (value: string) => void;
  onVoteSelect: (value: PlanningEstimate) => void;
  onRevealVotes: () => void;
  onResetRound: () => void;
  onClearTask: () => void;
  onNextTask: () => void;
};

const DEFAULT_COMPLEXITY: PlanningMetricValue = 3;
const DEFAULT_TIME: PlanningMetricValue = 3;

export function PlanningMode({
  players,
  taskInput,
  issueKey,
  votes,
  isRevealed,
  myVote,
  disabled = false,
  onTaskChange,
  onVoteSelect,
  onRevealVotes,
  onResetRound,
  onClearTask,
  onNextTask,
}: PlanningModeProps) {
  const { reducedMotion } = useMotionPreferences();
  const cardInteraction = getCardInteractionProps(reducedMotion);
  const itemReveal = getItemRevealVariants(reducedMotion);

  const [complexityVote, setComplexityVote] = useState<PlanningMetricValue>(
    myVote?.complexity ?? DEFAULT_COMPLEXITY,
  );
  const [timeVote, setTimeVote] = useState<PlanningMetricValue>(
    myVote?.timeConsuming ?? DEFAULT_TIME,
  );

  useEffect(() => {
    if (!myVote) {
      return;
    }

    setComplexityVote(myVote.complexity);
    setTimeVote(myVote.timeConsuming);
  }, [myVote]);

  const votedCount = useMemo(
    () => players.filter((player) => votes.has(player.userId)).length,
    [players, votes],
  );

  const planningAverages = useMemo(() => {
    const allVotes = Array.from(votes.values());
    return calculatePlanningAverages(allVotes);
  }, [votes]);

  const storyPointsAverageLabel = useMemo(
    () => formatVoteAverage(planningAverages.storyPoints),
    [planningAverages.storyPoints],
  );

  const complexityAverageLabel = useMemo(
    () => formatVoteAverage(planningAverages.complexity),
    [planningAverages.complexity],
  );

  const timeAverageLabel = useMemo(
    () => formatVoteAverage(planningAverages.timeConsuming),
    [planningAverages.timeConsuming],
  );

  const moodLabel = useMemo(() => derivePlanningMood(planningAverages), [planningAverages]);

  const statusLabel = isRevealed
    ? "Revealed"
    : votedCount === players.length && players.length > 0
      ? "Ready to reveal"
      : "Waiting for votes";

  const revealReady =
    !isRevealed &&
    votedCount > 0 &&
    (votedCount === players.length || votedCount >= Math.ceil(players.length * 0.8));

  const handleStoryPointSelect = (storyPoints: PlanningVoteValue) => {
    onVoteSelect({
      storyPoints,
      complexity: complexityVote,
      timeConsuming: timeVote,
    });
  };

  const handleComplexityChange = (value: PlanningMetricValue) => {
    setComplexityVote(value);

    if (!myVote || isRevealed) {
      return;
    }

    onVoteSelect({
      ...myVote,
      complexity: value,
      timeConsuming: timeVote,
    });
  };

  const handleTimeChange = (value: PlanningMetricValue) => {
    setTimeVote(value);

    if (!myVote || isRevealed) {
      return;
    }

    onVoteSelect({
      ...myVote,
      complexity: complexityVote,
      timeConsuming: value,
    });
  };

  return (
    <motion.div layout className="space-y-4">
      <motion.div variants={itemReveal} initial="hidden" animate="show" layout>
        <Card className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Story / Task</p>
            <Input
              value={taskInput}
              placeholder="Paste Jira URL or type task title"
              disabled={disabled}
              onChange={(event) => onTaskChange(event.target.value)}
            />
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Parsed key:</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={issueKey ?? "none"}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={motionTransitions.fast}
                  className="font-semibold text-foreground"
                >
                  {issueKey ?? "-"}
                </motion.span>
              </AnimatePresence>
              <span className="text-border">|</span>
              <span>Status:</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={statusLabel}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={motionTransitions.fast}
                  className="font-semibold text-foreground"
                >
                  {statusLabel}
                </motion.span>
              </AnimatePresence>
              <span className="text-border">|</span>
              <span>Votes:</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${votedCount}-${players.length}`}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={motionTransitions.fast}
                  className="font-semibold text-foreground"
                >
                  {votedCount}/{players.length}
                </motion.span>
              </AnimatePresence>
            </div>
            <PlanningLegend />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border/75 bg-surface-2/80 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Round Controls
            </p>
            <PlanningSummary
              isRevealed={isRevealed}
              storyPointsAverageLabel={storyPointsAverageLabel}
              complexityAverageLabel={complexityAverageLabel}
              timeAverageLabel={timeAverageLabel}
              moodLabel={moodLabel}
            />

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <motion.div animate={revealReady ? getReadyPulseAnimation(reducedMotion) : undefined}>
                <Button
                  variant="secondary"
                  disabled={disabled || isRevealed || votedCount === 0}
                  onClick={onRevealVotes}
                  className={cn(revealReady && "border border-primary/45")}
                >
                  Reveal votes
                </Button>
              </motion.div>

              <Button variant="ghost" disabled={disabled} onClick={onResetRound}>
                Reset round
              </Button>

              <Button variant="ghost" disabled={disabled} onClick={onClearTask}>
                Clear task
              </Button>

              <AnimatePresence initial={false}>
                {isRevealed ? (
                  <motion.div
                    key="next-task"
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={motionTransitions.fast}
                  >
                    <Button onClick={onNextTask}>Next task</Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemReveal} initial="hidden" animate="show" layout>
        <Card className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Story Points</p>
            <p className="text-xs text-muted-foreground">
              Pick the story points first. Secondary sliders capture complexity and time pressure.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
            {PLANNING_DECK.map((value) => {
              const isSelected = myVote?.storyPoints === value;

              return (
                <motion.button
                  key={value}
                  type="button"
                  disabled={disabled || isRevealed}
                  {...cardInteraction}
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          y: isSelected ? -2 : 0,
                          scale: isSelected ? 1.015 : 1,
                        }
                  }
                  transition={motionTransitions.spring}
                  className={cn(
                    "h-14 overflow-hidden rounded-xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                    isSelected
                      ? "border-primary bg-primary/18 text-foreground shadow-[0_0_0_1px_var(--arena-accent-soft),0_12px_24px_rgba(2,6,23,0.24)] dark:shadow-[0_0_0_1px_var(--arena-accent-soft),0_12px_24px_rgba(2,6,23,0.46)]"
                      : "border-border/75 bg-surface-2/85 text-foreground hover:border-primary/35 hover:bg-surface-3/85",
                  )}
                  onClick={() => handleStoryPointSelect(value)}
                >
                  {value}
                </motion.button>
              );
            })}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <PlanningMetricSelector
              label="Complexity (1-5)"
              value={complexityVote}
              disabled={disabled || isRevealed}
              onChange={handleComplexityChange}
            />
            <PlanningMetricSelector
              label="Time Consuming (1-5)"
              value={timeVote}
              disabled={disabled || isRevealed}
              onChange={handleTimeChange}
            />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
