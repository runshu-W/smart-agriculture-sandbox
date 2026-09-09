import { describe, expect, it } from "vitest";
import { CLASSROOM_STAGES, clockText, remainingTime, transitionLesson, type LessonClock } from "@/lib/classroom";

const waiting: LessonClock = { status: "WAITING", stage: 0, durationMs: 420000, remainingMs: 420000, deadline: null };
describe("classroom time and stage authority", () => {
  it("preserves the accepted 40 minute teaching plan", () => expect(CLASSROOM_STAGES.reduce((sum, item) => sum + item.minutes, 0)).toBe(40));
  it("starts once and derives time from the server deadline", () => {
    const running = transitionLesson(waiting, { action: "start" }, 1000);
    expect(remainingTime(running, 6000)).toBe(415000);
    expect(() => transitionLesson(running, { action: "start" }, 7000)).toThrow();
  });
  it("freezes time on pause and resumes from the remainder after a refresh", () => {
    const paused = transitionLesson(transitionLesson(waiting, { action: "start" }, 0), { action: "pause" }, 12345);
    const restored = JSON.parse(JSON.stringify(paused));
    expect(remainingTime(restored, 999999)).toBe(407655);
    const resumed = transitionLesson(restored, { action: "resume" }, 999999);
    expect(remainingTime(resumed, 1000999)).toBe(406655);
  });
  it("does not advance or fabricate time when the deadline passes", () => {
    const running = transitionLesson(waiting, { action: "start" }, 0);
    expect(remainingTime(running, 500000)).toBe(0);
    expect(running.stage).toBe(0);
    const paused = transitionLesson(running, { action: "pause" }, 500000);
    expect(() => transitionLesson(paused, { action: "resume" }, 600000)).toThrow();
  });
  it("switches stages with their own duration, preserving paused status", () => {
    const paused = { ...waiting, status: "PAUSED" as const, remainingMs: 10000 };
    const selected = transitionLesson(paused, { action: "stage", stage: 4 }, 5000);
    expect(selected).toMatchObject({ status: "PAUSED", stage: 4, remainingMs: 720000, deadline: null });
    expect(() => transitionLesson(waiting, { action: "stage", stage: 2 }, 0)).toThrow();
    expect(() => transitionLesson(paused, { action: "stage", stage: 6 }, 0)).toThrow();
  });
  it("resets only the timer and keeps the current stage", () => {
    const running = transitionLesson(waiting, { action: "start" }, 0);
    const reset = transitionLesson(running, { action: "reset", minutes: 3 }, 2000);
    expect(reset).toMatchObject({ stage: 0, durationMs: 180000, remainingMs: 180000, deadline: 182000 });
    expect(() => transitionLesson(running, { action: "reset", minutes: 0 }, 0)).toThrow();
  });
  it("ended classrooms are immutable", () => {
    const ended = transitionLesson(waiting, { action: "end" }, 0);
    for (const action of ["start", "pause", "resume", "reset", "end"] as const) expect(() => transitionLesson(ended, { action }, 1000)).toThrow();
  });
  it("never displays negative time", () => { expect(clockText(-4)).toBe("00:00"); expect(clockText(119999)).toBe("02:00"); });
});
