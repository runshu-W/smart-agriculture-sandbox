import "server-only";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireLesson } from "@/lib/server/classroom";
import { AuthorizationError } from "@/lib/server/auth";
import { ClassroomError } from "@/lib/classroom";
import { activityElapsed, mapComplete, type TimingChoice } from "@/lib/classroom-completion";
import { closeTimingVote, completionClock, completionEvent, completionSnapshot } from "@/lib/server/completion-state";
const signalSchema = z.object({ id: z.string().uuid(), layer: z.enum(["macro", "micro", "self"]), text: z.string().trim().min(1).max(120), priority: z.enum(["now", "watch"]) }).strict();
export const mapInput = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), operationId: z.string().uuid(), version: z.number().int().nonnegative(), signals: z.array(signalSchema).max(30).refine(items => new Set(items.map(item => item.id)).size === items.length, "信号编号重复"), complete: z.boolean().default(false) }).strict(),
  z.object({ action: z.enum(["view", "nominate", "project"]), operationId: z.string().uuid(), studentId: z.string().min(1).max(100) }).strict(),
]);
export async function updateChangeMap(id: string, input: z.infer<typeof mapInput>) {
  const { actor } = await requireLesson(id);
  if (input.action === "project" ? actor.role !== "TEACHER" : actor.role !== "STUDENT") throw new AuthorizationError();
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
    const lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
    if (!lesson.mapStartedAt) throw new ClassroomError("请等待老师发起变化地图活动");
    const elapsed = activityElapsed(completionClock(lesson, "map"), Date.now(), 720000);
    if (input.action === "project") {
      if (lesson.stage !== 4 || lesson.status !== "RUNNING" || elapsed < 600000) throw new ClassroomError("请在全班展示阶段选择代表地图");
      const [people, members] = await Promise.all([tx.lessonPresence.findMany({ where: { lessonId: id } }), tx.enrollment.findMany({ where: { classId: lesson.classId, status: "ACTIVE" }, select: { user: { select: { id: true, displayName: true } } } })]);
      const candidate = completionSnapshot(lesson, people, members, actor.id, "teacher").representatives?.find(card => card.studentId === input.studentId);
      if (!candidate) throw new ClassroomError("请先让小组推选已提交的代表地图");
      await tx.liveLesson.update({ where: { id }, data: { mapPresentation: candidate, version: { increment: 1 } } });
      await tx.auditLog.create({ data: { actorId: actor.id, classId: lesson.classId, entityType: "LiveLesson", entityId: id, action: "MAP_PROJECT", after: { studentId: candidate.studentId, version: candidate.version, group: candidate.group } } });
      return { ok: true };
    }
    const person = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
    if (!person) throw new ClassroomError("请先加入本次课堂", 403);
    const suffix = input.action === "view" ? `map-view:${input.studentId}` : `map-operation:${input.operationId}`;
    const existing = await tx.learningEvent.findUnique({ where: { id: `${person.id}:${suffix}` }, select: { payload: true } });
    if (existing) {
      const payload = existing.payload as { request: unknown };
      if (input.action !== "view" && !isDeepStrictEqual(payload.request, input)) throw new ClassroomError("操作编号已用于不同内容，请重试新操作");
      return { ok: true, version: person.mapVersion, signals: person.mapSignals, submitted: !!person.mapSubmittedAt };
    }
    if (input.action === "save") {
      if (person.mapVersion !== input.version) return { conflict: true, version: person.mapVersion, signals: person.mapSignals, submitted: !!person.mapSubmittedAt };
      const active = lesson.stage === 4 && lesson.status === "RUNNING" && !lesson.mapClosedAt && elapsed < 600000;
      if (input.complete && (!active || !mapComplete(input.signals))) throw new ClassroomError("请在填写或讨论阶段为三层各填写至少一条信号，再提交给小组");
      const entryMs = person.mapEntryMs ?? (active && elapsed < 180000 ? elapsed : null);
      const independentMs = input.complete && entryMs !== null ? Math.max(0, Math.min(elapsed, 180000) - entryMs) : person.mapIndependentMs;
      const updated = await tx.lessonPresence.update({ where: { id: person.id }, data: { mapSignals: input.signals, mapVersion: { increment: 1 }, mapEntryMs: entryMs, mapIndependentMs: independentMs, ...(input.complete ? { mapSubmittedAt: person.mapSubmittedAt ?? new Date() } : {}), ...(!mapComplete(input.signals) ? { mapSubmittedAt: null } : {}) } });
      await tx.learningEvent.create({ data: completionEvent(lesson, person, input.complete ? "CHANGE_MAP_SHARED" : "CHANGE_MAP_SAVED", suffix, { schemaVersion: 1, request: input, lateSync: !active, elapsedMs: elapsed, independentMs, rehearsal: lesson.rehearsal }) });
      return { ok: true, version: updated.mapVersion, signals: updated.mapSignals, submitted: !!updated.mapSubmittedAt, lateSync: !active };
    }
    if (lesson.status !== "RUNNING" || lesson.stage !== 4 || elapsed < 180000 || elapsed >= 600000 || lesson.mapClosedAt) throw new ClassroomError("请在小组研讨阶段查看和推选地图");
    const groups = lesson.mapGroups as Record<string, number>;
    if (!groups[actor.id] || groups[actor.id] !== groups[input.studentId]) throw new AuthorizationError("只能查看和推选本组已提交地图");
    const target = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: input.studentId } } });
    if (!target?.mapSubmittedAt) throw new ClassroomError("这位同学尚未提交地图");
    await tx.lessonPresence.update({ where: { id: person.id }, data: { groupInteractions: { increment: 1 }, ...(input.action === "nominate" ? { mapNominatedId: input.studentId } : {}) } });
    await tx.learningEvent.create({ data: completionEvent(lesson, person, input.action === "view" ? "GROUP_MAP_VIEWED" : "MAP_NOMINATED", suffix, { schemaVersion: 1, request: input, rehearsal: lesson.rehearsal }) });
    return { ok: true };
  });
}

export async function submitTimingVote(id: string, choice: TimingChoice) {
  const { actor } = await requireLesson(id); if (actor.role !== "STUDENT") throw new AuthorizationError();
  const result = await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
    const lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
    const person = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
    if (!person) throw new AuthorizationError("请先加入课堂");
    if (person.voteChoice === choice) return { ok: true };
    if (person.voteReason) throw new ClassroomError("投票结果已保留，不能修改");
    const elapsedMs = activityElapsed(completionClock(lesson, "vote"), Date.now(), 10000);
    if (lesson.voteStartedAt && !lesson.voteClosedAt && elapsedMs >= 10000) { await closeTimingVote(tx, lesson, new Date(), "timeout"); return { error: "投票时间已到，未投票记录会保留" }; }
    if (!person.voteEnteredAt || lesson.voteClosedAt || lesson.stage !== 5 || lesson.status !== "RUNNING") throw new ClassroomError("请等待老师发起或继续投票");
    await tx.lessonPresence.update({ where: { id: person.id }, data: { voteChoice: choice, voteReason: "submitted", voteSubmittedAt: new Date(), voteResponseMs: elapsedMs } });
    await tx.learningEvent.create({ data: completionEvent(lesson, person, "TIMING_VOTED", "timing-vote", { schemaVersion: 1, choice, elapsedMs, reason: "submitted", rehearsal: lesson.rehearsal }) });
    return { ok: true };
  });
  if (result.error) throw new ClassroomError(result.error); return result;
}
