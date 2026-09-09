import { EventType, ProgressStatus } from "@/generated/prisma/client";
import { getAbilityIncrement, getMainInteractionsForUnit, getUnitBadge, shouldEmitUnitCompletion, SIMPLE_INTERACTION_RULES } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { calculateSimpleInteractionResult } from "@/lib/game/simple-interaction";
import { requireStudentContext } from "@/lib/server/auth";

type SimpleInteractionId = keyof typeof SIMPLE_INTERACTION_RULES;
type CompleteInput = {
  durationMs: number;
  narrationCompleted: boolean;
  answers: string[];
  questionResponses?: Array<{ key: string; answer: string; correct: boolean; version: number }>;
  actionSummary: Record<string, boolean | number | string>;
  privateContent?: Record<string, string | string[]>;
};

function isSimpleInteraction(id: string): id is SimpleInteractionId {
  return id in SIMPLE_INTERACTION_RULES;
}

export async function startSimpleInteraction(interactionId: string, entry = "unit-map") {
  if (!isSimpleInteraction(interactionId)) throw new Error("Unsupported interaction");
  const actor = await requireStudentContext();
  const interaction = await db.interaction.findUniqueOrThrow({ where: { id: interactionId }, include: { task: true } });
  if (!interaction.isPublished || !interaction.task.isPublished) throw new Error("Unavailable interaction");
  const session = await db.learningSession.create({
    data: { userId: actor.userId, classId: actor.classId, unitId: interaction.task.unitId },
  });
  const attempt = await db.attempt.create({
    data: { userId: actor.userId, sessionId: session.id, interactionId },
  });
  const key = { userId_interactionId: { userId: actor.userId, interactionId } };
  const existing = await db.progress.findUnique({ where: key });
  if (!existing) {
    await db.progress.create({
      data: { userId: actor.userId, unitId: interaction.task.unitId, interactionId, status: ProgressStatus.IN_PROGRESS },
    });
  }
  const base = {
    userId: actor.userId,
    classId: actor.classId,
    unitId: interaction.task.unitId,
    taskId: interaction.taskId,
    interactionId,
    sessionId: session.id,
    attemptId: attempt.id,
    occurredAt: new Date(),
  };
  await db.learningEvent.createMany({
    data: [
      ...(["u01-entry-invitation", "u02-mirror-01-activate", "u03-comm-01-manager", "u04-learn-01-material", "u05-path-01-role"].includes(interactionId)
        ? [{ ...base, eventType: EventType.UNIT_ENTERED, payload: { entry } }]
        : []),
      { ...base, eventType: EventType.INTERACTION_STARTED, payload: { entry } },
    ],
  });
  return { sessionId: session.id, attemptId: attempt.id };
}

