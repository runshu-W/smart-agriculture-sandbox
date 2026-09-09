import { describe, expect, it } from "vitest";
import { summarizeImpact, type ImpactPerson } from "@/lib/impact-summary";
const person = (overrides: Partial<ImpactPerson> = {}): ImpactPerson => ({ id: "one", name: "同学", synced: true, entryMs: 0, observations: [], ...overrides });
describe("classroom impact statistics", () => {
  it("never fabricates values for zero or incomplete samples", () => {
    expect(summarizeImpact([], 40000, true, false)).toMatchObject({ total: 0, average: null, waitRate: null });
    expect(summarizeImpact([person({ synced: false })], 40000, true, false)).toMatchObject({ missing: 1, average: null, waitRate: null });
    expect(summarizeImpact([person()], 40000, false, false).average).toBeNull();
  });
  it("counts acknowledged no-action separately from missing records", () => {
    const data = summarizeImpact([person(), person({ id: "two", synced: false })], 40000, true, true);
    expect(data).toMatchObject({ uploaded: 1, samples: 1, waiting: 1, waitRate: 100 });
    expect(data.details?.[0]).toMatchObject({ waitSeconds: 14, lowerBound: true, emotion: 3.8 });
    expect(data.details?.[1].emotion).toBeNull();
  });
  it("measures after the observation start, handles exact five seconds and late arrivals", () => {
    const data = summarizeImpact([person({ observations: [{ kind: "view", region: "news", atMs: 31000, durationMs: 0 }] }), person({ id: "late", entryMs: 39000 })], 40000, true, true);
    expect(data).toMatchObject({ uploaded: 2, samples: 1, waiting: 0, waitRate: 0 });
    expect(data.details?.[0].waitSeconds).toBe(5);
    expect(data.details?.[1].sample).toBe(false);
  });
  it("deduplicates concern counts and merges overlapping dwell intervals across batches/devices", () => {
    const data = summarizeImpact([person({ observations: [
      { kind: "view", region: "news", atMs: 27000, durationMs: 0 }, { kind: "view", region: "news", atMs: 27500, durationMs: 0 },
      { kind: "dwell", region: "news", atMs: 30000, durationMs: 4000 }, { kind: "dwell", region: "news", atMs: 32000, durationMs: 3000 },
      { kind: "view", region: "team", atMs: 45000, durationMs: 0 },
    ] })], 40000, true, true);
    expect(data.top[0]).toMatchObject({ region: "news", count: 1, percent: 100 });
    expect(data.details?.[0].dwell.news).toBe(6);
    expect(data.details?.[0].concerns).not.toContain("team");
    expect(data.details?.[0].repeatClicks).toBe(1);
    expect(data.details?.[0].emotion).toBe(1.7);
  });
  it("keeps private names and records out of screen responses", () => {
    const data = summarizeImpact([person({ name: "Private name" })], 50000, true, false);
    expect(data.details).toBeUndefined(); expect(JSON.stringify(data)).not.toContain("Private name");
  });
  it("uses bounded deterministic teaching values with explicit denominators", () => {
    const observations = Array.from({ length: 80 }, (_, i) => ({ kind: "view" as const, region: (i % 4 < 2 ? "news" : "farmer") as "news" | "farmer", atMs: 50000 + i * 100, durationMs: 0 }));
    const data = summarizeImpact([person({ observations })], 70000, true, true);
    expect(data.average).toBe(10); expect(data.top[0].percent).toBe(100); expect(data.top[1].percent).toBe(100);
    expect(data).toEqual(summarizeImpact([person({ observations })], 70000, true, true));
  });
});
