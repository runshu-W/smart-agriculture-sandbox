import { describe, expect, it } from "vitest";
import { mapFramework } from "@/lib/server/framework-rules";
import { summarizeFramework, type FrameworkProgress } from "@/lib/classroom-framework";
describe("framework mapping and classroom learning rates", () => {
  it("checks all three handbook mappings", () => {
    for (const [event, layer] of [["ai", "macro"], ["farmer", "micro"], ["hesitation", "self"]] as const) expect(mapFramework({}, event, layer)[event]).toMatchObject({ solved: true, firstCorrect: true, attempts: 1 });
  });
  it("allows repeated wrong attempts, preserving first-attempt accuracy after mastery", () => {
    let progress: FrameworkProgress = {};
    for (let index = 0; index < 10; index++) progress = mapFramework(progress, "ai", "self");
    progress = mapFramework(progress, "ai", "macro");
    expect(progress.ai).toMatchObject({ attempts: 11, firstCorrect: false, solved: true });
    expect(mapFramework(progress, "ai", "micro")).toBe(progress);
  });
  it("uses people rather than attempt counts and excludes untouched students from accuracy", () => {
    const first = mapFramework(mapFramework({}, "ai", "self"), "ai", "macro");
    const second = mapFramework({}, "ai", "self");
    const stats = summarizeFramework([first, second, {}]);
    expect(stats).toMatchObject({ total: 3, attempted: 2, untouched: 1, completed: 0 });
    expect(stats.events[0]).toMatchObject({ attempted: 2, solved: 1, pending: 1, masteryRate: 50, firstCorrectRate: 0 });
    expect(stats.events[1]).toMatchObject({ attempted: 0, pending: 3, masteryRate: null, firstCorrectRate: null });
  });
  it("counts fully mastered students and leaves empty classes without invented percentages", () => {
    const complete = mapFramework(mapFramework(mapFramework({}, "ai", "macro"), "farmer", "micro"), "hesitation", "self");
    expect(summarizeFramework([complete, {}])).toMatchObject({ total: 2, attempted: 1, completed: 1 });
    expect(summarizeFramework([]).events.every(event => event.masteryRate === null)).toBe(true);
  });
});
