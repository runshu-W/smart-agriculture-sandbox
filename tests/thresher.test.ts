import { describe, expect, it } from "vitest";
import { angularDelta, calculateThresherScore, normalizeAngle } from "@/lib/game/thresher";

describe("thresher interaction", () => {
  it("normalizes rotation and crosses zero without a jump", () => {
    expect(normalizeAngle(-10)).toBe(350);
    expect(angularDelta(350, 10)).toBe(20);
    expect(angularDelta(10, 350)).toBe(-20);
  });

  it("awards full score for sustained operation and a first correct answer", () => {
    expect(calculateThresherScore({ effectiveDurationMs: 10_000, narrationCompleted: true, answers: ["B"] })).toEqual({
      score: 100,
      firstCorrect: true,
      finalCorrect: true,
      completed: true,
    });
  });

  it("keeps feedback psychologically safe and rewards a corrected retry", () => {
    expect(calculateThresherScore({ effectiveDurationMs: 12_000, narrationCompleted: true, answers: ["A", "B"] }).score).toBe(90);
  });
});
