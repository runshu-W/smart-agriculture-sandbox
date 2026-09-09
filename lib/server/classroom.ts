import "server-only";
import { classroomRead } from "@/lib/server/classroom-reads";
import { db } from "@/lib/db";
import { Prisma, Role } from "@/generated/prisma/client";
import { AuthorizationError, requireActor, requireTeacherContext } from "@/lib/server/auth";
import { ClassroomError, transitionLesson, type LessonCommand, type LessonSnapshot } from "@/lib/classroom";
import { impactTime, type ImpactObservation } from "@/lib/classroom-impact";
import { summarizeImpact } from "@/lib/impact-summary";
import type { ReferenceId } from "@/lib/classroom-references";
import { DECISION_MS, decisionElapsed, summarizeDecisions, type DecisionChoice, type DecisionTrace, type DecisionReport } from "@/lib/classroom-decision";
import { closeDecision, decisionClock, decisionOutcome, decisionEvent, settleExpiredDecision } from "@/lib/server/classroom-decision";
import { summarizeFramework, type FrameworkProgress } from "@/lib/classroom-framework";
import { activityElapsed, assignGroups } from "@/lib/classroom-completion";
import { completionClock, completionSnapshot, closeTimingVote, settleCompletion } from "@/lib/server/completion-state";

export async function requireLesson(id: string, teacherOnly = false, shareReads = false) {
  const actor = await requireActor(teacherOnly ? Role.TEACHER : undefined);
  const readLesson = () => db.liveLesson.findUnique({ where: { id }, include: { classRoom: true, teacher: { select: { displayName: true } } } });
  const lesson = await (shareReads ? classroomRead(`lesson:${id}`, readLesson) : readLesson());
  if (!lesson) throw new ClassroomError("课堂不存在", 404);
  const authorized = actor.role === "TEACHER" ? actor.taughtClasses.some(item => item.classId === lesson.classId) : actor.enrollments.some(item => item.classId === lesson.classId);
  if (!authorized || lesson.classRoom.isArchived) throw new AuthorizationError("无权进入该班级课堂");
  return { actor, lesson };
}

export async function listClassrooms(teacher = false) {
  const actor = await requireActor(teacher ? Role.TEACHER : Role.STUDENT);
  const classes = (teacher ? actor.taughtClasses : actor.enrollments).filter(item => !item.classRoom.isArchived).map(item => ({ id: item.classId, name: item.classRoom.name }));
  const lessons = await db.liveLesson.findMany({ where: { classId: { in: classes.map(item => item.id) } }, orderBy: { createdAt: "desc" }, take: 30, include: { classRoom: { select: { name: true } } } });
  return { classes, lessons: lessons.map(item => ({ id: item.id, className: item.classRoom.name, rehearsal: item.rehearsal, status: item.status, stage: item.stage, createdAt: item.createdAt.toISOString() })) };
}

export async function createClassroom(classId: string, rehearsal: boolean) {
  const actor = await requireTeacherContext(classId);
  if (actor.classRoom.isArchived) throw new ClassroomError("归档班级不能建课", 403);
  return db.$transaction(async tx => {
    const active = await tx.liveLesson.findFirst({ where: { classId, endedAt: null } });
    if (active) throw new ClassroomError("该班已有未结束课堂，请先进入或结束原课堂");
    const lesson = await tx.liveLesson.create({ data: { classId, teacherId: actor.userId, rehearsal } });
    await tx.auditLog.create({ data: { actorId: actor.userId, classId, entityType: "LiveLesson", entityId: lesson.id, action: "CREATE", after: { rehearsal } } });
    return { id: lesson.id };
  });
}

