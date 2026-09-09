import { ProgressStatus } from "@/generated/prisma/client";
import { countsTowardUnitProgress, deriveUnitStatus, PROGRAM_UNITS, UNIT_FIVE_INTERACTIONS, UNIT_FOUR_INTERACTIONS, UNIT_ONE_INTERACTIONS, UNIT_THREE_INTERACTIONS, UNIT_TWO_INTERACTIONS } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { requireStudentContext } from "@/lib/server/auth";

export async function getProgramOverview() {
  const actor = await requireStudentContext();
  const student = await db.user.findUniqueOrThrow({ where: { id: actor.userId } });
  const units = await db.unit.findMany({ include: { tasks: { include: { interactions: true }, orderBy: { order: "asc" } } }, orderBy: { order: "asc" } });
  const progress = await db.progress.findMany({ where: { userId: actor.userId } });
  const completedByUnit = new Map<string, number>();
  const startedByUnit = new Set<string>();
  for (const item of progress) {
    startedByUnit.add(item.unitId);
    const countsTowardUnit = countsTowardUnitProgress(item.unitId, item.interactionId);
    if (item.status === ProgressStatus.COMPLETED && countsTowardUnit) completedByUnit.set(item.unitId, (completedByUnit.get(item.unitId) ?? 0) + 1);
  }
  const databaseUnits = new Map(units.map((unit) => [unit.id, unit]));
  const definitionsByUnit = [UNIT_ONE_INTERACTIONS, UNIT_TWO_INTERACTIONS, UNIT_THREE_INTERACTIONS, UNIT_FOUR_INTERACTIONS, UNIT_FIVE_INTERACTIONS] as const;
  const configuredByUnit = new Map<string, Array<{ id: string; title: string; route: string; main: boolean; section: string }>>();
  const now = new Date();
  const available = (item: { isPublished: boolean; availableFrom: Date | null; availableUntil: Date | null }) => item.isPublished && (!item.availableFrom || item.availableFrom <= now) && (!item.availableUntil || item.availableUntil >= now);
  const items = PROGRAM_UNITS.map((definition, definitionIndex) => {
    const unit = databaseUnits.get(definition.id);
    const records = unit?.tasks.flatMap((task) => task.interactions.map((interaction) => ({ ...interaction, task }))) ?? [];
    const recordById = new Map(records.map((item) => [item.id, item]));
    const configured = definitionsByUnit[definitionIndex].flatMap((item) => {
      const record = recordById.get(item.id);
      if (record && (!available(record) || !available(record.task))) return [];
      return [{ ...item, title: record?.title ?? item.title, adminOrder: (record?.task.order ?? 0) * 1000 + (record?.order ?? 0) }];
    }).sort((a, b) => a.adminOrder - b.adminOrder);
    configuredByUnit.set(definition.id, configured);
    const completedCount = completedByUnit.get(definition.id) ?? 0;
    const published = unit ? available(unit) : definition.published;
    const publishedMainCount = configured.filter((item) => item.main).length;
    const status = deriveUnitStatus({
      published,
      started: startedByUnit.has(definition.id),
      completedCount,
      totalInteractions: Math.max(1, publishedMainCount),
    });
    return {
      ...definition,
      title: unit?.title ?? definition.title,
      description: unit?.description ?? definition.description,
      order: unit?.order ?? definitionIndex + 1,
      published,
      status,
      completedCount,
      progressPercent: Math.min(100, Math.round(completedCount / Math.max(1, publishedMainCount) * 100)),
    };
  }).sort((a, b) => a.order - b.order);
  const completedIds = new Set(progress.filter((item) => item.status === ProgressStatus.COMPLETED).map((item) => item.interactionId));
  const activeUnit = items.find((item) => item.published && item.status !== "COMPLETED") ?? [...items].reverse().find((item) => item.published);
  const activeInteractions = activeUnit ? configuredByUnit.get(activeUnit.id) ?? [] : [];
  const nextRoute = activeInteractions.find((item) => item.main && !completedIds.has(item.id))?.route ?? activeUnit?.route ?? "/student/progress";
  return {
    student,
    units: items,
    nextRoute,
    nextLabel: activeUnit ? `${activeUnit.status === "NOT_STARTED" ? "开始" : activeUnit.status === "COMPLETED" ? "查看" : "继续"}${activeUnit.title}` : "查看完整成长成果",
  };
}

