import "server-only";
import { db } from "@/lib/db";
import { requireLesson } from "@/lib/server/classroom";
import { AuthorizationError } from "@/lib/server/auth";
import { ClassroomError } from "@/lib/classroom";
import { mapFramework } from "@/lib/server/framework-rules";
import type { FrameworkEvent, FrameworkLayer, FrameworkProgress } from "@/lib/classroom-framework";

export async function submitFramework(id: string, attemptId: string, event: FrameworkEvent, layer: FrameworkLayer) {
  const { actor } = await requireLesson(id);
  if (actor.role !== "STUDENT") throw new AuthorizationError("映射提交仅限学生本人");
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${id} FOR UPDATE`;
    const lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id } });
    const person = await tx.lessonPresence.findUnique({ where: { lessonId_studentId: { lessonId: id, studentId: actor.id } } });
    if (!person) throw new ClassroomError("请先加入本次课堂", 403);
    const progress = person.frameworkProgress as FrameworkProgress;
    const eventId = `${person.id}:framework:${attemptId}`;
    const existing = await tx.learningEvent.findUnique({ where: { id: eventId }, select: { payload: true } });
    if (existing) {
      const payload = existing.payload as { event: string; layer: string };
      if (payload.event !== event || payload.layer !== layer) throw new ClassroomError("这次提交编号已用于其他映射，请重新选择");
      return { progress, duplicate: true };
    }
    if (lesson.status !== "RUNNING" || lesson.stage !== 3) throw new ClassroomError("请在老师开启三层变化识别阶段后提交；暂停期间不能作答");
    if (progress[event]?.solved) return { progress, duplicate: true };
    const next = mapFramework(progress, event, layer);
    const elapsed = lesson.frameworkElapsedMs + (lesson.frameworkRunningSince ? Math.max(0, Date.now() - lesson.frameworkRunningSince.getTime()) : 0);
    const firstMs = person.frameworkFirstMs ?? elapsed;
    const completedMs = Object.values(next).filter(answer => answer?.solved).length === 3 ? elapsed - firstMs : person.frameworkCompletedMs;
    await tx.lessonPresence.update({ where: { id: person.id }, data: { frameworkProgress: next, frameworkFirstMs: firstMs, frameworkCompletedMs: completedMs } });
    await tx.learningEvent.create({ data: { id: eventId, userId: actor.id, classId: lesson.classId, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-05-change", liveLessonId: id, sessionId: person.learningSessionId, eventType: "FRAMEWORK_MAPPED", occurredAt: new Date(), source: lesson.rehearsal ? "classroom-rehearsal" : "classroom", payload: { schemaVersion: 1, lessonId: id, rehearsal: lesson.rehearsal, event, layer, correct: next[event]!.solved, attempt: next[event]!.attempts, elapsedMs: elapsed - firstMs, completedMs } } });
    return { progress: next, duplicate: false };
  });
}