export async function controlClassroom(id: string, version: number, command: LessonCommand) {
  const { actor } = await requireLesson(id, true);
  await db.$transaction(async tx => {
  await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
  let lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
  if (version !== lesson.version) throw new ClassroomError("课堂状态已变化，请根据最新状态重试");
  const now = new Date();
  if (lesson.voteStartedAt && !lesson.voteClosedAt && activityElapsed(completionClock(lesson, "vote"), now.getTime()) >= 10000) lesson = await closeTimingVote(tx, lesson, now, "timeout");
  if (lesson.decisionStartedAt && !lesson.decisionClosedAt && decisionElapsed(decisionClock(lesson), now.getTime()) >= DECISION_MS) lesson = await closeDecision(tx, lesson, now, "timeout");
  if (command.action === "impact-start" && lesson.impactStartedAt) throw new ClassroomError("冲击已经开始，不会重复播放；如需重新演练，请创建新课堂");
  const state = transitionLesson({ ...lesson, deadline: lesson.deadline?.getTime() ?? null }, command, now.getTime());
  const impactStartedAt = command.action === "impact-start" ? now : lesson.impactStartedAt;
  const impactElapsedMs = impactTime({ startedAt: lesson.impactStartedAt?.getTime() ?? null, runningSince: lesson.impactRunningSince?.getTime() ?? null, elapsedMs: lesson.impactElapsedMs }, now.getTime());
  if (command.action === "impact-results" && (!impactStartedAt || impactElapsedMs < 26000)) throw new ClassroomError("请先完整播放冲击情境，再查看班级数据");
  const closeImpact = impactStartedAt && (command.action === "impact-results" || (command.action === "stage" && state.stage !== 0) || command.action === "end");
  const impactClosedAt = lesson.impactClosedAt ?? (closeImpact ? now : null);
  const impactResultsVisible = command.action === "impact-results" ? true : command.action === "impact-scene" ? false : lesson.impactResultsVisible;
  const impactRunningSince = !impactClosedAt && impactStartedAt && state.status === "RUNNING" && state.stage === 0 ? now : null;
  if (command.action === "decision-start" && lesson.decisionStartedAt) throw new ClassroomError("本次决策已经发起，不能重复作答；如需重演请新建课堂");
  if (lesson.decisionStartedAt && !lesson.decisionClosedAt && (command.action === "end" || (command.action === "stage" && state.stage !== 2))) lesson = await closeDecision(tx, lesson, now, "teacher");
  const decisionStartedAt = command.action === "decision-start" ? now : lesson.decisionStartedAt;
  const decisionElapsedMs = decisionElapsed(decisionClock(lesson), now.getTime());
  const decisionRunningSince = decisionStartedAt && !lesson.decisionClosedAt && state.status === "RUNNING" && state.stage === 2 ? now : null;
  if (command.action === "decision-start") await tx.lessonPresence.updateMany({ where: { lessonId: id }, data: { decisionEnteredAt: now } });
  if (command.action === "map-start" && lesson.mapStartedAt) throw new ClassroomError("地图活动已发起，不会重开或清除记录");
  if (command.action === "vote-start" && lesson.voteStartedAt) throw new ClassroomError("本次投票已发起，不能重复投票");
  if (command.action === "signals-show" && !lesson.voteClosedAt) throw new ClassroomError("请先结束10秒投票，再展示三信号总结");
  if (lesson.voteStartedAt && !lesson.voteClosedAt && (command.action === "end" || (command.action === "stage" && state.stage !== 5))) lesson = await closeTimingVote(tx, lesson, now, "teacher");
  const mapStartedAt = command.action === "map-start" ? now : lesson.mapStartedAt;
  const mapElapsedMs = activityElapsed(completionClock(lesson, "map"), now.getTime(), 720000);
  const mapClosedAt = lesson.mapClosedAt ?? (mapStartedAt && (mapElapsedMs >= 720000 || command.action === "end" || (command.action === "stage" && state.stage !== 4)) ? now : null);
  const mapGroups = command.action === "map-start" ? assignGroups((await tx.enrollment.findMany({ where: { classId: lesson.classId, status: "ACTIVE", user: { status: "ACTIVE" } }, orderBy: { user: { studentNo: "asc" } }, select: { userId: true } })).map(member => member.userId)) : lesson.mapGroups;
  const voteStartedAt = command.action === "vote-start" ? now : lesson.voteStartedAt;
  const voteElapsedMs = activityElapsed(completionClock(lesson, "vote"), now.getTime(), 10000);
  if (command.action === "vote-start") await tx.lessonPresence.updateMany({ where: { lessonId: id }, data: { voteEnteredAt: now } });
  const frameworkElapsedMs = lesson.frameworkElapsedMs + (lesson.frameworkRunningSince ? Math.max(0, now.getTime() - lesson.frameworkRunningSince.getTime()) : 0);
    const changed = await tx.liveLesson.updateMany({ where: { id, version: lesson.version, endedAt: null }, data: {
      status: state.status, stage: state.stage, durationMs: state.durationMs, remainingMs: state.remainingMs,
      impactStartedAt, impactElapsedMs, impactRunningSince,
      impactClosedAt, impactResultsVisible,
      decisionStartedAt, decisionElapsedMs, decisionRunningSince,
      frameworkElapsedMs, frameworkRunningSince: state.stage === 3 && state.status === "RUNNING" ? now : null,
      mapStartedAt, mapElapsedMs, mapGroups: mapGroups as Prisma.InputJsonValue, mapClosedAt, mapRunningSince: mapStartedAt && !mapClosedAt && state.stage === 4 && state.status === "RUNNING" ? now : null,
      voteStartedAt, voteElapsedMs, voteRunningSince: voteStartedAt && !lesson.voteClosedAt && state.stage === 5 && state.status === "RUNNING" ? now : null,
      signalsVisible: command.action === "signals-show" ? true : lesson.signalsVisible,
      deadline: state.deadline === null ? null : new Date(state.deadline), version: { increment: 1 },
      ...(state.status === "ENDED" ? { endedAt: now } : {}),
    } });
    if (changed.count !== 1) throw new ClassroomError("课堂状态已变化，请根据最新状态重试");
    await tx.auditLog.create({ data: { actorId: actor.id, classId: lesson.classId, entityType: "LiveLesson", entityId: id, action: command.action.toUpperCase(), before: { status: lesson.status, stage: lesson.stage, version }, after: { status: state.status, stage: state.stage, version: lesson.version + 1, remainingMs: state.remainingMs } } });
    if (state.status === "ENDED") {
      const participants = await tx.lessonPresence.findMany({ where: { lessonId: id }, select: { learningSessionId: true } });
      await tx.learningSession.updateMany({ where: { id: { in: participants.map(item => item.learningSessionId) } }, data: { endedAt: now } });
    }
  });
  return { ok: true };
}

