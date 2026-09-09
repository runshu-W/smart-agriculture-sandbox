import "server-only";
import { db } from "@/lib/db";
import type { LiveLesson, LessonPresence, Prisma } from "@/generated/prisma/client";
import { DECISION_MS, decisionElapsed, type DecisionChoice, type DecisionClock, type DecisionOutcome } from "@/lib/classroom-decision";

export function decisionClock(lesson: LiveLesson): DecisionClock {
  return { startedAt: lesson.decisionStartedAt?.getTime() ?? null, runningSince: lesson.decisionRunningSince?.getTime() ?? null, elapsedMs: lesson.decisionElapsedMs, closedAt: lesson.decisionClosedAt?.getTime() ?? null, closeReason: lesson.decisionCloseReason };
}
export function decisionOutcome(person: LessonPresence): DecisionOutcome {
  return { entered: !!person.decisionEnteredAt, choice: person.decisionChoice as DecisionChoice | null, submittedAt: person.decisionSubmittedAt?.getTime() ?? null, elapsedMs: person.decisionElapsedMs, reason: person.decisionReason };
}
export function decisionEvent(lesson: LiveLesson, person: LessonPresence, now: Date, choice: DecisionChoice | null, elapsedMs: number, reason: string, trace: Prisma.InputJsonValue = []) {
  return { id: `${person.id}:decision`, userId: person.studentId, classId: lesson.classId, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-05-change", liveLessonId: lesson.id, sessionId: person.learningSessionId, eventType: "DECISION_RECORDED" as const, occurredAt: now, source: lesson.rehearsal ? "classroom-rehearsal" : "classroom", payload: { schemaVersion: 1, lessonId: lesson.id, rehearsal: lesson.rehearsal, choice, elapsedMs, reason, trace, pathsComplete: person.pathsViewed.length === 3, psychologicalAssessment: false } };
}
// Call with the lesson row locked. Expiry and submissions use the same lock.
export async function closeDecision(tx: Prisma.TransactionClient, lesson: LiveLesson, now: Date, reason: "timeout" | "teacher") {
  if (!lesson.decisionStartedAt || lesson.decisionClosedAt) return lesson;
  const elapsedMs = decisionElapsed(decisionClock(lesson), now.getTime());
  const closedAt = reason === "timeout" && lesson.decisionRunningSince ? new Date(lesson.decisionRunningSince.getTime() + DECISION_MS - lesson.decisionElapsedMs) : now;
  const pending = await tx.lessonPresence.findMany({ where: { lessonId: lesson.id, decisionEnteredAt: { not: null }, decisionReason: null } });
  if (pending.length) {
    await tx.lessonPresence.updateMany({ where: { id: { in: pending.map(person => person.id) } }, data: { decisionSubmittedAt: closedAt, decisionElapsedMs: elapsedMs, decisionReason: reason } });
    await tx.learningEvent.createMany({ data: pending.map(person => decisionEvent(lesson, person, closedAt, null, elapsedMs, reason)) });
  }
  return tx.liveLesson.update({ where: { id: lesson.id }, data: { decisionClosedAt: closedAt, decisionCloseReason: reason, decisionElapsedMs: elapsedMs, decisionRunningSince: null, version: { increment: 1 } } });
}
export async function settleExpiredDecision<T extends LiveLesson>(initial: T): Promise<T> {
  if (!initial.decisionStartedAt || initial.decisionClosedAt || decisionElapsed(decisionClock(initial), Date.now()) < DECISION_MS) return initial;
  const settled = await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${initial.id} FOR UPDATE`;
    const fresh = await tx.liveLesson.findUniqueOrThrow({ where: { id: initial.id } });
    const now = new Date();
    return decisionElapsed(decisionClock(fresh), now.getTime()) >= DECISION_MS ? closeDecision(tx, fresh, now, "timeout") : fresh;
  });
  return { ...initial, ...settled };
}
