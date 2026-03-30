import { describe, expect, it } from "vitest";

import {
  calculatePlanningAverages,
  calculateVoteAverage,
  derivePlanningMood,
  formatVoteAverage,
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
});
