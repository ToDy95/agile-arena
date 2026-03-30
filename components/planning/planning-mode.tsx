import { useMemo } from "react";

import type { RoomPlayer } from "@/components/room/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PLANNING_DECK } from "@/lib/constants/planning";
import type { PlanningVoteValue } from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";
import { calculateVoteAverage, formatVoteAverage } from "@/lib/utils/votes";

type PlanningModeProps = {
  players: RoomPlayer[];
  taskInput: string;
  issueKey: string | null;
  votes: ReadonlyMap<string, PlanningVoteValue>;
  isRevealed: boolean;
  myVote: PlanningVoteValue | null;
  disabled?: boolean;
  onTaskChange: (value: string) => void;
  onVoteSelect: (value: PlanningVoteValue) => void;
  onRevealVotes: () => void;
  onResetRound: () => void;
  onClearTask: () => void;
};

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
}: PlanningModeProps) {
  const votedCount = useMemo(
    () => players.filter((player) => votes.has(player.userId)).length,
    [players, votes],
  );

  const averageLabel = useMemo(() => {
    const allVotes = Array.from(votes.values());
    return formatVoteAverage(calculateVoteAverage(allVotes));
  }, [votes]);

  const statusLabel = isRevealed
    ? "Revealed"
    : votedCount === players.length && players.length > 0
      ? "Ready to reveal"
      : "Waiting for votes";

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Story / Task</p>
          <Input
            value={taskInput}
            placeholder="Paste Jira URL or type task title"
            disabled={disabled}
            onChange={(event) => onTaskChange(event.target.value)}
          />
          <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
            <span>Parsed key: {issueKey ?? "-"}</span>
            <span className="text-zinc-600">|</span>
            <span>Status: {statusLabel}</span>
            <span className="text-zinc-600">|</span>
            <span>
              Votes: {votedCount}/{players.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Round Controls</p>
          <p className="text-sm text-zinc-300">Average: {isRevealed ? averageLabel : "Hidden"}</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <Button
              variant="secondary"
              disabled={disabled || isRevealed || votedCount === 0}
              onClick={onRevealVotes}
            >
              Reveal votes
            </Button>
            <Button variant="ghost" disabled={disabled} onClick={onResetRound}>
              Reset round
            </Button>
            <Button variant="ghost" disabled={disabled} onClick={onClearTask}>
              Clear task
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Vote Deck</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
          {PLANNING_DECK.map((value) => {
            const isSelected = myVote === value;

            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                className={cn(
                  "h-14 rounded-xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-sky-400 bg-sky-400/20 text-sky-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500",
                )}
                onClick={() => onVoteSelect(value)}
              >
                {value}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