export async function getUnitTwoMap() {
  const overview = await getProgramOverview();
  const actor = await requireStudentContext();
  const progress = await db.progress.findMany({
    where: { userId: actor.userId, interactionId: { in: UNIT_TWO_INTERACTIONS.map((item) => item.id) } },
  });
  const byInteraction = Object.fromEntries(progress.map((item) => [item.interactionId, item]));
  return { ...overview, unit: overview.units.find((item) => item.id === "unit-02")!, interactions: await getConfiguredUnitInteractions("unit-02", UNIT_TWO_INTERACTIONS), byInteraction };
}

export async function getUnitThreeMap() {
  const overview = await getProgramOverview();
  const actor = await requireStudentContext();
  const progress = await db.progress.findMany({
    where: { userId: actor.userId, interactionId: { in: UNIT_THREE_INTERACTIONS.map((item) => item.id) } },
  });
  const byInteraction = Object.fromEntries(progress.map((item) => [item.interactionId, item]));
  return { ...overview, unit: overview.units.find((item) => item.id === "unit-03")!, interactions: await getConfiguredUnitInteractions("unit-03", UNIT_THREE_INTERACTIONS), byInteraction };
}

export async function getUnitFourMap() {
  const overview = await getProgramOverview();
  const actor = await requireStudentContext();
  const progress = await db.progress.findMany({ where: { userId: actor.userId, interactionId: { in: UNIT_FOUR_INTERACTIONS.map((item) => item.id) } } });
  return { ...overview, unit: overview.units.find((item) => item.id === "unit-04")!, interactions: await getConfiguredUnitInteractions("unit-04", UNIT_FOUR_INTERACTIONS), byInteraction: Object.fromEntries(progress.map((item) => [item.interactionId, item])) };
}

export async function getUnitFiveMap() {
  const overview = await getProgramOverview();
  const actor = await requireStudentContext();
  const progress = await db.progress.findMany({ where: { userId: actor.userId, interactionId: { in: UNIT_FIVE_INTERACTIONS.map((item) => item.id) } } });
  return { ...overview, unit: overview.units.find((item) => item.id === "unit-05")!, interactions: await getConfiguredUnitInteractions("unit-05", UNIT_FIVE_INTERACTIONS), byInteraction: Object.fromEntries(progress.map((item) => [item.interactionId, item])) };
}

export async function getUnitOneMap() {
  const overview = await getProgramOverview();
  const actor = await requireStudentContext();
  const progress = await db.progress.findMany({
    where: { userId: actor.userId, interactionId: { in: UNIT_ONE_INTERACTIONS.map((item) => item.id) } },
  });
  const byInteraction = Object.fromEntries(progress.map((item) => [item.interactionId, item]));
  return { ...overview, unit: overview.units.find((item) => item.id === "unit-01")!, interactions: await getConfiguredUnitInteractions("unit-01", UNIT_ONE_INTERACTIONS), byInteraction };
}

export async function getConfiguredUnitInteractions<T extends { id: string; title: string }>(unitId: string, definitions: readonly T[]): Promise<T[]> {
  const tasks = await db.task.findMany({ where: { unitId }, include: { interactions: true }, orderBy: { order: "asc" } });
  const now = new Date(); const records = tasks.flatMap((task) => task.interactions.map((interaction) => ({ ...interaction, task })));
  const recordById = new Map(records.map((item) => [item.id, item]));
  return definitions.flatMap((item) => { const record = recordById.get(item.id); const open = !record || (record.isPublished && record.task.isPublished && (!record.availableFrom || record.availableFrom <= now) && (!record.availableUntil || record.availableUntil >= now) && (!record.task.availableFrom || record.task.availableFrom <= now) && (!record.task.availableUntil || record.task.availableUntil >= now)); return open ? [{ ...item, title: record?.title ?? item.title, __order: (record?.task.order ?? 0) * 1000 + (record?.order ?? 0) }] : []; }).sort((a, b) => a.__order - b.__order).map((configured) => { const item = { ...configured } as T & { __order?: number }; delete item.__order; return item; });
}
