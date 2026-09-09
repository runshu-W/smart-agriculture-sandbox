export const DECISION_MS = 180_000;
export const DECISION_CHOICES = [
  { key: "A", title: "全面转向 AI", description: "全面采用 AI 主播替代真人", color: "#1565C0", label: "敏捷行动型", comment: "你愿意主动尝试新技术。下一步，试着用小规模试播验证效果，同时为团队留出学习和调整的时间。" },
  { key: "B", title: "坚持纯真人", description: "继续传统真人主播模式", color: "#E65100", label: "坚守本位型", comment: "你看见了故事与信任的价值。下一步，试着用真实的用户反馈检验优势，也给新工具留一点探索空间。" },
  { key: "C", title: "人机协同方案", description: "真人主播 + AI 辅助协同直播", color: "#2E7D32", label: "协同融合型", comment: "你在寻找人与技术各自的长处。下一步，可以明确谁来讲故事、谁来处理信息，再用一次试播检验分工。" },
  { key: "D", title: "暂停重新评估", description: "暂停当前直播，先评估局势", color: "#6A1B9A", label: "审慎评估型", comment: "你愿意先弄清局势再行动。下一步，可以给评估设一个期限，列出最需要补齐的证据，避免让农户一直等待。" },
] as const;
export type DecisionChoice = typeof DECISION_CHOICES[number]["key"];
export type DecisionTrace = { choice: DecisionChoice; atMs: number };
export type DecisionClock = { startedAt: number | null; runningSince: number | null; elapsedMs: number; closedAt: number | null; closeReason: string | null };
export type DecisionOutcome = { entered: boolean; choice: DecisionChoice | null; submittedAt: number | null; elapsedMs: number | null; reason: string | null };
export function decisionElapsed(clock: DecisionClock, now: number) {
  return Math.min(DECISION_MS, Math.max(0, clock.elapsedMs + (clock.runningSince === null ? 0 : Math.max(0, now - clock.runningSince))));
}
export type DecisionStats = ReturnType<typeof summarizeDecisions>;
export function summarizeDecisions(people: DecisionOutcome[]) {
  const cohort = people.filter(person => person.entered);
  const answered = cohort.filter(person => person.reason === "submitted" && person.choice !== null);
  const noAnswer = cohort.filter(person => person.reason !== null && person.choice === null).length;
  const percent = (count: number, total: number) => total ? Math.round(count / total * 1000) / 10 : 0;
  const choices = DECISION_CHOICES.map(item => { const count = answered.filter(person => person.choice === item.key).length; return { key: item.key, count, percent: percent(count, answered.length) }; });
  const cd = choices[2].count + choices[3].count;
  return { total: cohort.length, submitted: answered.length, pending: cohort.length - answered.length - noAnswer, noAnswer, choices, cd, cdPercent: percent(cd, answered.length), cdCohortPercent: percent(cd, cohort.length),
    bins: Array.from({ length: 6 }, (_, index) => ({ label: `${index * 30}–${(index + 1) * 30}秒`, count: answered.filter(person => Math.min(5, Math.floor((person.elapsedMs ?? 0) / 30_000)) === index).length })) };
}
export type DecisionReport = { outcome: DecisionOutcome; trace: DecisionTrace[]; impact: { atMs: number; value: number }[]; impactSynced: boolean };
