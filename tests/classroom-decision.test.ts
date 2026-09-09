import { describe, expect, it } from "vitest";
import { decisionElapsed, summarizeDecisions, type DecisionOutcome } from "@/lib/classroom-decision";
import { transitionLesson } from "@/lib/classroom";
const outcome = (choice: DecisionOutcome["choice"], elapsedMs: number | null, reason: string | null = "submitted"): DecisionOutcome => ({ entered: true, choice, elapsedMs, reason, submittedAt: reason ? 1 : null });
describe("classroom decision timing and honest denominators", () => {
  it("freezes a paused decision independently of the stage clock and clamps expiry", () => {
    const clock = { startedAt: 0, runningSince: 5000, elapsedMs: 30000, closedAt: null, closeReason: null };
    expect(decisionElapsed(clock, 10000)).toBe(35000);
    expect(decisionElapsed({ ...clock, runningSince: null }, 999999)).toBe(30000);
    expect(decisionElapsed(clock, 999999)).toBe(180000);
  });
  it("separates pending, no-answer and valid choices without converting timeout to D", () => {
    const stats = summarizeDecisions([outcome("C", 29999), outcome("D", 30000), outcome(null, 180000, "timeout"), outcome(null, null, null), { ...outcome(null, null, null), entered: false }]);
    expect(stats).toMatchObject({ total: 4, submitted: 2, pending: 1, noAnswer: 1, cd: 2, cdPercent: 100, cdCohortPercent: 50 });
    expect(stats.choices[3]).toMatchObject({ count: 1, percent: 50 });
    expect(stats.bins.map(bin => bin.count)).toEqual([1, 1, 0, 0, 0, 0]);
  });
  it("has no fabricated results or division by zero in empty classes", () => {
    expect(summarizeDecisions([])).toMatchObject({ total: 0, submitted: 0, cdPercent: 0, cdCohortPercent: 0 });
    expect(summarizeDecisions([outcome("A", 179999)]).bins[5].count).toBe(1);
  });
  it("starts only during the running role decision stage", () => {
    const clock = { status: "RUNNING" as const, stage: 2, durationMs: 360000, remainingMs: 300000, deadline: 999999 };
    expect(transitionLesson(clock, { action: "decision-start" }, 1)).toEqual(clock);
    expect(() => transitionLesson({ ...clock, status: "PAUSED" }, { action: "decision-start" }, 1)).toThrow();
    expect(() => transitionLesson({ ...clock, stage: 1 }, { action: "decision-start" }, 1)).toThrow();
  });
});