export async function completeSimpleInteraction(interactionId: string, attemptId: string, input: CompleteInput) {
  if (!isSimpleInteraction(interactionId)) throw new Error("Unsupported interaction");
  const actor = await requireStudentContext();
  const rule = SIMPLE_INTERACTION_RULES[interactionId];
  const managedQuestions = await db.question.findMany({ where: { interactionId, isPublished: true }, orderBy: { order: "asc" } });
  const managedQuestion = managedQuestions[0];
  const managedAnswers = Array.isArray(managedQuestion?.correctAnswers) ? managedQuestion.correctAnswers.map(String) : [];
  const acceptedAnswers: readonly string[] = managedAnswers.length ? managedAnswers : rule.acceptedAnswers;
  const attempt = await db.attempt.findFirstOrThrow({
    where: { id: attemptId, userId: actor.userId, interactionId },
    include: { interaction: { include: { task: true } } },
  });
  const actionCompleted = Boolean(input.actionSummary[rule.actionKey]);
  const calculated = calculateSimpleInteractionResult({
    isEntry: interactionId === "u01-entry-invitation",
    actionCompleted,
    narrationCompleted: input.narrationCompleted,
    requiresNarration: rule.requiresNarration,
    answers: input.answers,
    acceptedAnswers,
  });
  const verifiedResponses = (input.questionResponses ?? []).map((response) => {
    const question = managedQuestions.find((item) => item.key === response.key);
    const accepted = Array.isArray(question?.correctAnswers) ? question.correctAnswers.map(String) : [];
    return { ...response, correct: accepted.includes(response.answer), version: question?.version ?? response.version };
  });
  const firstCorrect = verifiedResponses[0]?.correct ?? calculated.firstCorrect;
  const finalCorrect = verifiedResponses.length ? verifiedResponses.every((item) => item.correct) : calculated.finalCorrect;
  const completed = actionCompleted && (!rule.requiresNarration || input.narrationCompleted);
  const score = calculated.score;
  const previous = await db.progress.findUnique({
    where: { userId_interactionId: { userId: actor.userId, interactionId } },
  });
  const firstCompletion = previous?.status !== ProgressStatus.COMPLETED;
  const now = new Date();
  const base = {
    userId: actor.userId,
    classId: actor.classId,
    unitId: attempt.interaction.task.unitId,
    taskId: attempt.interaction.taskId,
    interactionId,
    sessionId: attempt.sessionId,
    attemptId,
    occurredAt: now,
  };

  await db.$transaction(async (tx) => {
    await tx.attempt.update({
      where: { id: attemptId },
      data: {
        completedAt: completed ? now : null,
        effectiveDurationMs: input.durationMs,
        answerAttempts: input.answers.length,
        firstAnswerCorrect: firstCorrect,
        finalAnswerCorrect: finalCorrect,
        narrationCompleted: input.narrationCompleted,
        score,
        actionSummary: { ...input.actionSummary, questionVersion: managedQuestion?.version ?? 0, questionKey: managedQuestion?.key ?? "static", questionVersions: verifiedResponses.map((item) => `${item.key}@${item.version}`).join("|") },
        selectedAnswers: input.answers,
        privateContent: input.privateContent,
      },
    });
    await tx.learningSession.update({ where: { id: attempt.sessionId }, data: { endedAt: now } });
    await tx.progress.upsert({
      where: { userId_interactionId: { userId: actor.userId, interactionId } },
      create: { userId: actor.userId, unitId: base.unitId, interactionId, status: completed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS, bestScore: score, completedAt: completed ? now : null },
      update: { status: completed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS, bestScore: Math.max(previous?.bestScore ?? 0, score), completedAt: completed ? previous?.completedAt ?? now : previous?.completedAt },
    });
    if (firstCompletion && completed && interactionId !== "u01-entry-invitation") {
      const increment = getAbilityIncrement(base.unitId, interactionId);
      await tx.scoreSnapshot.update({
        where: { userId_unitId: { userId: actor.userId, unitId: base.unitId } },
        data: {
          ...(increment.careerAbility ? { careerAbility: { increment: increment.careerAbility } } : {}),
          ...(increment.learningAbility ? { learningAbility: { increment: increment.learningAbility } } : {}),
          ...(increment.psychological ? { psychological: { increment: increment.psychological } } : {}),
          ...(increment.teamwork ? { teamwork: { increment: increment.teamwork } } : {}),
        },
      });
    }
    const taskInteractionCount = await tx.interaction.count({ where: { taskId: attempt.interaction.taskId } });
    const taskCompletedCount = await tx.progress.count({
      where: { userId: actor.userId, status: ProgressStatus.COMPLETED, interaction: { taskId: attempt.interaction.taskId } },
    });
    const mainInteractions = getMainInteractionsForUnit(base.unitId);
    const mainCompletedCount = await tx.progress.count({ where: { userId: actor.userId, status: ProgressStatus.COMPLETED, interactionId: { in: mainInteractions.map((item) => item.id) } } });
    const taskJustCompleted = firstCompletion && completed && taskCompletedCount >= taskInteractionCount;
    const unitJustCompleted = completed && shouldEmitUnitCompletion(base.unitId, interactionId, firstCompletion, mainCompletedCount);
    await tx.learningEvent.createMany({
      data: [
        { ...base, eventType: EventType.INTERACTION_ACTION, payload: input.actionSummary },
        ...(input.actionSummary.contentLength
          ? [{ ...base, eventType: EventType.CONTENT_SUBMITTED, payload: { contentRef: input.actionSummary.contentRef ?? `attempt:${attemptId}`, length: input.actionSummary.contentLength, mode: input.actionSummary.mode ?? "text" } }]
          : []),
        ...(input.actionSummary.mediaProgress
          ? [{ ...base, eventType: EventType.MEDIA_PROGRESSED, payload: { mediaId: input.actionSummary.mediaId ?? interactionId, milestone: input.actionSummary.mediaProgress, preview: true } }]
          : []),
        ...(input.narrationCompleted ? [{ ...base, eventType: EventType.NARRATION_COMPLETED, payload: { mode: "subtitle" } }] : []),
        ...(verifiedResponses.length
          ? verifiedResponses.map((response, index) => ({ ...base, eventType: EventType.ANSWER_SUBMITTED, payload: { questionKey: response.key, questionVersion: response.version, answer: response.answer, attemptNumber: index + 1, correct: response.correct } }))
          : input.answers.map((answer, index) => ({ ...base, eventType: EventType.ANSWER_SUBMITTED, payload: { answer, attemptNumber: index + 1, correct: acceptedAnswers.includes(answer) } }))),
        ...(completed ? [{ ...base, eventType: EventType.INTERACTION_COMPLETED, payload: { score, firstCorrect, finalCorrect } }] : []),
        ...(taskJustCompleted ? [{ ...base, eventType: EventType.TASK_COMPLETED, payload: { taskId: attempt.interaction.taskId } }] : []),
        ...(unitJustCompleted ? [{ ...base, eventType: EventType.UNIT_COMPLETED, payload: { badgeId: getUnitBadge(base.unitId), mainInteractions: mainInteractions.length } }] : []),
      ],
    });
  });
  return { score, firstCorrect, finalCorrect, completed };
}
