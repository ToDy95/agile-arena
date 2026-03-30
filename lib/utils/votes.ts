import type { PlanningVoteValue } from "@/lib/types/domain";

export function parseNumericVote(value: PlanningVoteValue): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

export function calculateVoteAverage(values: PlanningVoteValue[]): number | null {
  const numericVotes = values
    .map(parseNumericVote)
    .filter((vote): vote is number => vote !== null);

  if (numericVotes.length === 0) {
    return null;
  }

  const total = numericVotes.reduce((sum, vote) => sum + vote, 0);
  return total / numericVotes.length;
}

export function formatVoteAverage(average: number | null): string {
  if (average === null) {
    return "-";
  }

  return Number.isInteger(average) ? String(average) : average.toFixed(1);
}
