import { describe, expect, it } from "vitest";

import { calculateVoteAverage, formatVoteAverage } from "@/lib/utils/votes";

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
});
