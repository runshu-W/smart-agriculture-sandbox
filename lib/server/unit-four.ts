import { UNIT_FOUR_INTERACTIONS } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { requireStudentContext } from "@/lib/server/auth";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getUnitFourEvidence() {
  const actor = await requireStudentContext();
  const ids = UNIT_FOUR_INTERACTIONS.map((item) => item.id);
  const [progress, attempts] = await Promise.all([
    db.progress.findMany({ where: { userId: actor.userId, status: "COMPLETED", interactionId: { in: ids } }, select: { interactionId: true, bestScore: true } }),
    db.attempt.findMany({ where: { userId: actor.userId, interactionId: { in: ids }, completedAt: { not: null } }, orderBy: { completedAt: "desc" } }),
  ]);
  const latestByInteraction = new Map<string, Record<string, unknown>>();
  const privateByInteraction = new Map<string, Record<string, unknown>>();
  for (const attempt of attempts) if (!latestByInteraction.has(attempt.interactionId)) {
    latestByInteraction.set(attempt.interactionId, asRecord(attempt.actionSummary));
    privateByInteraction.set(attempt.interactionId, asRecord(attempt.privateContent));
  }
  return { completedInteractionIds: progress.map((item) => item.interactionId), bestScores: Object.fromEntries(progress.map((item) => [item.interactionId, item.bestScore])), latestByInteraction: Object.fromEntries(latestByInteraction), privateByInteraction: Object.fromEntries(privateByInteraction) };
}
