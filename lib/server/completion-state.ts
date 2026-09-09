import "server-only";
import { db } from "@/lib/db";
import type { LessonPresence, LiveLesson, Prisma } from "@/generated/prisma/client";
import { activityElapsed, groupRepresentatives, timingStats, type ActivityClock, type CompletionSnapshot, type MapCard, type MapSignal, type TimingChoice } from "@/lib/classroom-completion";
export function completionClock(lesson: LiveLesson, kind: "map" | "vote"): ActivityClock { return { startedAt: lesson[`${kind}StartedAt`]?.getTime() ?? null, runningSince: lesson[`${kind}RunningSince`]?.getTime() ?? null, elapsedMs: lesson[`${kind}ElapsedMs`], closedAt: lesson[`${kind}ClosedAt`]?.getTime() ?? null }; }
export function timingOutcome(person: LessonPresence) { return { entered: !!person.voteEnteredAt, choice: person.voteChoice as TimingChoice | null, reason: person.voteReason, elapsedMs: person.voteResponseMs }; }
export function completionEvent(lesson: LiveLesson, person: LessonPresence, eventType: "CHANGE_MAP_SAVED" | "CHANGE_MAP_SHARED" | "GROUP_MAP_VIEWED" | "MAP_NOMINATED" | "TIMING_VOTED", suffix: string, payload: Prisma.InputJsonValue) {
  return { id: `${person.id}:${suffix}`, eventType, userId: person.studentId, classId: lesson.classId, sessionId: person.learningSessionId, liveLessonId: lesson.id, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-05-change", source: lesson.rehearsal ? "classroom-rehearsal" : "classroom", occurredAt: new Date(), payload };
}
export async function closeTimingVote(tx: Prisma.TransactionClient, lesson: LiveLesson, now: Date, reason: "timeout" | "teacher") {
  if (!lesson.voteStartedAt || lesson.voteClosedAt) return lesson;
  const elapsedMs = activityElapsed(completionClock(lesson, "vote"), now.getTime(), 10000);
  const pending = await tx.lessonPresence.findMany({ where: { lessonId: lesson.id, voteEnteredAt: { not: null }, voteReason: null } });
  const closedAt = reason === "timeout" && lesson.voteRunningSince ? new Date(lesson.voteRunningSince.getTime() + 10000 - lesson.voteElapsedMs) : now;
  if (pending.length) {
    await tx.lessonPresence.updateMany({ where: { id: { in: pending.map(person => person.id) } }, data: { voteSubmittedAt: closedAt, voteResponseMs: elapsedMs, voteReason: reason } });
    await tx.learningEvent.createMany({ data: pending.map(person => ({ ...completionEvent(lesson, person, "TIMING_VOTED", "timing-vote", { schemaVersion: 1, choice: null, elapsedMs, reason, rehearsal: lesson.rehearsal }), occurredAt: closedAt })) });
  }
  return tx.liveLesson.update({ where: { id: lesson.id }, data: { voteClosedAt: closedAt, voteElapsedMs: elapsedMs, voteRunningSince: null, version: { increment: 1 } } });
}
export async function settleCompletion<T extends LiveLesson>(initial: T): Promise<T> {
  const voteDue = initial.voteStartedAt && !initial.voteClosedAt && activityElapsed(completionClock(initial, "vote"), Date.now()) >= 10000;
  const mapDue = initial.mapStartedAt && !initial.mapClosedAt && activityElapsed(completionClock(initial, "map"), Date.now()) >= 720000;
  if (!voteDue && !mapDue) return initial;
  const result = await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "LiveLesson" WHERE "id" = ${initial.id} FOR UPDATE`;
    let lesson = await tx.liveLesson.findUniqueOrThrow({ where: { id: initial.id } }); const now = new Date();
    if (lesson.voteStartedAt && !lesson.voteClosedAt && activityElapsed(completionClock(lesson, "vote"), now.getTime()) >= 10000) lesson = await closeTimingVote(tx, lesson, now, "timeout");
    if (lesson.mapStartedAt && !lesson.mapClosedAt && activityElapsed(completionClock(lesson, "map"), now.getTime()) >= 720000) lesson = await tx.liveLesson.update({ where: { id: lesson.id }, data: { mapClosedAt: now, mapRunningSince: null, mapElapsedMs: 720000, version: { increment: 1 } } });
    return lesson;
  });
  return { ...initial, ...result };
}
export function completionSnapshot(lesson: LiveLesson, people: LessonPresence[], members: { user: { id: string; displayName: string } }[], actorId: string, view: "teacher" | "student" | "screen"): CompletionSnapshot {
  const groups = lesson.mapGroups as Record<string, number>, byId = new Map(people.map(person => [person.studentId, person]));
  const cards: MapCard[] = members.map(({ user }) => { const person = byId.get(user.id); return { studentId: user.id, name: user.displayName, group: groups[user.id] ?? null, signals: (person?.mapSignals as MapSignal[] | undefined) ?? [], submitted: !!person?.mapSubmittedAt, version: person?.mapVersion ?? 0, nominations: people.filter(other => other.mapNominatedId === user.id).length }; });
  const own = byId.get(actorId), clock = completionClock(lesson, "map");
  const elapsed = activityElapsed(clock, Date.now());
  const share = lesson.stage === 4 && clock.startedAt !== null && !clock.closedAt && elapsed >= 180000 && elapsed < 600000;
  return { map: clock, projectedMap: lesson.mapPresentation as MapCard | null, vote: completionClock(lesson, "vote"), signalsVisible: lesson.signalsVisible,
    ...(view === "student" && own ? { ownMap: cards.find(card => card.studentId === actorId), ownNomination: own.mapNominatedId, groupMaps: share && groups[actorId] ? cards.filter(card => card.group === groups[actorId] && card.submitted) : [], ownVote: timingOutcome(own) } : {}),
    ...(view === "teacher" ? { mapRoster: cards, representatives: groupRepresentatives(cards) } : {}),
    ...(view !== "student" || lesson.voteClosedAt ? { voteStats: timingStats(people.map(timingOutcome)) } : { voteStats: { ...timingStats(people.map(timingOutcome)), options: [], majorityImmediate: false } }),
  };
}
