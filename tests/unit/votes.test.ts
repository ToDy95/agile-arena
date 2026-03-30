import { describe, expect, it } from "vitest";

import {
  calculatePlanningAverages,
  calculateStoryPointSummary,
  calculateVoteAverage,
  derivePlanningMood,
  formatVoteAverage,
  getStoryPointInterpretation,
  resolveFinalEstimate,
} from "@/lib/utils/votes";

describe("calculateVoteAverage", () => {
  it("calculates average using only numeric votes", () => {
    const average = calculateVoteAverage(["1", "5", "?", "taco", "8"]);

    expect(average).toBeCloseTo(4.666, 2);
    expect(formatVoteAverage(average)).toBe("4.7");
  });

  it("returns null when no numeric votes exist", () => {
    const average = calculateVoteAverage(["?", "taco"]);

    expect(average).toBeNull();
    expect(formatVoteAverage(average)).toBe("-");
  });

  it("calculates averages for story points, complexity, and time", () => {
    const averages = calculatePlanningAverages([
      {
        storyPoints: "3",
        complexity: 2,
        timeConsuming: 4,
      },
      {
        storyPoints: "5",
        complexity: 4,
        timeConsuming: 5,
      },
      {
        storyPoints: "?",
        complexity: 3,
        timeConsuming: 3,
      },
    ]);

    expect(averages.storyPoints).toBeCloseTo(4, 2);
    expect(averages.complexity).toBeCloseTo(3, 2);
    expect(averages.timeConsuming).toBeCloseTo(4, 2);
  });

  it("derives a task mood from revealed averages", () => {
    const mood = derivePlanningMood({
      storyPoints: 8,
      complexity: 4.2,
      timeConsuming: 3.9,
    });

    expect(mood).toBe("Needs discussion");
  });

  it("computes lower/average/upper and suggested story point summary", () => {
    const summary = calculateStoryPointSummary(["2", "3", "5", "?", "taco"]);

    expect(summary.lowerBound).toBe(2);
    expect(summary.upperBound).toBe(5);
    expect(summary.average).toBeCloseTo(3.3, 1);
    expect(summary.suggestedEstimate).toBe("3");
  });

  it("resolves final estimate from suggested value or manual override", () => {
    expect(resolveFinalEstimate("3", null)).toBe("3");
    expect(resolveFinalEstimate("3", "5")).toBe("5");
  });

  it("returns story point interpretation details", () => {
    expect(getStoryPointInterpretation("5").label).toBe("Time-consuming");
    expect(getStoryPointInterpretation("?").label).toBe("Needs discussion");
    expect(getStoryPointInterpretation(null).label).toBe("Awaiting reveal");
  });
});
