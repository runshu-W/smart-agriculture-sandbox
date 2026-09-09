import { db } from "@/lib/db";
import { UNIT_ONE_INTERACTIONS } from "@/lib/curriculum";
import { requireStudentContext } from "@/lib/server/auth";

function asPrivateContent(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getUnitOneEvidence() {
  const actor = await requireStudentContext();
  // The local Prisma dev database has a deliberately small connection pool.
  // Keep page-data reads sequential so one activity page cannot exhaust it.
  const assessment = await db.attempt.findFirst({ where: { userId: actor.userId, interactionId: "u01-assess-01-quiz", completedAt: { not: null } }, orderBy: { completedAt: "desc" } });
  const originalNotes = await db.attempt.findFirst({ where: { userId: actor.userId, interactionId: "u01-impression-01-original", completedAt: { not: null } }, orderBy: { completedAt: "desc" } });
  const completedProgress = await db.progress.findMany({ where: { userId: actor.userId, status: "COMPLETED", interactionId: { in: UNIT_ONE_INTERACTIONS.map((item) => item.id) } }, select: { interactionId: true } });
  return {
    assessmentAnswers: asPrivateContent(assessment?.privateContent).answers ?? [],
    originalNotes: asPrivateContent(originalNotes?.privateContent).notes ?? [],
    completedInteractionIds: completedProgress.map((item) => item.interactionId),
  };
}

export async function hasEnteredUnitOne() {
  const actor = await requireStudentContext();
  return Boolean(await db.progress.findFirst({ where: { userId: actor.userId, interactionId: "u01-entry-invitation", status: "COMPLETED" }, select: { id: true } }));
}
