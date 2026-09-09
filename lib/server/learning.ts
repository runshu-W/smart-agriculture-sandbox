import { EventType, ProgressStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { calculateThresherScore, type ThresherResultInput } from "@/lib/game/thresher";
import { UNIT_FIVE_INTERACTIONS, UNIT_FIVE_MAIN_INTERACTIONS, UNIT_FOUR_INTERACTIONS, UNIT_FOUR_MAIN_INTERACTIONS, UNIT_ONE_INTERACTIONS, UNIT_ONE_MAIN_INTERACTIONS, UNIT_THREE_INTERACTIONS, UNIT_THREE_MAIN_INTERACTIONS, UNIT_TWO_INTERACTIONS, UNIT_TWO_MAIN_INTERACTIONS } from "@/lib/curriculum";
import { requireStudentContext, requireTeacherContext } from "@/lib/server/auth";
import { DEMO } from "@/lib/constants";

export async function startThresherAttempt() {
  const actor = await requireStudentContext();
  const eventBase = { userId: actor.userId, classId: actor.classId, unitId: DEMO.unitId, taskId: DEMO.taskId, interactionId: DEMO.interactionId };
  const session = await db.learningSession.create({
    data: { userId: actor.userId, classId: actor.classId, unitId: DEMO.unitId },
  });
  const attempt = await db.attempt.create({
    data: { userId: actor.userId, sessionId: session.id, interactionId: DEMO.interactionId },
  });
  const existing = await db.progress.findUnique({
    where: { userId_interactionId: { userId: actor.userId, interactionId: DEMO.interactionId } },
  });
  if (!existing) {
    await db.progress.create({
      data: {
        userId: actor.userId,
        unitId: DEMO.unitId,
        interactionId: DEMO.interactionId,
        status: ProgressStatus.IN_PROGRESS,
      },
    });
  }
  await db.learningEvent.createMany({
    data: [
      { ...eventBase, sessionId: session.id, attemptId: attempt.id, eventType: EventType.UNIT_ENTERED, occurredAt: new Date(), payload: { entry: "unit-page" } },
      { ...eventBase, sessionId: session.id, attemptId: attempt.id, eventType: EventType.INTERACTION_STARTED, occurredAt: new Date(), payload: { input: "pointer-rotation" } },
    ],
  });
  return { sessionId: session.id, attemptId: attempt.id };
}

export async function completeThresherAttempt(attemptId: string, input: ThresherResultInput & { dragSegments: number; questionResponses?: Array<{ key: string; answer: string; correct: boolean; version: number }> }) {
  const actor = await requireStudentContext();
  const eventBase = { userId: actor.userId, classId: actor.classId, unitId: DEMO.unitId, taskId: DEMO.taskId, interactionId: DEMO.interactionId };
  const attempt = await db.attempt.findFirstOrThrow({
    where: { id: attemptId, userId: actor.userId, interactionId: DEMO.interactionId },
  });
  const managedQuestion = await db.question.findFirst({ where: { interactionId: DEMO.interactionId, isPublished: true }, orderBy: { order: "asc" } });
  const accepted = Array.isArray(managedQuestion?.correctAnswers) ? managedQuestion.correctAnswers.map(String) : ["B"];
  const verifiedResponses = (input.questionResponses ?? []).map((response) => ({ ...response, correct: accepted.includes(response.answer), version: managedQuestion?.version ?? response.version }));
  const result = calculateThresherScore({ ...input, answers: verifiedResponses.length ? verifiedResponses.map((response) => response.correct ? "B" : "A") : input.answers });
  const previousProgress = await db.progress.findUnique({
    where: { userId_interactionId: { userId: actor.userId, interactionId: DEMO.interactionId } },
  });
  const firstCompletion = previousProgress?.status !== ProgressStatus.COMPLETED;
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.attempt.update({
      where: { id: attempt.id },
      data: {
        completedAt: now,
        effectiveDurationMs: input.effectiveDurationMs,
        dragSegments: input.dragSegments,
        answerAttempts: input.answers.length,
        firstAnswerCorrect: result.firstCorrect,
        finalAnswerCorrect: result.finalCorrect,
        narrationCompleted: input.narrationCompleted,
        score: result.score,
        actionSummary: { effectiveDurationMs: input.effectiveDurationMs, dragSegments: input.dragSegments, questionKey: managedQuestion?.key ?? "static", questionVersion: managedQuestion?.version ?? 0 },
        selectedAnswers: input.answers,
      },
    });
    await tx.learningSession.update({ where: { id: attempt.sessionId }, data: { endedAt: now } });
    await tx.progress.upsert({
      where: { userId_interactionId: { userId: actor.userId, interactionId: DEMO.interactionId } },
      create: {
        userId: actor.userId,
        unitId: DEMO.unitId,
        interactionId: DEMO.interactionId,
        status: result.completed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        bestScore: result.score,
        completedAt: result.completed ? now : null,
      },
      update: {
        status: result.completed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        bestScore: Math.max(previousProgress?.bestScore ?? 0, result.score),
        completedAt: result.completed ? previousProgress?.completedAt ?? now : previousProgress?.completedAt,
      },
    });
    if (firstCompletion && result.completed) {
      await tx.scoreSnapshot.update({
        where: { userId_unitId: { userId: actor.userId, unitId: DEMO.unitId } },
        data: { careerAbility: { increment: 4 }, learningAbility: { increment: 6 } },
      });
    }
    const events = [
      {
        ...eventBase,
        sessionId: attempt.sessionId,
        attemptId,
        eventType: EventType.INTERACTION_ACTION,
        occurredAt: now,
        payload: { effectiveDurationMs: input.effectiveDurationMs, dragSegments: input.dragSegments },
      },
      ...(input.narrationCompleted
        ? [{ ...eventBase, sessionId: attempt.sessionId, attemptId, eventType: EventType.NARRATION_COMPLETED, occurredAt: now, payload: { mode: "subtitle" } }]
        : []),
      ...(verifiedResponses.length ? verifiedResponses : input.answers.map((answer) => ({ key: "static", answer, correct: answer === "B", version: 0 }))).map((response, index) => ({
        ...eventBase,
        sessionId: attempt.sessionId,
        attemptId,
        eventType: EventType.ANSWER_SUBMITTED,
        occurredAt: now,
        payload: { questionKey: response.key, questionVersion: response.version, answer: response.answer, attemptNumber: index + 1, correct: response.correct },
      })),
      {
        ...eventBase,
        sessionId: attempt.sessionId,
        attemptId,
        eventType: EventType.INTERACTION_COMPLETED,
        occurredAt: now,
        payload: { score: result.score, firstCorrect: result.firstCorrect, finalCorrect: result.finalCorrect },
      },
    ];
    await tx.learningEvent.createMany({ data: events });
  });

  return result;
}

