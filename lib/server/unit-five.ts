import { UNIT_FIVE_INTERACTIONS } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { requireStudentContext } from "@/lib/server/auth";

function asRecord(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }

export async function getUnitFiveEvidence() {
  const actor = await requireStudentContext();
  const ids = UNIT_FIVE_INTERACTIONS.map((item) => item.id);
  const [unitProgress, allProgress, attempts, snapshots] = await Promise.all([
    db.progress.findMany({ where: { userId: actor.userId, status: "COMPLETED", interactionId: { in: ids } }, select: { interactionId: true, bestScore: true } }),
    db.progress.findMany({ where: { userId: actor.userId, status: "COMPLETED" }, select: { interactionId: true } }),
    db.attempt.findMany({ where: { userId: actor.userId, interactionId: { in: ids }, completedAt: { not: null } }, orderBy: { completedAt: "desc" } }),
    db.scoreSnapshot.findMany({ where: { userId: actor.userId, unitId: { in: ["unit-01", "unit-02", "unit-03", "unit-04", "unit-05"] } } }),
  ]);
  const latestByInteraction = new Map<string, Record<string, unknown>>(); const privateByInteraction = new Map<string, Record<string, unknown>>();
  for (const attempt of attempts) if (!latestByInteraction.has(attempt.interactionId)) { latestByInteraction.set(attempt.interactionId, asRecord(attempt.actionSummary)); privateByInteraction.set(attempt.interactionId, asRecord(attempt.privateContent)); }
  const current = [Math.max(...snapshots.map((item) => item.careerAbility), 50), Math.max(...snapshots.map((item) => item.psychological), 50), Math.max(...snapshots.map((item) => item.learningAbility), 50), Math.max(...snapshots.map((item) => item.teamwork), 50)];
  const first = snapshots.find((item) => item.unitId === "unit-01"); const baseline = [first?.baselineCareerAbility ?? 50, first?.baselinePsychological ?? 50, first?.baselineLearningAbility ?? 50, first?.baselineTeamwork ?? 50];
  return { completedInteractionIds: unitProgress.map((item) => item.interactionId), bestScores: Object.fromEntries(unitProgress.map((item) => [item.interactionId, item.bestScore])), latestByInteraction: Object.fromEntries(latestByInteraction), privateByInteraction: Object.fromEntries(privateByInteraction), abilities: { baseline, current }, allCompletedCount: allProgress.length };
}
