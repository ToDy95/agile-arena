import {
  PLANNING_FINAL_ESTIMATE_VALUES,
  type PlanningEstimate,
  type PlanningFinalEstimateValue,
  type PlanningMetricValue,
  type PlanningVoteValue,
} from "@/lib/types/domain";

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

function isMetricValue(value: PlanningMetricValue | null): value is PlanningMetricValue {
  return typeof value === "number";
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

export type PlanningStoryPointSummary = {
  lowerBound: number | null;
  average: number | null;
  upperBound: number | null;
  suggestedEstimate: PlanningFinalEstimateValue | null;
};

export type StoryPointInterpretation = {
  emoji: string;
  label: string;
  description: string;
};

const NUMERIC_FINAL_ESTIMATE_VALUES = PLANNING_FINAL_ESTIMATE_VALUES.filter((value) =>
  /^\d+$/.test(value),
);

export function calculatePlanningAverages(values: PlanningEstimate[]): PlanningAverages {
  return {
    storyPoints: calculateVoteAverage(values.map((value) => value.storyPoints)),
    complexity: calculateNumericAverage(
      values.map((value) => value.complexity).filter(isMetricValue),
    ),
    timeConsuming: calculateNumericAverage(
      values.map((value) => value.timeConsuming).filter(isMetricValue),
    ),
  };
}

function findNearestEstimateValue(average: number): PlanningFinalEstimateValue | null {
  if (NUMERIC_FINAL_ESTIMATE_VALUES.length === 0) {
    return null;
  }

  let best = NUMERIC_FINAL_ESTIMATE_VALUES[0];
  let bestDistance = Math.abs(Number(best) - average);

  NUMERIC_FINAL_ESTIMATE_VALUES.slice(1).forEach((candidate) => {
    const candidateDistance = Math.abs(Number(candidate) - average);

    if (candidateDistance < bestDistance) {
      best = candidate;
      bestDistance = candidateDistance;
      return;
    }

    if (candidateDistance === bestDistance && Number(candidate) > Number(best)) {
      best = candidate;
    }
  });

  return best;
}

export function calculateStoryPointSummary(values: PlanningVoteValue[]): PlanningStoryPointSummary {
  const numericVotes = values.map(parseNumericVote).filter((vote): vote is number => vote !== null);
  const average = calculateNumericAverage(numericVotes);

  if (numericVotes.length === 0) {
    return {
      lowerBound: null,
      average,
      upperBound: null,
      suggestedEstimate: null,
    };
  }

  return {
    lowerBound: Math.min(...numericVotes),
    average,
    upperBound: Math.max(...numericVotes),
    suggestedEstimate: average === null ? null : findNearestEstimateValue(average),
  };
}

export function resolveFinalEstimate(
  suggestedEstimate: PlanningFinalEstimateValue | null,
  manualOverride: PlanningFinalEstimateValue | null,
): PlanningFinalEstimateValue | null {
  return manualOverride ?? suggestedEstimate;
}

export function getStoryPointInterpretation(
  estimate: PlanningFinalEstimateValue | null,
): StoryPointInterpretation {
  if (!estimate) {
    return {
      emoji: "🕒",
      label: "Awaiting reveal",
      description: "Reveal votes to see the shared estimate.",
    };
  }

  if (estimate === "?") {
    return {
      emoji: "🧭",
      label: "Needs discussion",
      description: "Unknown scope or requirements. Align before deciding points.",
    };
  }

  const numericEstimate = Number(estimate);

  if (numericEstimate <= 1) {
    return {
      emoji: "✅",
      label: "Easy",
      description: "Trivial or near-trivial scope.",
    };
  }

  if (numericEstimate <= 2) {
    return {
      emoji: "🟢",
      label: "Small",
      description: "Straightforward with low complexity.",
    };
  }

  if (numericEstimate <= 3) {
    return {
      emoji: "🔧",
      label: "Medium",
      description: "Moderate effort with a few moving parts.",
    };
  }

  if (numericEstimate <= 5) {
    return {
      emoji: "⏳",
      label: "Time-consuming",
      description: "Larger effort that may need more implementation time.",
    };
  }

  if (numericEstimate <= 8) {
    return {
      emoji: "🧠",
      label: "Complex",
      description: "Multiple dependencies or cross-cutting concerns.",
    };
  }

  return {
    emoji: "⚠️",
    label: "Risky / split candidate",
    description: "High risk estimate. Consider splitting before implementation.",
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
