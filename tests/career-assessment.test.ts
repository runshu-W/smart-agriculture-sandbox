import { describe, expect, it } from "vitest";
import { calculateCareerProfile } from "@/lib/game/career-assessment";

describe("career assessment", () => {
  it("calculates the same profile for the same twelve answers", () => {
    const answers = [5, 4, 5, 3, 4, 4, 5, 5, 3, 5, 4, 4];
    expect(calculateCareerProfile(answers)).toEqual(calculateCareerProfile(answers));
  });

  it("returns bounded dimensions and sorted role matches", () => {
    const profile = calculateCareerProfile(Array(12).fill(4));
    expect(Object.values(profile.dimensions).every((value) => value >= 0 && value <= 100)).toBe(true);
    expect(profile.matches).toHaveLength(5);
    expect(profile.matches.map((item) => item.score)).toEqual([...profile.matches.map((item) => item.score)].sort((a, b) => b - a));
  });
});
