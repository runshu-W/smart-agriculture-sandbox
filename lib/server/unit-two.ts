import { UNIT_TWO_INTERACTIONS } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { requireStudentContext } from "@/lib/server/auth";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getUnitTwoEvidence() {
  const actor = await requireStudentContext();
  const roleAttempt = await db.attempt.findFirst({
    where: { userId: actor.userId, interactionId: "u01-assess-03-role-card", completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });
  const completedProgress = await db.progress.findMany({
    where: { userId: actor.userId, status: "COMPLETED", interactionId: { in: UNIT_TWO_INTERACTIONS.map((item) => item.id) } },
    select: { interactionId: true, bestScore: true },
  });
  const attempts = await db.attempt.findMany({
    where: { userId: actor.userId, interactionId: { in: UNIT_TWO_INTERACTIONS.map((item) => item.id) }, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });
  const latestByInteraction = new Map<string, Record<string, unknown>>();
  for (const attempt of attempts) {
    if (!latestByInteraction.has(attempt.interactionId)) latestByInteraction.set(attempt.interactionId, asRecord(attempt.actionSummary));
  }
  const role = asRecord(roleAttempt?.actionSummary);
  return {
    completedInteractionIds: completedProgress.map((item) => item.interactionId),
    bestScores: Object.fromEntries(completedProgress.map((item) => [item.interactionId, item.bestScore])),
    role: typeof role.role === "string" ? role.role : "助农电商主播",
    avatar: typeof role.avatar === "string" ? role.avatar : "anchor-female",
    latestByInteraction: Object.fromEntries(latestByInteraction),
  };
}
