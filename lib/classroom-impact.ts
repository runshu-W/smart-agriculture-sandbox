export const IMPACT_SCRIPT = {
  news: "某平台宣布AI数字主播全面上线，24小时直播，成本仅真人1/10",
  farmer: "你们直播怎么没人看了？我这批瓜等着卖呢，再没人买就烂地里了！",
  team: ["赶紧上AI替代真人！", "AI没有人情味，西瓜卖的是故事和信任！"],
} as const;
export const IMPACT_REGIONS = { audience: "直播间人数", news: "AI上线新闻", farmer: "张大叔来电", team: "团队分歧" } as const;
export type ImpactRegion = keyof typeof IMPACT_REGIONS;
export type ImpactClock = { startedAt: number | null; runningSince: number | null; elapsedMs: number };
export type ImpactObservation = { region: ImpactRegion; kind: "view" | "dwell"; atMs: number; durationMs: number };
export function impactTime(clock: ImpactClock, now: number) {
  return Math.max(0, clock.elapsedMs + (clock.runningSince === null ? 0 : Math.max(0, now - clock.runningSince)));
}
export function impactScene(ms: number, started = true) {
  const points = [[2000, 3000], [3000, 2500], [4400, 1800], [5800, 1200], [7200, 800], [8600, 400], [10000, 200]];
  let audience = 3000;
  for (let i = 1; i < points.length; i++) {
    if (ms < points[i - 1][0]) break;
    const ratio = Math.min(1, (ms - points[i - 1][0]) / (points[i][0] - points[i - 1][0]));
    audience = Math.round(points[i - 1][1] + (points[i][1] - points[i - 1][1]) * ratio);
  }
  return { audience: started ? audience : 3000, news: started, falling: started && ms >= 2000, settled: started && ms >= 10000,
    calling: started && ms >= 12000 && ms < 13200, farmer: started && ms >= 12000, speaking: started && ms >= 13200 && ms < 22000,
    team: started && ms >= 20000, secondMessage: started && ms >= 21500, observing: started && ms >= 26000 };
}
