import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DataSource, EventType, MetricPhase, Prisma, PrismaClient, ProgressStatus, QuestionType, Role } from "../generated/prisma/client";
import { PROGRAM_UNITS, UNIT_FIVE_INTERACTIONS, UNIT_FOUR_INTERACTIONS, UNIT_ONE_INTERACTIONS, UNIT_THREE_INTERACTIONS, UNIT_TWO_INTERACTIONS } from "../lib/curriculum";
import { AUTHORED_QUESTIONS } from "../lib/question-bank";
import { LITERACY_DIMENSIONS, METRIC_REGISTRY } from "../lib/metrics";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const IDS = {
  teacher: "demo-teacher",
  student: "demo-student",
  classRoom: "class-2026-a",
  unit: "unit-01",
  task: "u01-task-traditional-hall",
  interaction: "u01-trad-02-thresher",
};

async function seed() {
  const demoPasswordHash = await bcrypt.hash("SmartAgri2026!", 12);
  await prisma.classRoom.upsert({
    where: { id: IDS.classRoom },
    update: { name: "智慧农业 2026 级 1 班", academicYear: "2026-2027", semester: "第一学期", leaderboardAnonymous: true, isArchived: false },
    create: { id: IDS.classRoom, name: "智慧农业 2026 级 1 班", academicYear: "2026-2027", semester: "第一学期", startsAt: new Date("2026-09-01T00:00:00+08:00"), endsAt: new Date("2027-01-31T23:59:59+08:00"), leaderboardAnonymous: true },
  });
  for (const unit of PROGRAM_UNITS) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      update: { title: unit.title, description: unit.description, order: Number(unit.number), isPublished: unit.published },
      create: { id: unit.id, title: unit.title, description: unit.description, order: Number(unit.number), isPublished: unit.published },
    });
  }
  const tasks = [
    ["u01-task-entry", "时代之门"],
    ["u01-task-traditional-hall", "传统农业馆"],
    ["u01-task-modern-hall", "现代农业馆"],
    ["u01-task-smart-hall", "智慧农业馆"],
    ["u01-task-jobs", "五岗位快速试岗"],
    ["u01-task-assessment", "职业倾向测评与岗位选择"],
    ["u01-task-story", "全国新农人故事馆"],
    ["u01-task-impression", "我的职业初印象墙"],
  ] as const;
  for (const [index, [id, title]] of tasks.entries()) {
    await prisma.task.upsert({
      where: { id },
      update: { title, order: index + 1 },
      create: { id, unitId: IDS.unit, title, order: index + 1 },
    });
  }
  for (const interaction of UNIT_ONE_INTERACTIONS) {
    await prisma.interaction.upsert({
      where: { id: interaction.id },
      update: { taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
      create: { id: interaction.id, taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
    });
  }
  const unitTwoTasks = [
    ["u02-task-mirror", "自我认知镜像屋"],
    ["u02-task-frustration", "挫折模拟田野"],
    ["u02-task-lab", "情绪管理实验室"],
    ["u02-task-team", "青春花园协作任务"],
    ["u02-task-completion", "成长之树"],
    ["u02-task-treehole", "心灵树洞"],
    ["u02-task-energy", "情绪能量站"],
  ] as const;
  for (const [index, [id, title]] of unitTwoTasks.entries()) {
    await prisma.task.upsert({
      where: { id },
      update: { title, order: index + 1, unitId: "unit-02" },
      create: { id, unitId: "unit-02", title, order: index + 1 },
    });
  }
  for (const interaction of UNIT_TWO_INTERACTIONS) {
    await prisma.interaction.upsert({
      where: { id: interaction.id },
      update: { taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
      create: { id: interaction.id, taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
    });
  }
  const unitThreeTasks = [
    ["u03-task-communication", "职场沟通模拟"],
    ["u03-task-festival", "农产品丰收节协作"],
    ["u03-task-mediation", "矛盾调解室"],
    ["u03-task-gratitude", "感恩之墙"],
    ["u03-task-completion", "和谐之门"],
    ["u03-task-relation", "职场人际关系图谱"],
    ["u03-task-empathy", "同理心训练营"],
  ] as const;
  for (const [index, [id, title]] of unitThreeTasks.entries()) {
    await prisma.task.upsert({
      where: { id },
      update: { title, order: index + 1, unitId: "unit-03" },
      create: { id, unitId: "unit-03", title, order: index + 1 },
    });
  }
  for (const interaction of UNIT_THREE_INTERACTIONS) {
    await prisma.interaction.upsert({
      where: { id: interaction.id },
      update: { taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
      create: { id: interaction.id, taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
    });
  }
  const unitFourTasks = [
    ["u04-task-learning", "限时技能学习挑战"],
    ["u04-task-ai", "AI 技能大比拼"],
    ["u04-task-story", "行业大咖分享会"],
    ["u04-task-plan", "学习计划制定"],
    ["u04-task-completion", "终身学习者结业"],
    ["u04-task-method", "学习方法工具箱"],
    ["u04-task-digital", "数字技能闯关"],
  ] as const;
  for (const [index, [id, title]] of unitFourTasks.entries()) {
    await prisma.task.upsert({ where: { id }, update: { title, order: index + 1, unitId: "unit-04" }, create: { id, unitId: "unit-04", title, order: index + 1 } });
  }
  for (const interaction of UNIT_FOUR_INTERACTIONS) {
    await prisma.interaction.upsert({
      where: { id: interaction.id },
      update: { taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
      create: { id: interaction.id, taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order },
    });
  }
  const unitFiveTasks = [
    ["u05-task-path", "职业发展路径探索"],
    ["u05-task-memory", "成长档案回顾"],
    ["u05-task-match", "岗位匹配度分析"],
    ["u05-task-plan", "职业生涯规划书制作"],
    ["u05-task-dream", "梦想发布仪式"],
    ["u05-task-ending", "未来之境"],
    ["u05-task-prophecy", "未来职场预言书"],
    ["u05-task-letter", "写给未来自己的信"],
  ] as const;
  for (const [index, [id, title]] of unitFiveTasks.entries()) {
    await prisma.task.upsert({ where: { id }, update: { title, order: index + 1, unitId: "unit-05" }, create: { id, unitId: "unit-05", title, order: index + 1 } });
  }
  for (const interaction of UNIT_FIVE_INTERACTIONS) {
    await prisma.interaction.upsert({ where: { id: interaction.id }, update: { taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order }, create: { id: interaction.id, taskId: interaction.taskId, title: interaction.title, type: interaction.type, order: interaction.order } });
  }

  for (const question of AUTHORED_QUESTIONS) {
    await prisma.question.upsert({
      where: { interactionId_key: { interactionId: question.interactionId, key: question.key } },
      update: { prompt: question.prompt, options: question.options, correctAnswers: question.correct, feedback: question.feedback, isPublished: true },
      create: { interactionId: question.interactionId, key: question.key, prompt: question.prompt, type: QuestionType.SINGLE_CHOICE, options: question.options, correctAnswers: question.correct, feedback: question.feedback, isPublished: true },
    });
  }

  await prisma.user.upsert({
    where: { id: IDS.teacher },
    update: { displayName: "周老师", nickname: "周老师", passwordHash: demoPasswordHash, role: Role.TEACHER, status: "ACTIVE" },
    create: { id: IDS.teacher, username: "teacher-demo", displayName: "周老师", nickname: "周老师", passwordHash: demoPasswordHash, role: Role.TEACHER },
  });
  await prisma.user.upsert({
    where: { id: IDS.student },
    update: { displayName: "林小禾", nickname: "云禾 01", studentNo: "20260001", passwordHash: demoPasswordHash, role: Role.STUDENT, status: "ACTIVE" },
    create: { id: IDS.student, username: "student-demo", displayName: "林小禾", nickname: "云禾 01", studentNo: "20260001", passwordHash: demoPasswordHash, role: Role.STUDENT },
  });
  await prisma.teacherClass.upsert({ where: { teacherId_classId: { teacherId: IDS.teacher, classId: IDS.classRoom } }, update: {}, create: { teacherId: IDS.teacher, classId: IDS.classRoom } });

  // Keep the checked-in demo deterministic: every seed starts the learner at the invitation.
  await prisma.learningSession.deleteMany({ where: { userId: IDS.student } });
  await prisma.progress.deleteMany({ where: { userId: IDS.student } });

  const students = [IDS.student, ...Array.from({ length: 24 }, (_, index) => `student-${String(index + 1).padStart(2, "0")}`)];
  for (const [index, id] of students.entries()) {
    if (id !== IDS.student) {
      await prisma.user.upsert({
        where: { id },
        update: { nickname: `云禾 ${String(index + 1).padStart(2, "0")}`, studentNo: `2026${String(index + 1).padStart(4, "0")}`, passwordHash: demoPasswordHash, status: "ACTIVE" },
        create: {
          id,
          username: `student${String(index).padStart(2, "0")}`,
          displayName: `学员 ${String(index).padStart(2, "0")}`,
          nickname: `云禾 ${String(index + 1).padStart(2, "0")}`,
          studentNo: `2026${String(index + 1).padStart(4, "0")}`,
          passwordHash: demoPasswordHash,
          role: Role.STUDENT,
        },
      });
    }
    await prisma.enrollment.upsert({
      where: { userId_classId: { userId: id, classId: IDS.classRoom } },
      update: { status: "ACTIVE" },
      create: { userId: id, classId: IDS.classRoom, status: "ACTIVE" },
    });
    await prisma.scoreSnapshot.upsert({
      where: { userId_unitId: { userId: id, unitId: IDS.unit } },
      update: id === IDS.student ? { careerAbility: 50, psychological: 50, learningAbility: 50, teamwork: 50 } : {},
      create: {
        userId: id,
        unitId: IDS.unit,
        careerAbility: id === IDS.student ? 50 : 58 + (index % 8),
        psychological: 52 + (index % 6),
        learningAbility: id === IDS.student ? 50 : 60 + (index % 9),
        teamwork: 54 + (index % 7),
      },
    });
    await prisma.scoreSnapshot.upsert({
      where: { userId_unitId: { userId: id, unitId: "unit-03" } },
      update: id === IDS.student ? { careerAbility: 50, psychological: 50, learningAbility: 50, teamwork: 50 } : {},
      create: {
        userId: id,
        unitId: "unit-03",
        careerAbility: 50,
        psychological: id === IDS.student ? 50 : 55 + (index % 8),
        learningAbility: 50,
        teamwork: id === IDS.student ? 50 : 57 + (index % 9),
      },
    });
    await prisma.scoreSnapshot.upsert({
      where: { userId_unitId: { userId: id, unitId: "unit-02" } },
      update: id === IDS.student ? { careerAbility: 50, psychological: 50, learningAbility: 50, teamwork: 50 } : {},
      create: {
        userId: id,
        unitId: "unit-02",
        careerAbility: 50,
        psychological: id === IDS.student ? 50 : 56 + (index % 10),
        learningAbility: 50,
        teamwork: id === IDS.student ? 50 : 55 + (index % 9),
      },
    });
    await prisma.scoreSnapshot.upsert({
      where: { userId_unitId: { userId: id, unitId: "unit-04" } },
      update: id === IDS.student ? { careerAbility: 50, psychological: 50, learningAbility: 50, teamwork: 50 } : {},
      create: { userId: id, unitId: "unit-04", careerAbility: 50, psychological: id === IDS.student ? 50 : 54 + (index % 7), learningAbility: id === IDS.student ? 50 : 58 + (index % 10), teamwork: 50 },
    });
    await prisma.scoreSnapshot.upsert({
      where: { userId_unitId: { userId: id, unitId: "unit-05" } },
      update: id === IDS.student ? { careerAbility: 50, psychological: 50, learningAbility: 50, teamwork: 50 } : {},
      create: { userId: id, unitId: "unit-05", careerAbility: id === IDS.student ? 50 : 61 + (index % 9), psychological: id === IDS.student ? 50 : 58 + (index % 8), learningAbility: id === IDS.student ? 50 : 62 + (index % 9), teamwork: id === IDS.student ? 50 : 59 + (index % 8) },
    });
  }

  const seedCareerRoles = ["助农电商主播", "智慧农场运营师", "农产品品牌策划师", "乡村电商运营官", "新农人创业家"];
  for (let index = 1; index <= 24; index += 1) {
    const userId = `student-${String(index).padStart(2, "0")}`;
    const sessionId = `seed-session-${index}`;
    const attemptId = `seed-attempt-${index}`;
    const score = 70 + (index % 4) * 10;
    const completedAt = new Date(Date.UTC(2026, 6, 20, 1, index));
    await prisma.learningSession.upsert({
      where: { id: sessionId },
      update: {},
      create: { id: sessionId, userId, classId: IDS.classRoom, unitId: IDS.unit, endedAt: completedAt },
    });
    await prisma.attempt.upsert({
      where: { id: attemptId },
      update: {},
      create: {
        id: attemptId,
        userId,
        sessionId,
        interactionId: IDS.interaction,
        completedAt,
        effectiveDurationMs: 10_000 + index * 80,
        dragSegments: 18 + index,
        answerAttempts: score === 100 ? 1 : 2,
        firstAnswerCorrect: score === 100,
        finalAnswerCorrect: true,
        narrationCompleted: true,
        score,
      },
    });
    await prisma.progress.upsert({
      where: { userId_interactionId: { userId, interactionId: IDS.interaction } },
      update: { status: ProgressStatus.COMPLETED, bestScore: score, completedAt },
      create: {
        userId,
        unitId: IDS.unit,
        interactionId: IDS.interaction,
        status: ProgressStatus.COMPLETED,
        bestScore: score,
        completedAt,
      },
    });
    await prisma.learningEvent.upsert({
      where: { id: `seed-event-complete-${index}` },
      update: {},
      create: {
        id: `seed-event-complete-${index}`,
        userId,
        classId: IDS.classRoom,
        unitId: IDS.unit,
        taskId: IDS.task,
        interactionId: IDS.interaction,
        sessionId,
        attemptId,
        eventType: EventType.INTERACTION_COMPLETED,
        occurredAt: completedAt,
        payload: { score, source: "seed-demo" },
      },
    });
    await prisma.learningEvent.upsert({
      where: { id: `seed-task-event-${index}` },
      update: {},
      create: { id: `seed-task-event-${index}`, userId, classId: IDS.classRoom, unitId: IDS.unit, taskId: IDS.task, interactionId: IDS.interaction, sessionId, attemptId, eventType: EventType.TASK_COMPLETED, occurredAt: new Date(completedAt.getTime() + 1), payload: { taskId: IDS.task, source: "seed-demo" } },
    });
    const roleAttemptId = `seed-role-attempt-${index}`;
    const role = seedCareerRoles[(index - 1) % seedCareerRoles.length];
    await prisma.attempt.upsert({
      where: { id: roleAttemptId },
      update: { actionSummary: { roleCardCreated: true, role, source: "seed-demo" } },
      create: { id: roleAttemptId, userId, sessionId, interactionId: "u01-assess-03-role-card", completedAt, effectiveDurationMs: 20_000 + index * 90, answerAttempts: 0, finalAnswerCorrect: true, score: 100, actionSummary: { roleCardCreated: true, role, source: "seed-demo" } },
    });
    await prisma.progress.upsert({
      where: { userId_interactionId: { userId, interactionId: "u01-assess-03-role-card" } },
      update: { status: ProgressStatus.COMPLETED, bestScore: 100, completedAt },
      create: { userId, unitId: IDS.unit, interactionId: "u01-assess-03-role-card", status: ProgressStatus.COMPLETED, bestScore: 100, completedAt },
    });
  }

  const strategies = ["affirmation", "reframing", "support", "problem-solving"];
  for (let index = 1; index <= 24; index += 1) {
    const userId = `student-${String(index).padStart(2, "0")}`;
    const sessionId = `seed-u02-session-${index}`;
    const attemptId = `seed-u02-attempt-${index}`;
    const completedAt = new Date(Date.UTC(2026, 6, 21, 1, index));
    const strategy = strategies[index % strategies.length];
    await prisma.learningSession.upsert({
      where: { id: sessionId },
      update: {},
      create: { id: sessionId, userId, classId: IDS.classRoom, unitId: "unit-02", endedAt: completedAt },
    });
    await prisma.attempt.upsert({
      where: { id: attemptId },
      update: {},
      create: {
        id: attemptId,
        userId,
        sessionId,
        interactionId: "u02-frustration-03-coping-toolbox",
        completedAt,
        effectiveDurationMs: 18_000 + index * 110,
        answerAttempts: 1,
        firstAnswerCorrect: true,
        finalAnswerCorrect: true,
        score: 100,
        actionSummary: { strategyApplied: true, strategy, effectiveness: 3 + (index % 3) },
      },
    });
    await prisma.progress.upsert({
      where: { userId_interactionId: { userId, interactionId: "u02-frustration-03-coping-toolbox" } },
      update: { status: ProgressStatus.COMPLETED, bestScore: 100, completedAt },
      create: { userId, unitId: "unit-02", interactionId: "u02-frustration-03-coping-toolbox", status: ProgressStatus.COMPLETED, bestScore: 100, completedAt },
    });
    await prisma.learningEvent.upsert({
      where: { id: `seed-u02-event-${index}` },
      update: {},
      create: {
        id: `seed-u02-event-${index}`,
        userId,
        classId: IDS.classRoom,
        unitId: "unit-02",
        taskId: "u02-task-frustration",
        interactionId: "u02-frustration-03-coping-toolbox",
        sessionId,
        attemptId,
        eventType: EventType.INTERACTION_COMPLETED,
        occurredAt: completedAt,
        payload: { score: 100, source: "seed-demo" },
      },
    });
    await prisma.learningEvent.upsert({ where: { id: `seed-u02-task-event-${index}` }, update: {}, create: { id: `seed-u02-task-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-02", taskId: "u02-task-frustration", interactionId: "u02-frustration-03-coping-toolbox", sessionId, attemptId, eventType: EventType.TASK_COMPLETED, occurredAt: new Date(completedAt.getTime() + 1), payload: { taskId: "u02-task-frustration", source: "seed-demo" } } });
  }

  const communicationStrategies = ["good-news-only", "problem-only", "progress-problem-solution", "blame"];
  for (let index = 1; index <= 24; index += 1) {
    const userId = `student-${String(index).padStart(2, "0")}`;
    const sessionId = `seed-u03-session-${index}`;
    const attemptId = `seed-u03-attempt-${index}`;
    const completedAt = new Date(Date.UTC(2026, 6, 22, 1, index));
    const strategy = communicationStrategies[index % communicationStrategies.length];
    const score = strategy === "progress-problem-solution" ? 100 : 70;
    await prisma.learningSession.upsert({ where: { id: sessionId }, update: {}, create: { id: sessionId, userId, classId: IDS.classRoom, unitId: "unit-03", endedAt: completedAt } });
    await prisma.attempt.upsert({
      where: { id: attemptId }, update: {},
      create: { id: attemptId, userId, sessionId, interactionId: "u03-comm-01-manager", completedAt, effectiveDurationMs: 22_000 + index * 120, answerAttempts: 1, firstAnswerCorrect: score === 100, finalAnswerCorrect: true, score, actionSummary: { briefingCompleted: true, strategy, source: "seed-demo" } },
    });
    await prisma.progress.upsert({
      where: { userId_interactionId: { userId, interactionId: "u03-comm-01-manager" } },
      update: { status: ProgressStatus.COMPLETED, bestScore: score, completedAt },
      create: { userId, unitId: "unit-03", interactionId: "u03-comm-01-manager", status: ProgressStatus.COMPLETED, bestScore: score, completedAt },
    });
    await prisma.learningEvent.upsert({
      where: { id: `seed-u03-event-${index}` }, update: {},
      create: { id: `seed-u03-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-03", taskId: "u03-task-communication", interactionId: "u03-comm-01-manager", sessionId, attemptId, eventType: EventType.INTERACTION_COMPLETED, occurredAt: completedAt, payload: { score, source: "seed-demo" } },
    });
    await prisma.learningEvent.upsert({ where: { id: `seed-u03-task-event-${index}` }, update: {}, create: { id: `seed-u03-task-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-03", taskId: "u03-task-communication", interactionId: "u03-comm-01-manager", sessionId, attemptId, eventType: EventType.TASK_COMPLETED, occurredAt: new Date(completedAt.getTime() + 1), payload: { taskId: "u03-task-communication", source: "seed-demo" } } });
  }

  for (let index = 1; index <= 24; index += 1) {
    const userId = `student-${String(index).padStart(2, "0")}`; const sessionId = `seed-u04-session-${index}`; const attemptId = `seed-u04-attempt-${index}`; const completedAt = new Date(Date.UTC(2026, 6, 23, 1, index));
    await prisma.learningSession.upsert({ where: { id: sessionId }, update: {}, create: { id: sessionId, userId, classId: IDS.classRoom, unitId: "unit-04", endedAt: completedAt } });
    await prisma.attempt.upsert({ where: { id: attemptId }, update: {}, create: { id: attemptId, userId, sessionId, interactionId: "u04-learn-01-material", completedAt, effectiveDurationMs: 25_000 + index * 130, answerAttempts: 0, firstAnswerCorrect: false, finalAnswerCorrect: true, score: 100, actionSummary: { unitFourCompleted: true, materialViewed: true, modulesViewed: 3, noteUsed: index % 3 === 0 } } });
    await prisma.progress.upsert({ where: { userId_interactionId: { userId, interactionId: "u04-learn-01-material" } }, update: { status: ProgressStatus.COMPLETED, bestScore: 100, completedAt }, create: { userId, unitId: "unit-04", interactionId: "u04-learn-01-material", status: ProgressStatus.COMPLETED, bestScore: 100, completedAt } });
    await prisma.learningEvent.upsert({ where: { id: `seed-u04-event-${index}` }, update: {}, create: { id: `seed-u04-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-04", taskId: "u04-task-learning", interactionId: "u04-learn-01-material", sessionId, attemptId, eventType: EventType.INTERACTION_COMPLETED, occurredAt: completedAt, payload: { score: 100, source: "seed-demo" } } });
    await prisma.learningEvent.upsert({ where: { id: `seed-u04-task-event-${index}` }, update: {}, create: { id: `seed-u04-task-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-04", taskId: "u04-task-learning", interactionId: "u04-learn-01-material", sessionId, attemptId, eventType: EventType.TASK_COMPLETED, occurredAt: new Date(completedAt.getTime() + 1), payload: { taskId: "u04-task-learning", source: "seed-demo" } } });
  }

  for (let index = 1; index <= 24; index += 1) {
    const userId = `student-${String(index).padStart(2, "0")}`; const sessionId = `seed-u05-session-${index}`; const attemptId = `seed-u05-attempt-${index}`; const completedAt = new Date(Date.UTC(2026, 6, 24, 1, index)); const answer = ["A", "B", "C", "D"][index % 4];
    await prisma.learningSession.upsert({ where: { id: sessionId }, update: {}, create: { id: sessionId, userId, classId: IDS.classRoom, unitId: "unit-05", endedAt: completedAt } });
    await prisma.attempt.upsert({ where: { id: attemptId }, update: {}, create: { id: attemptId, userId, sessionId, interactionId: "u05-path-01-role", completedAt, effectiveDurationMs: 31_000 + index * 140, answerAttempts: 1, firstAnswerCorrect: answer === "B", finalAnswerCorrect: true, score: answer === "B" ? 100 : 80, actionSummary: { unitFiveCompleted: true, rolesViewed: 3 + (index % 3), answer, bestAnswer: answer === "B", source: "seed-demo" } } });
    await prisma.progress.upsert({ where: { userId_interactionId: { userId, interactionId: "u05-path-01-role" } }, update: { status: ProgressStatus.COMPLETED, bestScore: answer === "B" ? 100 : 80, completedAt }, create: { userId, unitId: "unit-05", interactionId: "u05-path-01-role", status: ProgressStatus.COMPLETED, bestScore: answer === "B" ? 100 : 80, completedAt } });
    await prisma.learningEvent.upsert({ where: { id: `seed-u05-event-${index}` }, update: {}, create: { id: `seed-u05-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-01-role", sessionId, attemptId, eventType: EventType.INTERACTION_COMPLETED, occurredAt: completedAt, payload: { score: answer === "B" ? 100 : 80, source: "seed-demo" } } });
    await prisma.learningEvent.upsert({ where: { id: `seed-u05-task-event-${index}` }, update: {}, create: { id: `seed-u05-task-event-${index}`, userId, classId: IDS.classRoom, unitId: "unit-05", taskId: "u05-task-path", interactionId: "u05-path-01-role", sessionId, attemptId, eventType: EventType.TASK_COMPLETED, occurredAt: new Date(completedAt.getTime() + 1), payload: { taskId: "u05-task-path", source: "seed-demo" } } });
  }

  await prisma.metricObservation.deleteMany({ where: { classId: IDS.classRoom, importBatchId: null } });
  const observations: Prisma.MetricObservationCreateManyInput[] = [];
  const metricKeys = Object.keys(METRIC_REGISTRY) as Array<keyof typeof METRIC_REGISTRY>;
  for (const [studentIndex, userId] of students.entries()) {
    for (let lesson = 1; lesson <= 15; lesson += 1) {
      const phase = lesson === 1 ? MetricPhase.BASELINE : lesson === 15 ? MetricPhase.CURRENT : MetricPhase.PERIODIC;
      const measuredAt = new Date(Date.UTC(2026, 8, 1 + (lesson - 1) * 7, 2, studentIndex));
      const growth = lesson * 1.35 + studentIndex % 6;
      for (const [dimensionIndex, dimension] of LITERACY_DIMENSIONS.entries()) {
        observations.push({ userId, classId: IDS.classRoom, unitId: `unit-0${Math.min(5, Math.ceil(lesson / 3))}`, metricKey: dimension.key, value: Math.min(96, Math.round(48 + growth + dimensionIndex * 1.6)), phase, lessonIndex: lesson, measuredAt, source: dimensionIndex % 2 ? DataSource.XUEXITONG : DataSource.SIMULATION, metadata: { seed: true } });
      }
      for (const [metricIndex, metricKey] of metricKeys.entries()) {
        const source = METRIC_REGISTRY[metricKey].sources[0] as DataSource;
        let value = Math.min(98, Math.round(47 + growth + metricIndex % 8));
        if (metricKey === "psych.strategy_count") value = Math.min(5, Math.floor(lesson / 4) + studentIndex % 2);
        if (metricKey === "psych.anxiety") value = Math.max(2.8, Number((6.2 - lesson * .13 + (studentIndex % 4) * .12).toFixed(1)));
        if (metricKey === "career.decision_latency") value = Number(Math.max(8, 34 - lesson * .8 + studentIndex % 5).toFixed(1));
        if (metricKey === "values.service_hours") value = Number((lesson * .7 + studentIndex % 5).toFixed(1));
        if (metricKey === "psych.coping_active") value = Math.min(78, 38 + lesson * 2 + studentIndex % 6);
        if (metricKey === "psych.coping_adjust") value = Math.min(55, 31 + lesson + studentIndex % 5);
        if (metricKey === "psych.coping_avoid") value = Math.max(5, 31 - lesson - studentIndex % 4);
        if (metricKey === "values.team_active") value = Math.min(82, 41 + lesson * 2 + studentIndex % 4);
        if (metricKey === "values.team_passive") value = Math.max(12, 42 - lesson + studentIndex % 3);
        if (metricKey === "values.team_none") value = Math.max(3, 22 - lesson - studentIndex % 3);
        observations.push({ userId, classId: IDS.classRoom, unitId: `unit-0${Math.min(5, Math.ceil(lesson / 3))}`, metricKey, value, phase, lessonIndex: lesson, measuredAt, source, metadata: { seed: true } });
      }
    }
  }
  await prisma.metricObservation.createMany({ data: observations });
}

seed()
  .then(() => console.log("Seeded demo class, reset learner, Units 1-5 and class history."))
  .finally(async () => prisma.$disconnect());
