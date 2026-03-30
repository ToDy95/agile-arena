import type { PlanningEstimate, PlanningVoteValue } from "@/lib/types/domain";

export function parseNumericVote(value: PlanningVoteValue): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

export function calculateVoteAverage(values: PlanningVoteValue[]): number | null {
  const numericVotes = values.map(parseNumericVote).filter((vote): vote is number => vote !== null);

  return calculateNumericAverage(numericVotes);
}

function calculateNumericAverage(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, vote) => sum + vote, 0);
  return total / values.length;
}

export function formatVoteAverage(average: number | null): string {
  if (average === null) {
    return "-";
  }

  return Number.isInteger(average) ? String(average) : average.toFixed(1);
}

export type PlanningAverages = {
  storyPoints: number | null;
  complexity: number | null;
  timeConsuming: number | null;
};

export function calculatePlanningAverages(values: PlanningEstimate[]): PlanningAverages {
  return {
    storyPoints: calculateVoteAverage(values.map((value) => value.storyPoints)),
    complexity: calculateNumericAverage(values.map((value) => value.complexity)),
    timeConsuming: calculateNumericAverage(values.map((value) => value.timeConsuming)),
  };
}

export function derivePlanningMood(averages: PlanningAverages): string {
  if (
    averages.storyPoints === null ||
    averages.complexity === null ||
    averages.timeConsuming === null
  ) {
    return "Need more votes";
  }

  if (averages.storyPoints >= 13) {
    return "Likely needs splitting";
  }

  if (averages.timeConsuming >= 4.1 && averages.complexity <= 3) {
    return "Time-heavy";
  }

  if (averages.complexity >= 4.2 && averages.storyPoints <= 5) {
    return "Complex but small";
  }

  if (averages.storyPoints >= 8 || averages.complexity >= 4 || averages.timeConsuming >= 4) {
    return "Needs discussion";
  }

  if (averages.storyPoints <= 2 && averages.complexity <= 2 && averages.timeConsuming <= 2) {
    return "Easy";
  }

  return "Moderate effort";
}
