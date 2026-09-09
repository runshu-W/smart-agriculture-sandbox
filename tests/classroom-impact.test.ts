import { describe, expect, it } from "vitest";
import { impactScene, impactTime } from "@/lib/classroom-impact";
import { transitionLesson } from "@/lib/classroom";
describe("industry impact scene", () => {
  it("opens news before the audience falls and ends at exactly 200", () => {
    expect(impactScene(0, false)).toMatchObject({ audience: 3000, news: false });
    expect(impactScene(0)).toMatchObject({ audience: 3000, news: true });
    const times = [2000, 3000, 4400, 5800, 7200, 8600, 10000];
    expect(times.map(time => impactScene(time).audience)).toEqual([3000, 2500, 1800, 1200, 800, 400, 200]);
    expect(impactScene(26000).audience).toBe(200);
    expect(impactScene(3600).audience).toBeLessThan(2500);
    expect(impactScene(3600).audience).toBeGreaterThan(1800);
  });
  it("reveals the call, ordered messages, and observation prompt at the authored times", () => {
    expect(impactScene(11999).farmer).toBe(false);
    expect(impactScene(12000)).toMatchObject({ farmer: true, calling: true, speaking: false });
    expect(impactScene(13200)).toMatchObject({ calling: false, speaking: true });
    expect(impactScene(20000)).toMatchObject({ team: true, secondMessage: false });
    expect(impactScene(21500).secondMessage).toBe(true);
    expect(impactScene(25999).observing).toBe(false);
    expect(impactScene(26000).observing).toBe(true);
  });
  it("uses the server clock, preserves paused elapsed time and guards negative drift", () => {
    expect(impactTime({ startedAt: 100, runningSince: 2000, elapsedMs: 4000 }, 6000)).toBe(8000);
    expect(impactTime({ startedAt: 100, runningSince: null, elapsedMs: 4000 }, 600000)).toBe(4000);
    expect(impactTime({ startedAt: 100, runningSince: 2000, elapsedMs: 4000 }, 1900)).toBe(4000);
  });
  it("only permits teachers' impact command during the running first stage", () => {
    const clock = { status: "RUNNING" as const, stage: 0, durationMs: 420000, remainingMs: 420000, deadline: 420000 };
    expect(transitionLesson(clock, { action: "impact-start" }, 3000)).toEqual(clock);
    for (const status of ["WAITING", "PAUSED", "ENDED"] as const) expect(() => transitionLesson({ ...clock, status }, { action: "impact-start" }, 3000)).toThrow();
    expect(() => transitionLesson({ ...clock, stage: 1 }, { action: "impact-start" }, 3000)).toThrow();
  });
});