export async function getStudentSummary() {
  const actor = await requireStudentContext();
  const student = await db.user.findUniqueOrThrow({ where: { id: actor.userId } });
  const allInteractions = [...UNIT_ONE_INTERACTIONS, ...UNIT_TWO_INTERACTIONS, ...UNIT_THREE_INTERACTIONS, ...UNIT_FOUR_INTERACTIONS, ...UNIT_FIVE_INTERACTIONS];
  const allProgress = await db.progress.findMany({ where: { userId: actor.userId, interactionId: { in: allInteractions.map((item) => item.id) } } });
  const snapshots = await db.scoreSnapshot.findMany({ where: { userId: actor.userId, unitId: { in: ["unit-01", "unit-02", "unit-03", "unit-04", "unit-05"] } } });
  const unitOneSnapshot = snapshots.find((item) => item.unitId === "unit-01");
  const unitTwoSnapshot = snapshots.find((item) => item.unitId === "unit-02");
  const unitThreeSnapshot = snapshots.find((item) => item.unitId === "unit-03");
  const unitFourSnapshot = snapshots.find((item) => item.unitId === "unit-04");
  const unitFiveSnapshot = snapshots.find((item) => item.unitId === "unit-05");
  if (!unitOneSnapshot || !unitTwoSnapshot || !unitThreeSnapshot || !unitFourSnapshot || !unitFiveSnapshot) throw new Error("Missing score snapshot");
  const snapshot = {
    careerAbility: Math.max(unitOneSnapshot.careerAbility, unitFiveSnapshot.careerAbility),
    psychological: Math.max(unitTwoSnapshot.psychological, unitThreeSnapshot.psychological, unitFiveSnapshot.psychological),
    learningAbility: Math.max(unitOneSnapshot.learningAbility, unitFourSnapshot.learningAbility, unitFiveSnapshot.learningAbility),
    teamwork: Math.max(unitOneSnapshot.teamwork, unitTwoSnapshot.teamwork, unitThreeSnapshot.teamwork, unitFiveSnapshot.teamwork),
  };
  const recentEvents = await db.learningEvent.findMany({ where: { source: { not: "classroom-rehearsal" }, userId: actor.userId }, orderBy: { occurredAt: "desc" }, take: 5 });
  const roleAttempt = await db.attempt.findFirst({ where: { userId: actor.userId, interactionId: "u01-assess-03-role-card", completedAt: { not: null } }, orderBy: { completedAt: "desc" } });
  const roleSummary = roleAttempt?.actionSummary && typeof roleAttempt.actionSummary === "object" && !Array.isArray(roleAttempt.actionSummary) ? roleAttempt.actionSummary as Record<string, unknown> : {};
  const roleContent = roleAttempt?.privateContent && typeof roleAttempt.privateContent === "object" && !Array.isArray(roleAttempt.privateContent) ? roleAttempt.privateContent as Record<string, unknown> : {};
  const strategyAttempts = await db.attempt.findMany({
    where: { userId: actor.userId, interactionId: { in: ["u02-frustration-03-coping-toolbox", "u02-energy-01-collect"] }, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });
  const strategies = new Set<string>();
  for (const attempt of strategyAttempts) {
    const action = attempt.actionSummary && typeof attempt.actionSummary === "object" && !Array.isArray(attempt.actionSummary) ? attempt.actionSummary as Record<string, unknown> : {};
    if (typeof action.strategy === "string") strategies.add(action.strategy);
    if (typeof action.preferred === "string") action.preferred.split("|").forEach((item) => strategies.add(item));
  }
  return { student, allProgress, snapshot, snapshots, strategies: [...strategies], recentEvents, roleCard: { role: roleSummary.role, avatar: roleSummary.avatar, nickname: roleContent.nickname } };
}

export async function getTeacherSummary() {
  const actor = await requireTeacherContext();
  const studentCount = await db.enrollment.count({ where: { classId: actor.classId, status: "ACTIVE", user: { role: "STUDENT", status: "ACTIVE" } } });
  const attempts = await db.attempt.findMany({ where: { interactionId: { in: UNIT_ONE_INTERACTIONS.map((item) => item.id) }, completedAt: { not: null }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } }, orderBy: { completedAt: "desc" } });
  const snapshots = await db.scoreSnapshot.findMany({ where: { unitId: DEMO.unitId, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const m2aProgress = await db.progress.findMany({ where: { unitId: DEMO.unitId, status: ProgressStatus.COMPLETED, interactionId: { in: UNIT_ONE_INTERACTIONS.map((item) => item.id) }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const bestByStudent = new Map<string, number>();
  for (const attempt of attempts) bestByStudent.set(attempt.userId, Math.max(bestByStudent.get(attempt.userId) ?? 0, attempt.score));
  const scores = [...bestByStudent.values()];
  const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const retries = attempts.filter((attempt) => attempt.answerAttempts > 1).length;
  const completedMainByStudent = new Map<string, Set<string>>();
  const mainIds = new Set<string>(UNIT_ONE_MAIN_INTERACTIONS.map((item) => item.id));
  for (const item of m2aProgress) {
    if (!mainIds.has(item.interactionId)) continue;
    const items = completedMainByStudent.get(item.userId) ?? new Set<string>();
    items.add(item.interactionId);
    completedMainByStudent.set(item.userId, items);
  }
  const completed = [...completedMainByStudent.values()].filter((items) => items.size >= UNIT_ONE_MAIN_INTERACTIONS.length).length;
  const completionByInteraction = Object.fromEntries(UNIT_ONE_INTERACTIONS.map((interaction) => [interaction.id, m2aProgress.filter((item) => item.interactionId === interaction.id).length]));
  const average = (key: "careerAbility" | "psychological" | "learningAbility" | "teamwork") =>
    snapshots.length ? Math.round(snapshots.reduce((sum, item) => sum + item[key], 0) / snapshots.length) : 0;
  const unitTwoProgress = await db.progress.findMany({ where: { unitId: "unit-02", status: ProgressStatus.COMPLETED, interactionId: { in: UNIT_TWO_INTERACTIONS.map((item) => item.id) }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitTwoSnapshots = await db.scoreSnapshot.findMany({ where: { unitId: "unit-02", user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitTwoAttempts = await db.attempt.findMany({
    where: { interactionId: { in: UNIT_TWO_INTERACTIONS.map((item) => item.id) }, completedAt: { not: null }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } },
    orderBy: { completedAt: "desc" },
  });
  const unitTwoCompletedByStudent = new Map<string, Set<string>>();
  for (const item of unitTwoProgress) {
    if (!UNIT_TWO_MAIN_INTERACTIONS.some((interaction) => interaction.id === item.interactionId)) continue;
    const items = unitTwoCompletedByStudent.get(item.userId) ?? new Set<string>();
    items.add(item.interactionId); unitTwoCompletedByStudent.set(item.userId, items);
  }
  const unitTwoCompleted = [...unitTwoCompletedByStudent.values()].filter((items) => items.size >= UNIT_TWO_MAIN_INTERACTIONS.length).length;
  const unitTwoCompletionByInteraction = Object.fromEntries(UNIT_TWO_INTERACTIONS.map((interaction) => [interaction.id, unitTwoProgress.filter((item) => item.interactionId === interaction.id).length]));
  const strategies = new Map<string, number>();
  for (const attempt of unitTwoAttempts.filter((item) => item.interactionId === "u02-frustration-03-coping-toolbox")) {
    const action = attempt.actionSummary && typeof attempt.actionSummary === "object" && !Array.isArray(attempt.actionSummary) ? attempt.actionSummary as Record<string, unknown> : {};
    if (typeof action.strategy === "string") strategies.set(action.strategy, (strategies.get(action.strategy) ?? 0) + 1);
  }
  const u02Average = (key: "baselinePsychological" | "psychological" | "teamwork") => unitTwoSnapshots.length ? Math.round(unitTwoSnapshots.reduce((sum, item) => sum + item[key], 0) / unitTwoSnapshots.length) : 0;
  const frustrationIds = UNIT_TWO_INTERACTIONS.filter((item) => item.section === "挫折模拟田野").map((item) => item.id);
  const frustrationCompleted = unitTwoProgress.filter((item) => frustrationIds.includes(item.interactionId)).length;
  const unitThreeProgress = await db.progress.findMany({ where: { unitId: "unit-03", status: ProgressStatus.COMPLETED, interactionId: { in: UNIT_THREE_INTERACTIONS.map((item) => item.id) }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitThreeSnapshots = await db.scoreSnapshot.findMany({ where: { unitId: "unit-03", user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitThreeAttempts = await db.attempt.findMany({
    where: { interactionId: { in: UNIT_THREE_INTERACTIONS.map((item) => item.id) }, completedAt: { not: null }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } },
    orderBy: { completedAt: "desc" },
  });
  const unitThreeCompletedByStudent = new Map<string, Set<string>>();
  for (const item of unitThreeProgress) {
    if (!UNIT_THREE_MAIN_INTERACTIONS.some((interaction) => interaction.id === item.interactionId)) continue;
    const items = unitThreeCompletedByStudent.get(item.userId) ?? new Set<string>();
    items.add(item.interactionId); unitThreeCompletedByStudent.set(item.userId, items);
  }
  const unitThreeCompleted = [...unitThreeCompletedByStudent.values()].filter((items) => items.size >= UNIT_THREE_MAIN_INTERACTIONS.length).length;
  const unitThreeCompletionByInteraction = Object.fromEntries(UNIT_THREE_INTERACTIONS.map((interaction) => [interaction.id, unitThreeProgress.filter((item) => item.interactionId === interaction.id).length]));
  const communicationIds = UNIT_THREE_INTERACTIONS.filter((item) => item.section === "职场沟通大厅").map((item) => item.id);
  const communicationCompleted = unitThreeProgress.filter((item) => communicationIds.includes(item.interactionId)).length;
  const communicationStrategies = new Map<string, number>();
  for (const attempt of unitThreeAttempts.filter((item) => communicationIds.includes(item.interactionId))) {
    const action = attempt.actionSummary && typeof attempt.actionSummary === "object" && !Array.isArray(attempt.actionSummary) ? attempt.actionSummary as Record<string, unknown> : {};
    const strategy = [action.strategy, action.openingStyle, action.allocationStyle].find((item): item is string => typeof item === "string");
    if (strategy) communicationStrategies.set(strategy, (communicationStrategies.get(strategy) ?? 0) + 1);
  }
  const u03Average = (key: "baselinePsychological" | "psychological" | "teamwork") => unitThreeSnapshots.length ? Math.round(unitThreeSnapshots.reduce((sum, item) => sum + item[key], 0) / unitThreeSnapshots.length) : 0;
  const unitFourProgress = await db.progress.findMany({ where: { unitId: "unit-04", status: ProgressStatus.COMPLETED, interactionId: { in: UNIT_FOUR_INTERACTIONS.map((item) => item.id) }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitFourSnapshots = await db.scoreSnapshot.findMany({ where: { unitId: "unit-04", user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitFourCompletedByStudent = new Map<string, Set<string>>();
  for (const item of unitFourProgress) {
    if (!UNIT_FOUR_MAIN_INTERACTIONS.some((interaction) => interaction.id === item.interactionId)) continue;
    const items = unitFourCompletedByStudent.get(item.userId) ?? new Set<string>(); items.add(item.interactionId); unitFourCompletedByStudent.set(item.userId, items);
  }
  const unitFourCompleted = [...unitFourCompletedByStudent.values()].filter((items) => items.size >= UNIT_FOUR_MAIN_INTERACTIONS.length).length;
  const unitFourCompletionByInteraction = Object.fromEntries(UNIT_FOUR_INTERACTIONS.map((interaction) => [interaction.id, unitFourProgress.filter((item) => item.interactionId === interaction.id).length]));
  const aiIds = UNIT_FOUR_INTERACTIONS.filter((item) => item.section === "AI 技能大比拼").map((item) => item.id);
  const planIds = UNIT_FOUR_INTERACTIONS.filter((item) => item.section === "学习计划制定").map((item) => item.id);
  const u04Average = (key: "baselineLearningAbility" | "learningAbility" | "psychological") => unitFourSnapshots.length ? Math.round(unitFourSnapshots.reduce((sum, item) => sum + item[key], 0) / unitFourSnapshots.length) : 0;
  const unitFiveProgress = await db.progress.findMany({ where: { unitId: "unit-05", status: ProgressStatus.COMPLETED, interactionId: { in: UNIT_FIVE_INTERACTIONS.map((item) => item.id) }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitFiveSnapshots = await db.scoreSnapshot.findMany({ where: { unitId: "unit-05", user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } });
  const unitFiveAttempts = await db.attempt.findMany({ where: { interactionId: { in: UNIT_FIVE_INTERACTIONS.map((item) => item.id) }, completedAt: { not: null }, user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } }, orderBy: { completedAt: "desc" } });
  const unitFiveCompletedByStudent = new Map<string, Set<string>>();
  for (const item of unitFiveProgress) { if (!UNIT_FIVE_MAIN_INTERACTIONS.some((interaction) => interaction.id === item.interactionId)) continue; const items = unitFiveCompletedByStudent.get(item.userId) ?? new Set<string>(); items.add(item.interactionId); unitFiveCompletedByStudent.set(item.userId, items); }
  const unitFiveCompleted = [...unitFiveCompletedByStudent.values()].filter((items) => items.size >= UNIT_FIVE_MAIN_INTERACTIONS.length).length;
  const unitFiveCompletionByInteraction = Object.fromEntries(UNIT_FIVE_INTERACTIONS.map((interaction) => [interaction.id, unitFiveProgress.filter((item) => item.interactionId === interaction.id).length]));
  const endingDistribution = new Map<string, number>(); const visibilityDistribution = new Map<string, number>();
  for (const attempt of unitFiveAttempts) { const action = attempt.actionSummary && typeof attempt.actionSummary === "object" && !Array.isArray(attempt.actionSummary) ? attempt.actionSummary as Record<string, unknown> : {}; if (attempt.interactionId === "u05-ending-01-future" && typeof action.ending === "string") endingDistribution.set(action.ending, (endingDistribution.get(action.ending) ?? 0) + 1); if (attempt.interactionId === "u05-dream-01-publish" && typeof action.answer === "string") visibilityDistribution.set(action.answer, (visibilityDistribution.get(action.answer) ?? 0) + 1); }
  const u05Average = (key: "baselineCareerAbility" | "careerAbility" | "psychological" | "learningAbility" | "teamwork") => unitFiveSnapshots.length ? Math.round(unitFiveSnapshots.reduce((sum, item) => sum + item[key], 0) / unitFiveSnapshots.length) : 0;
  return {
    studentCount,
    completed,
    averageScore,
    retryRate: attempts.length ? Math.round((retries / attempts.length) * 100) : 0,
    interactionCount: UNIT_ONE_INTERACTIONS.length,
    abilities: {
      careerAbility: average("careerAbility"),
      psychological: average("psychological"),
      learningAbility: average("learningAbility"),
      teamwork: average("teamwork"),
    },
    m2aInteractions: UNIT_ONE_INTERACTIONS.map((interaction) => ({ ...interaction, completed: completionByInteraction[interaction.id] ?? 0 })),
    recentAttempts: attempts.slice(0, 6),
    unitTwo: {
      completed: unitTwoCompleted,
      interactions: UNIT_TWO_INTERACTIONS.map((interaction) => ({ ...interaction, completed: unitTwoCompletionByInteraction[interaction.id] ?? 0 })),
      psychologicalBaseline: u02Average("baselinePsychological"),
      psychologicalCurrent: u02Average("psychological"),
      teamwork: u02Average("teamwork"),
      frustrationCompletionPercent: studentCount ? Math.round(frustrationCompleted / (studentCount * frustrationIds.length) * 100) : 0,
      strategyDistribution: [...strategies.entries()].map(([strategy, count]) => ({ strategy, count })),
      recentAttempts: unitTwoAttempts.slice(0, 6),
    },
    unitThree: {
      completed: unitThreeCompleted,
      interactions: UNIT_THREE_INTERACTIONS.map((interaction) => ({ ...interaction, completed: unitThreeCompletionByInteraction[interaction.id] ?? 0 })),
      psychologicalBaseline: u03Average("baselinePsychological"),
      psychologicalCurrent: u03Average("psychological"),
      teamwork: u03Average("teamwork"),
      communicationCompletionPercent: studentCount ? Math.round(communicationCompleted / (studentCount * communicationIds.length) * 100) : 0,
      communicationStrategies: [...communicationStrategies.entries()].map(([strategy, count]) => ({ strategy, count })),
      recentAttempts: unitThreeAttempts.slice(0, 6),
    },
    unitFour: {
      completed: unitFourCompleted,
      interactions: UNIT_FOUR_INTERACTIONS.map((interaction) => ({ ...interaction, completed: unitFourCompletionByInteraction[interaction.id] ?? 0 })),
      learningBaseline: u04Average("baselineLearningAbility"),
      learningCurrent: u04Average("learningAbility"),
      psychological: u04Average("psychological"),
      aiCompletionPercent: studentCount ? Math.round(unitFourProgress.filter((item) => aiIds.includes(item.interactionId)).length / (studentCount * aiIds.length) * 100) : 0,
      planCompletionPercent: studentCount ? Math.round(unitFourProgress.filter((item) => planIds.includes(item.interactionId)).length / (studentCount * planIds.length) * 100) : 0,
    },
    unitFive: {
      completed: unitFiveCompleted,
      interactions: UNIT_FIVE_INTERACTIONS.map((interaction) => ({ ...interaction, completed: unitFiveCompletionByInteraction[interaction.id] ?? 0 })),
      careerBaseline: u05Average("baselineCareerAbility"),
      careerCurrent: u05Average("careerAbility"),
      psychological: u05Average("psychological"),
      learningAbility: u05Average("learningAbility"),
      teamwork: u05Average("teamwork"),
      planCompletionPercent: studentCount ? Math.round(unitFiveProgress.filter((item) => item.interactionId.startsWith("u05-plan-")).length / (studentCount * 7) * 100) : 0,
      dreamParticipationPercent: studentCount ? Math.round(unitFiveProgress.filter((item) => item.interactionId.startsWith("u05-dream-")).length / (studentCount * 3) * 100) : 0,
      endingDistribution: [...endingDistribution.entries()].map(([ending, count]) => ({ ending, count })),
      visibilityDistribution: [...visibilityDistribution.entries()].map(([visibility, count]) => ({ visibility, count })),
    },
  };
}
