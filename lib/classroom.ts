export const CLASSROOM_STAGES = [
  { key: "impact", title: "行业冲击", subtitle: "观察变化，感受挑战", minutes: 7 },
  { key: "paths", title: "路径参考", subtitle: "转型、坚守，还是升级", minutes: 2 },
  { key: "decision", title: "角色决策", subtitle: "站在运营负责人的位置思考", minutes: 6 },
  { key: "framework", title: "三层变化识别", subtitle: "向外看环境，向内看自己", minutes: 8 },
  { key: "map", title: "变化地图协作", subtitle: "一起描绘应对变化的方向", minutes: 12 },
  { key: "vote", title: "调整时机投票", subtitle: "把观察转化为行动", minutes: 5 },
] as const;

export type LessonStatus = "WAITING" | "RUNNING" | "PAUSED" | "ENDED";
export type LessonClock = { status: LessonStatus; stage: number; durationMs: number; remainingMs: number; deadline: number | null };
export type LessonCommand = { action: "start" | "pause" | "resume" | "reset" | "stage" | "end" | "impact-start" | "impact-results" | "impact-scene" | "decision-start" | "map-start" | "vote-start" | "signals-show"; stage?: number; minutes?: number };
export class ClassroomError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}
export function remainingTime(clock: LessonClock, now: number) {
  return Math.max(0, clock.status === "RUNNING" && clock.deadline !== null ? clock.deadline - now : clock.remainingMs);
}
export function transitionLesson(clock: LessonClock, command: LessonCommand, now: number): LessonClock {
  if (clock.status === "ENDED") throw new ClassroomError("课堂已结束，请创建新的课堂");
  const remaining = remainingTime(clock, now);
  switch (command.action) {
    case "map-start":
      if (clock.status !== "RUNNING" || clock.stage !== 4) throw new ClassroomError("请在变化地图阶段发起活动");
      return { ...clock };
    case "vote-start":
    case "signals-show":
      if (clock.status !== "RUNNING" || clock.stage !== 5) throw new ClassroomError("请在调整时机投票阶段操作");
      return { ...clock };
    case "decision-start":
      if (clock.status !== "RUNNING" || clock.stage !== 2) throw new ClassroomError("请在角色决策阶段、课堂进行中发起决策");
      return { ...clock };
    case "impact-results":
    case "impact-scene":
      if (clock.stage !== 0 || clock.status === "WAITING") throw new ClassroomError("请在第一阶段开始后查看");
      return { ...clock };
    case "impact-start":
      if (clock.status !== "RUNNING" || clock.stage !== 0) throw new ClassroomError("请在第一阶段开始课堂后发起冲击");
      return { ...clock };
    case "start":
      if (clock.status !== "WAITING") throw new ClassroomError("课堂已经开始，请刷新状态");
      return { ...clock, status: "RUNNING", deadline: now + clock.remainingMs };
    case "pause":
      if (clock.status !== "RUNNING") throw new ClassroomError("只有进行中的课堂可以暂停");
      return { ...clock, status: "PAUSED", remainingMs: remaining, deadline: null };
    case "resume":
      if (clock.status !== "PAUSED") throw new ClassroomError("课堂当前没有暂停");
      if (!remaining) throw new ClassroomError("本阶段时间已到，请重置计时或进入下一阶段");
      return { ...clock, status: "RUNNING", deadline: now + remaining };
    case "reset": {
      const durationMs = command.minutes === undefined ? clock.durationMs : command.minutes * 60_000;
      if (!Number.isInteger(durationMs) || durationMs < 60_000 || durationMs > 60 * 60_000) throw new ClassroomError("阶段时长需为 1–60 分钟", 400);
      return { ...clock, durationMs, remainingMs: durationMs, deadline: clock.status === "RUNNING" ? now + durationMs : null };
    }
    case "stage": {
      if (clock.status === "WAITING") throw new ClassroomError("请先开始课堂");
      if (command.stage === undefined || !Number.isInteger(command.stage) || !CLASSROOM_STAGES[command.stage]) throw new ClassroomError("无效阶段", 400);
      if (command.stage === clock.stage) throw new ClassroomError("已在当前阶段，如需重新计时请使用重置");
      const durationMs = CLASSROOM_STAGES[command.stage].minutes * 60_000;
      return { ...clock, stage: command.stage, durationMs, remainingMs: durationMs, deadline: clock.status === "RUNNING" ? now + durationMs : null };
    }
    case "end": return { ...clock, status: "ENDED", remainingMs: remaining, deadline: null };
  }
}
export function clockText(ms: number) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = { WAITING: "等待开始", RUNNING: "课堂进行中", PAUSED: "课堂已暂停", ENDED: "课堂已结束" };
export type LessonSnapshot = LessonClock & {
  id: string; className: string; teacherName: string; rehearsal: boolean; version: number; serverNow: number;
  total: number; joined: number; online: number; ready: number; ownJoined: boolean; ownReady: boolean;
  ownSessionId?: string;
  impactClosedAt: number | null; impactResultsVisible: boolean; ownImpactSynced: boolean;
  ownPathsViewed: string[]; pathsReadyCount: number;
  impact: import("./classroom-impact").ImpactClock;
  decision: import("./classroom-decision").DecisionClock;
  ownDecision?: import("./classroom-decision").DecisionOutcome;
  decisionStats?: import("./classroom-decision").DecisionStats;
  ownFramework?: import("./classroom-framework").FrameworkProgress;
  frameworkStats?: import("./classroom-framework").FrameworkStats;
  completion: import("./classroom-completion").CompletionSnapshot;
  roster?: Array<{ id: string; name: string; joined: boolean; online: boolean; ready: boolean; pathsViewed: string[] }>;
};
export type LessonListItem = { id: string; className: string; status: LessonStatus; rehearsal: boolean; createdAt: string; stage: number };
