export type ActivityClock = { startedAt: number | null; runningSince: number | null; elapsedMs: number; closedAt: number | null };
export function activityElapsed(clock: ActivityClock, now: number, limit = Infinity) { return Math.min(limit, Math.max(0, clock.elapsedMs + (clock.runningSince === null ? 0 : Math.max(0, now - clock.runningSince)))); }
export type MapSignal = { id: string; layer: "macro" | "micro" | "self"; text: string; priority: "now" | "watch" };
export type MapCard = { studentId: string; name: string; group: number | null; signals: MapSignal[]; version: number; submitted: boolean; nominations: number };
export function mapComplete(signals: MapSignal[]) { return ["macro", "micro", "self"].every(layer => signals.some(signal => signal.layer === layer && signal.text.trim())); }
export function mapPhase(elapsed: number) { return elapsed < 180000 ? 0 : elapsed < 600000 ? 1 : 2; }
export const MAP_PHASES = ["独立填写", "小组研讨", "全班展示"];
export function assignGroups(ids: string[]) { const count = Math.max(1, Math.ceil(ids.length / 5)); return Object.fromEntries(ids.map((id, index) => [id, index % count + 1])); }
export function groupRepresentatives(cards: MapCard[]) {
  const groups = [...new Set(cards.map(card => card.group).filter((group): group is number => group !== null))].sort((a, b) => a - b);
  return groups.flatMap(group => { const candidates = cards.filter(card => card.group === group && card.submitted && card.nominations > 0).sort((a, b) => b.nominations - a.nominations || a.studentId.localeCompare(b.studentId)); return candidates[0] ? [candidates[0]] : []; });
}
export const TIMING_OPTIONS = [
  { key: "A", title: "3个以上", text: "立即调整", color: "#E53935" },
  { key: "B", title: "1-2个", text: "持续观察", color: "#F9A825" },
  { key: "C", title: "0个", text: "暂不需要调整", color: "#43A047" },
] as const;
export type TimingChoice = typeof TIMING_OPTIONS[number]["key"];
export type TimingOutcome = { entered: boolean; choice: TimingChoice | null; reason: string | null; elapsedMs: number | null };
export function timingStats(people: TimingOutcome[]) {
  const cohort = people.filter(person => person.entered), valid = cohort.filter(person => person.choice);
  const noAnswer = cohort.filter(person => !person.choice && person.reason).length;
  return { total: cohort.length, voted: valid.length, noAnswer, pending: cohort.length - valid.length - noAnswer, options: TIMING_OPTIONS.map(option => { const count = valid.filter(person => person.choice === option.key).length; return { key: option.key, count, percent: valid.length ? Math.round(count / valid.length * 1000) / 10 : 0 }; }), majorityImmediate: valid.filter(person => person.choice === "A").length > valid.length / 2 };
}
export const CHANGE_SIGNALS = [
  { title: "外部环境发生重大变化", type: "必须调", person: "陈帅", quote: "不得不调" },
  { title: "自身能力或兴趣显著转变", type: "主动调", person: "葛梦婷", quote: "自己想调" },
  { title: "规划执行中反复遇阻碍", type: "反思调", person: "小禾", quote: "调了才通" },
];
export type CompletionSnapshot = {
  map: ActivityClock; ownMap?: MapCard; mapRoster?: MapCard[]; groupMaps?: MapCard[]; representatives?: MapCard[]; ownNomination?: string | null; projectedMap: MapCard | null;
  vote: ActivityClock; ownVote?: TimingOutcome; voteStats?: ReturnType<typeof timingStats>; signalsVisible: boolean;
};