export async function studentClassroomAction(id: string, action: "join" | "presence" | "ready") {
  const { actor, lesson } = await requireLesson(id);
  if (actor.role !== "STUDENT") throw new AuthorizationError("该操作仅限学生");
  return db.$transaction(async tx => {
    // Serialize joins/readiness with ending class; never recreate an ended session.
    const locked = await tx.$queryRaw<Array<{ status: string }>>`SELECT "status" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
    if (locked[0]?.status === "ENDED") throw new ClassroomError("课堂已结束，记录已保留");
    const now = new Date();
    let currentLesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
    if (currentLesson.voteStartedAt && !currentLesson.voteClosedAt && activityElapsed(completionClock(currentLesson, "vote"), now.getTime()) >= 10000) currentLesson = await closeTimingVote(tx, currentLesson, now, "timeout");
    if (currentLesson.decisionStartedAt && !currentLesson.decisionClosedAt && decisionElapsed(decisionClock(currentLesson), now.getTime()) >= DECISION_MS) currentLesson = await closeDecision(tx, currentLesson, now, "timeout");
    let participant = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
    if (!participant && action !== "join") throw new ClassroomError("请先加入课堂", 403);
    const eventBase = { userId: actor.id, classId: lesson.classId, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-05-change", liveLessonId: id, occurredAt: now, source: lesson.rehearsal ? "classroom-rehearsal" : "classroom" };
    if (!participant) {
      const session = await tx.learningSession.create({ data: { userId: actor.id, classId: lesson.classId, unitId: "unit-05" } });
      const impactEntryMs = impactTime({ startedAt: currentLesson.impactStartedAt?.getTime() ?? null, runningSince: currentLesson.impactRunningSince?.getTime() ?? null, elapsedMs: currentLesson.impactElapsedMs }, now.getTime());
      participant = await tx.lessonPresence.create({ data: { lessonId: id, studentId: actor.id, learningSessionId: session.id, impactEntryMs, decisionEnteredAt: currentLesson.decisionStartedAt && !currentLesson.decisionClosedAt ? now : null, voteEnteredAt: currentLesson.voteStartedAt && !currentLesson.voteClosedAt ? now : null } });
      const groups = currentLesson.mapGroups as Record<string, number>;
      if (currentLesson.mapStartedAt && !groups[actor.id]) { const count = Math.max(1, ...Object.values(groups)); const group = Array.from({ length: count }, (_, index) => index + 1).sort((a, b) => Object.values(groups).filter(value => value === a).length - Object.values(groups).filter(value => value === b).length)[0]; await tx.liveLesson.update({ where: { id }, data: { mapGroups: { ...groups, [actor.id]: group }, version: { increment: 1 } } }); }
      await tx.learningEvent.create({ data: { ...eventBase, sessionId: session.id, eventType: "CLASSROOM_JOINED", payload: { lessonId: id, rehearsal: lesson.rehearsal } } });
    }
    if (action === "ready" && !participant.readyAt) await tx.learningEvent.create({ data: { ...eventBase, sessionId: participant.learningSessionId, eventType: "CLASSROOM_READY", payload: { lessonId: id, rehearsal: lesson.rehearsal } } });
    await tx.lessonPresence.update({ where: { id: participant.id }, data: { lastSeenAt: now, ...(action === "ready" ? { readyAt: participant.readyAt ?? now } : {}) } });
    return { ok: true };
  });
}

export async function classroomSnapshot(id: string, view: "teacher" | "student" | "screen"): Promise<LessonSnapshot> {
  const { actor, lesson: initialLesson } = await requireLesson(id, view !== "student", true);
  if (view === "student" && actor.role !== "STUDENT") throw new AuthorizationError();
  const lesson = await settleCompletion(await settleExpiredDecision(initialLesson));
  const [members, participants] = await classroomRead(`participants:${id}`, () => Promise.all([
    db.enrollment.findMany({ where: { classId: lesson.classId, status: "ACTIVE", user: { status: "ACTIVE", role: "STUDENT" } }, select: { user: { select: { id: true, displayName: true } } }, orderBy: { user: { studentNo: "asc" } } }),
    db.lessonPresence.findMany({ where: { lessonId: id } }),
  ]));
  const now = Date.now();
  const byId = new Map(participants.map(item => [item.studentId, item]));
  const roster = members.map(({ user }) => { const presence = byId.get(user.id); return { id: user.id, name: user.displayName, joined: !!presence, ready: !!presence?.readyAt, online: !!presence && now - presence.lastSeenAt.getTime() < 20_000 && lesson.status !== "ENDED", pathsViewed: presence?.pathsViewed ?? [] }; });
  const own = byId.get(actor.id);
  return {
    id, status: lesson.status, stage: lesson.stage, durationMs: lesson.durationMs, remainingMs: lesson.remainingMs,
    deadline: lesson.deadline?.getTime() ?? null, version: lesson.version, serverNow: now,
    className: lesson.classRoom.name, teacherName: lesson.teacher.displayName, rehearsal: lesson.rehearsal,
    total: roster.length, joined: roster.filter(item => item.joined).length, online: roster.filter(item => item.online).length, ready: roster.filter(item => item.ready).length,
    ownJoined: !!own, ownReady: !!own?.readyAt, ...(view === "teacher" ? { roster } : {}),
    ...(view === "student" && own ? { ownSessionId: own.learningSessionId } : {}),
    impact: { startedAt: lesson.impactStartedAt?.getTime() ?? null, runningSince: lesson.impactRunningSince?.getTime() ?? null, elapsedMs: lesson.impactElapsedMs },
    impactClosedAt: lesson.impactClosedAt?.getTime() ?? null, impactResultsVisible: lesson.impactResultsVisible, ownImpactSynced: !!own?.impactSyncedAt,
    ownPathsViewed: own?.pathsViewed ?? [], pathsReadyCount: roster.filter(item => item.pathsViewed.length === 3).length,
    decision: decisionClock(lesson),
    ...(view === "student" && own ? { ownDecision: decisionOutcome(own) } : {}),
    ...(view !== "student" ? { decisionStats: summarizeDecisions(participants.map(decisionOutcome)) } : {}),
    ...(view === "student" && own ? { ownFramework: own.frameworkProgress as FrameworkProgress } : {}),
    ...(view !== "student" ? { frameworkStats: summarizeFramework(participants.map(person => person.frameworkProgress as FrameworkProgress)) } : {}),
    completion: completionSnapshot(lesson, participants, members, actor.id, view),
  };
}

export async function saveImpactObservations(id: string, batchId: string, observations: ImpactObservation[], complete = false) {
  const { actor, lesson } = await requireLesson(id);
  if (actor.role !== "STUDENT") throw new AuthorizationError("该操作仅限学生");
  const presence = await db.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
  if (!presence || !lesson.impactStartedAt) throw new ClassroomError("请加入已开始冲击的课堂", 403);
  if (complete && !lesson.impactClosedAt) throw new ClassroomError("老师尚未结束观察采集");
  const elapsed = impactTime({ startedAt: lesson.impactStartedAt.getTime(), runningSince: lesson.impactRunningSince?.getTime() ?? null, elapsedMs: lesson.impactElapsedMs }, Date.now());
  if (observations.some(item => item.atMs > elapsed + 2000 || item.durationMs > item.atMs)) throw new ClassroomError("观察记录时间无效", 400);
  // Client retries reuse the batch id. Student identity comes exclusively from the session.
  await db.learningEvent.createMany({ skipDuplicates: true, data: [{
    id: `${presence.id}:impact:${batchId}`, userId: actor.id, classId: lesson.classId, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-05-change",
    liveLessonId: id, sessionId: presence.learningSessionId, eventType: "IMPACT_OBSERVED", occurredAt: new Date(),
    source: lesson.rehearsal ? "classroom-rehearsal" : "classroom",
    payload: { schemaVersion: 1, lessonId: id, rehearsal: lesson.rehearsal, observations, method: "pointer-keyboard-touch", psychologicalAssessment: false },
  }] });
  if (complete) await db.lessonPresence.update({ where: { id: presence.id }, data: { impactSyncedAt: new Date() } });
  return { ok: true, batchId };
}

export async function impactSummary(id: string, view: "teacher" | "screen") {
  const { lesson } = await requireLesson(id, true);
  const [people, events] = await Promise.all([
    db.lessonPresence.findMany({ where: { lessonId: id, ...(lesson.impactClosedAt ? { joinedAt: { lte: lesson.impactClosedAt } } : {}) }, include: { student: { select: { displayName: true } } } }),
    db.learningEvent.findMany({ where: { liveLessonId: id, eventType: "IMPACT_OBSERVED" }, select: { userId: true, payload: true } }),
  ]);
  const grouped = new Map<string, ImpactObservation[]>();
  for (const event of events) {
    const payload = event.payload as { observations?: ImpactObservation[] };
    if (Array.isArray(payload.observations)) grouped.set(event.userId, [...(grouped.get(event.userId) ?? []), ...payload.observations]);
  }
  return summarizeImpact(people.map(person => ({ id: person.studentId, name: person.student.displayName, synced: !!person.impactSyncedAt, entryMs: person.impactEntryMs, observations: grouped.get(person.studentId) ?? [] })),
    impactTime({ startedAt: lesson.impactStartedAt?.getTime() ?? null, runningSince: lesson.impactRunningSince?.getTime() ?? null, elapsedMs: lesson.impactElapsedMs }, Date.now()), !!lesson.impactClosedAt, view === "teacher");
}

export async function readClassroomPath(id: string, path: ReferenceId) {
  const { actor } = await requireLesson(id);
  if (actor.role !== "STUDENT") throw new AuthorizationError("该操作仅限学生");
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
    const lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
    const person = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
    if (!person) throw new ClassroomError("请先加入本次课堂", 403);
    if (lesson.status === "ENDED" || ![1, 2].includes(lesson.stage)) throw new ClassroomError("请等待老师进入路径参考阶段");
    if (!person.pathsViewed.includes(path)) {
      await tx.lessonPresence.update({ where: { id: person.id }, data: { pathsViewed: { push: path } } });
      await tx.learningEvent.create({ data: { id: `${person.id}:path:${path}`, userId: actor.id, classId: lesson.classId, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-05-change", sessionId: person.learningSessionId, liveLessonId: id,
        eventType: "PATH_REFERENCE_READ", occurredAt: new Date(), source: lesson.rehearsal ? "classroom-rehearsal" : "classroom", payload: { path, lessonId: id, rehearsal: lesson.rehearsal } } });
    }
    return { ok: true };
  });
}

export async function submitClassroomDecision(id: string, choice: DecisionChoice, trace: DecisionTrace[]) {
  const { actor } = await requireLesson(id);
  if (actor.role !== "STUDENT") throw new AuthorizationError("该操作仅限学生");
  const result = await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
    const lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
    const now = new Date();
    const person = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
    if (!person) throw new ClassroomError("请先加入本次课堂", 403);
    if (person.decisionReason === "submitted" && person.decisionChoice === choice) return { ok: true };
    if (person.decisionReason) throw new ClassroomError("本次决策结果已保留，不能修改");
    const elapsedMs = decisionElapsed(decisionClock(lesson), now.getTime());
    if (lesson.decisionStartedAt && !lesson.decisionClosedAt && elapsedMs >= DECISION_MS) {
      await closeDecision(tx, lesson, now, "timeout");
      return { error: "决策时间已到，未确认的选择不会自动提交" };
    }
    if (!person.decisionEnteredAt || !lesson.decisionStartedAt || lesson.decisionClosedAt || lesson.stage !== 2 || lesson.status !== "RUNNING") throw new ClassroomError("当前不能提交，请等待老师发起或继续决策");
    if (person.pathsViewed.length !== 3) throw new ClassroomError("请先阅读全部三条参考路径");
    if (trace.some((item, index) => item.atMs > elapsedMs + 2000 || (index > 0 && item.atMs < trace[index - 1].atMs))) throw new ClassroomError("选择记录时间无效，请刷新后重试", 400);
    await tx.lessonPresence.update({ where: { id: person.id }, data: { decisionChoice: choice, decisionSubmittedAt: now, decisionElapsedMs: elapsedMs, decisionReason: "submitted", decisionTrace: trace } });
    await tx.learningEvent.create({ data: decisionEvent(lesson, person, now, choice, elapsedMs, "submitted", trace) });
    return { ok: true };
  });
  if (result.error) throw new ClassroomError(result.error);
  return result;
}

export async function classroomDecisionReport(id: string): Promise<DecisionReport> {
  const { actor, lesson } = await requireLesson(id);
  if (actor.role !== "STUDENT") throw new AuthorizationError("个人报告仅本人可见");
  await settleExpiredDecision(lesson);
  const person = await db.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
  if (!person || !person.decisionReason) throw new ClassroomError("决策结果尚未生成");
  const events = await db.learningEvent.findMany({ where: { liveLessonId: id, userId: actor.id, eventType: "IMPACT_OBSERVED" }, select: { payload: true } });
  const observations = events.flatMap(event => (event.payload as { observations?: ImpactObservation[] }).observations ?? []).filter(item => item.kind === "view" && item.atMs >= person.impactEntryMs && item.atMs <= lesson.impactElapsedMs).sort((a, b) => a.atMs - b.atMs);
  let switches = 0;
  const impact = observations.map((item, index) => {
    if (index > 0 && item.region !== observations[index - 1].region) switches++;
    return { atMs: item.atMs, value: Math.min(10, Math.round((1 + index * 0.5 + switches * 0.3) * 10) / 10) };
  });
  return { outcome: decisionOutcome(person), trace: (person.decisionTrace as DecisionTrace[] | null) ?? [], impact, impactSynced: !!person.impactSyncedAt };
}

export function classroomHttpError(error: unknown) {
  if (error instanceof ClassroomError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "该班已有未结束课堂，请进入已有课堂" }, { status: 409 });
  console.error("Classroom request failed", error);
  return Response.json({ error: "课堂服务暂不可用，请重试" }, { status: 500 });
}
