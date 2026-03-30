"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { PlanningEstimatedTaskList } from "@/components/planning/planning-estimated-task-list";
import { PlanningLegend } from "@/components/planning/planning-legend";
import { PlanningMetricSelector } from "@/components/planning/planning-metric-selector";
import { PlanningResultPicker } from "@/components/planning/planning-result-picker";
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
import type {
  PlanningEstimate,
  PlanningFinalEstimateValue,
  PlanningFinalizedTask,
  PlanningMetricValue,
  PlanningVoteValue,
} from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";
import {
  calculateStoryPointSummary,
  formatVoteAverage,
  getStoryPointInterpretation,
} from "@/lib/utils/votes";

type PlanningModeProps = {
  players: RoomPlayer[];
  taskInput: string;
  issueKey: string | null;
  votes: ReadonlyMap<string, PlanningEstimate>;
  isRevealed: boolean;
  myVote: PlanningEstimate | null;
  canManageRound: boolean;
  isCurrentUserFacilitator: boolean;
  facilitatorParticipates: boolean;
  manualFinalEstimate: PlanningFinalEstimateValue | null;
  estimatedTasks: PlanningFinalizedTask[];
  disabled?: boolean;
  onTaskChange: (value: string) => void;
  onVoteSelect: (value: PlanningEstimate) => void;
  onRevealVotes: () => void;
  onResetRound: () => void;
  onClearTask: () => void;
  onNextTask: () => void;
  onFinalizeTask: (payload: {
    finalEstimate: PlanningFinalEstimateValue;
    lowerBound: number | null;
    average: number | null;
    upperBound: number | null;
    interpretationLabel: string;
    interpretationEmoji: string;
  }) => void;
  onFacilitatorParticipationChange: (value: boolean) => void;
  onManualFinalEstimateChange: (value: PlanningFinalEstimateValue | null) => void;
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
  canManageRound,
  isCurrentUserFacilitator,
  facilitatorParticipates,
  manualFinalEstimate,
  estimatedTasks,
  disabled = false,
  onTaskChange,
  onVoteSelect,
  onRevealVotes,
  onResetRound,
  onClearTask,
  onNextTask,
  onFinalizeTask,
  onFacilitatorParticipationChange,
  onManualFinalEstimateChange,
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

    if (myVote.complexity !== null) {
      setComplexityVote(myVote.complexity);
    }

    if (myVote.timeConsuming !== null) {
      setTimeVote(myVote.timeConsuming);
    }
  }, [myVote]);

  const estimatingPlayers = useMemo(
    () => players.filter((player) => !player.isOwner || facilitatorParticipates),
    [facilitatorParticipates, players],
  );
  const estimatorIds = useMemo(
    () => new Set(estimatingPlayers.map((player) => player.userId)),
    [estimatingPlayers],
  );
  const estimatorCount = estimatingPlayers.length;
  const votedCount = useMemo(
    () => estimatingPlayers.filter((player) => votes.has(player.userId)).length,
    [estimatingPlayers, votes],
  );

  const revealedVotes = useMemo(
    () =>
      Array.from(votes.entries())
        .filter(([userId]) => estimatorIds.has(userId))
        .map(([, estimate]) => estimate),
    [estimatorIds, votes],
  );
  const storyPointSummary = useMemo(
    () => calculateStoryPointSummary(revealedVotes.map((estimate) => estimate.storyPoints)),
    [revealedVotes],
  );
  const averageLabel = useMemo(
    () => formatVoteAverage(storyPointSummary.average),
    [storyPointSummary.average],
  );

  const lowerEstimate =
    storyPointSummary.lowerBound === null
      ? null
      : (String(storyPointSummary.lowerBound) as PlanningFinalEstimateValue);
  const upperEstimate =
    storyPointSummary.upperBound === null
      ? null
      : (String(storyPointSummary.upperBound) as PlanningFinalEstimateValue);

  const statusLabel = isRevealed
    ? "Revealed"
    : estimatorCount === 0
      ? "Need participants"
      : votedCount === estimatorCount
        ? "Ready to reveal"
        : "Waiting for votes";

  const revealReady =
    !isRevealed &&
    votedCount > 0 &&
    estimatorCount > 0 &&
    (votedCount === estimatorCount || votedCount >= Math.ceil(estimatorCount * 0.8));

  const showFacilitatorPassMode = isCurrentUserFacilitator && !facilitatorParticipates;
  const showVoteInputs = !showFacilitatorPassMode;
  const hideSecondaryMetrics = !showVoteInputs || myVote?.storyPoints === "taco";

  const handleStoryPointSelect = (storyPoints: PlanningVoteValue) => {
    const isPass = storyPoints === "taco";

    onVoteSelect({
      storyPoints,
      complexity: isPass ? null : complexityVote,
      timeConsuming: isPass ? null : timeVote,
    });
  };

  const handleComplexityChange = (value: PlanningMetricValue) => {
    setComplexityVote(value);

    if (!myVote || isRevealed || myVote.storyPoints === "taco") {
      return;
    }

    onVoteSelect({
      ...myVote,
      complexity: value,
      timeConsuming: myVote.timeConsuming ?? timeVote,
    });
  };

  const handleTimeChange = (value: PlanningMetricValue) => {
    setTimeVote(value);

    if (!myVote || isRevealed || myVote.storyPoints === "taco") {
      return;
    }

    onVoteSelect({
      ...myVote,
      complexity: myVote.complexity ?? complexityVote,
      timeConsuming: value,
    });
  };

  const handleFinalizeTask = () => {
    if (!manualFinalEstimate) {
      return;
    }

    const interpretation = getStoryPointInterpretation(manualFinalEstimate);

    onFinalizeTask({
      finalEstimate: manualFinalEstimate,
      lowerBound: storyPointSummary.lowerBound,
      average: storyPointSummary.average,
      upperBound: storyPointSummary.upperBound,
      interpretationLabel: interpretation.label,
      interpretationEmoji: interpretation.emoji,
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
                  key={`${votedCount}-${estimatorCount}`}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={motionTransitions.fast}
                  className="font-semibold text-foreground"
                >
                  {votedCount}/{estimatorCount}
                </motion.span>
              </AnimatePresence>
            </div>
            <PlanningLegend />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border/75 bg-surface-2/80 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Round Controls
            </p>
            <PlanningResultPicker
              isRevealed={isRevealed}
              lowerEstimate={lowerEstimate}
              averageLabel={averageLabel}
              upperEstimate={upperEstimate}
              selectedFinalEstimate={manualFinalEstimate}
              canManageRound={canManageRound}
              disabled={disabled}
              onSelectEstimate={onManualFinalEstimateChange}
              onFinalizeTask={handleFinalizeTask}
            />

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <motion.div animate={revealReady ? getReadyPulseAnimation(reducedMotion) : undefined}>
                <Button
                  variant="secondary"
                  disabled={
                    disabled ||
                    isRevealed ||
                    votedCount === 0 ||
                    estimatorCount === 0 ||
                    !canManageRound
                  }
                  onClick={onRevealVotes}
                  className={cn(revealReady && "border border-primary/45")}
                >
                  Reveal votes
                </Button>
              </motion.div>

              <Button variant="ghost" disabled={disabled || !canManageRound} onClick={onResetRound}>
                Reset round
              </Button>

              <Button variant="ghost" disabled={disabled || !canManageRound} onClick={onClearTask}>
                Clear task
              </Button>

              {isRevealed && canManageRound ? (
                <Button variant="ghost" disabled={disabled} onClick={onNextTask}>
                  Next task without saving
                </Button>
              ) : null}

              {!canManageRound ? (
                <p className="text-xs text-muted-foreground">
                  Only the facilitator can reveal and finalize tasks.
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemReveal} initial="hidden" animate="show" layout>
        <Card className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Story Points</p>
            <p className="text-xs text-muted-foreground">
              {showFacilitatorPassMode
                ? "Facilitator pass mode keeps your estimate on taco and excludes you from averages."
                : "Pick story points first. Secondary metrics capture complexity and time pressure."}
            </p>
          </div>

          {isCurrentUserFacilitator ? (
            <div className="rounded-xl border border-border/75 bg-surface-1/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Facilitator Mode
                  </p>
                  <p className="text-sm text-foreground">
                    {facilitatorParticipates
                      ? "You are participating in this estimation round."
                      : "Default pass is active (taco)."}
                  </p>
                </div>
                <Button
                  variant={facilitatorParticipates ? "ghost" : "secondary"}
                  size="sm"
                  disabled={disabled}
                  onClick={() => onFacilitatorParticipationChange(!facilitatorParticipates)}
                >
                  {facilitatorParticipates ? "Return to pass mode" : "Participate in voting"}
                </Button>
              </div>
            </div>
          ) : null}

          {showVoteInputs ? (
            <>
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

              {hideSecondaryMetrics ? (
                <div className="rounded-lg border border-border/75 bg-surface-1/75 p-3 text-xs text-muted-foreground">
                  Secondary metrics are hidden while pass/taco is selected.
                </div>
              ) : (
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
              )}
            </>
          ) : (
            <div className="rounded-xl border border-primary/35 bg-primary/12 p-4 text-sm text-foreground">
              Facilitator pass mode active. Your vote defaults to{" "}
              <span className="font-semibold">taco/pass</span> and you are excluded from averages
              until you choose to participate.
            </div>
          )}
        </Card>
      </motion.div>

      <PlanningEstimatedTaskList tasks={estimatedTasks} />
    </motion.div>
  );
}
