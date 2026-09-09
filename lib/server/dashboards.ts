import "server-only";

import { EventType, ProgressStatus, Role, type DataSource, type MetricObservation } from "@/generated/prisma/client";
import {
  PROGRAM_UNITS,
  UNIT_FIVE_INTERACTIONS,
  UNIT_FIVE_MAIN_INTERACTIONS,
  UNIT_FOUR_INTERACTIONS,
  UNIT_FOUR_MAIN_INTERACTIONS,
  UNIT_ONE_INTERACTIONS,
  UNIT_ONE_MAIN_INTERACTIONS,
  UNIT_THREE_INTERACTIONS,
  UNIT_THREE_MAIN_INTERACTIONS,
  UNIT_TWO_INTERACTIONS,
  UNIT_TWO_MAIN_INTERACTIONS,
} from "@/lib/curriculum";
import { db } from "@/lib/db";
import { compareCompletionSpeed, rankWindow } from "@/lib/dashboard-logic";
import { LITERACY_DIMENSIONS, METRIC_REGISTRY } from "@/lib/metrics";
import { requireActor, requireStudentContext, requireTeacherContext } from "@/lib/server/auth";

export type DashboardFilters = { classId?: string; lessonFrom?: number; lessonTo?: number; source?: DataSource };

const unitInteractions = [UNIT_ONE_INTERACTIONS, UNIT_TWO_INTERACTIONS, UNIT_THREE_INTERACTIONS, UNIT_FOUR_INTERACTIONS, UNIT_FIVE_INTERACTIONS] as const;
const unitMain = [UNIT_ONE_MAIN_INTERACTIONS, UNIT_TWO_MAIN_INTERACTIONS, UNIT_THREE_MAIN_INTERACTIONS, UNIT_FOUR_MAIN_INTERACTIONS, UNIT_FIVE_MAIN_INTERACTIONS] as const;
const allInteractions = unitInteractions.flat();
const allMainIds = new Set(unitMain.flat().map((item) => item.id));
const careerMetricKeys = ["career.professional_identity", "career.job_cognition", "career.craftsmanship", "career.compliance_awareness", "career.action"] as const;
const careerMetricLabels = ["职业认同", "岗位认知", "工匠精神", "合规意识", "行动力"] as const;
const overviewMetricKeys = [...LITERACY_DIMENSIONS.map((dimension) => dimension.key), "psych.resilience", ...careerMetricKeys];
const roleLabels = ["助农电商主播", "智慧农场运营师", "农产品品牌策划师", "乡村电商运营官", "新农人创业家"] as const;
const roleIdLabels: Record<string, string> = { anchor: roleLabels[0], streamer: roleLabels[0], farm: roleLabels[1], operator: roleLabels[1], brand: roleLabels[2], ops: roleLabels[3], commerce: roleLabels[3], founder: roleLabels[4] };

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : 0;
}

function groupByKey<T>(items: T[], keyFor: (item: T) => string) {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFor(item);
    const group = grouped.get(key);
    if (group) group.push(item);
    else grouped.set(key, [item]);
  }
  return grouped;
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function percentChange(current: number, previous: number) {
  if (!previous) return current ? null : 0;
  return Math.round((current - previous) / previous * 1000) / 10;
}

function valuesFor(observations: MetricObservation[], metricKey: string, lesson?: number) {
  return observations.filter((item) => item.metricKey === metricKey && (lesson === undefined || item.lessonIndex === lesson)).map((item) => item.value);
}

function literacySummary(observations: MetricObservation[]) {
  return LITERACY_DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    baseline: average(observations.filter((item) => item.metricKey === dimension.key && item.phase === "BASELINE").map((item) => item.value)),
    current: average(observations.filter((item) => item.metricKey === dimension.key && item.phase === "CURRENT").map((item) => item.value)),
  }));
}

function growthCurve(observations: MetricObservation[]) {
  return Array.from({ length: 15 }, (_, index) => ({
    lesson: index + 1,
    values: Object.fromEntries(LITERACY_DIMENSIONS.map((dimension) => [dimension.key, average(valuesFor(observations, dimension.key, index + 1))])),
  }));
}

function badgeCount(completedIds: Set<string>) {
  return unitMain.filter((items) => items.every((item) => completedIds.has(item.id))).length;
}

function unitProgress(progress: Array<{ interactionId: string; status: ProgressStatus }>) {
  const completedIds = new Set(progress.filter((item) => item.status === ProgressStatus.COMPLETED).map((item) => item.interactionId));
  return PROGRAM_UNITS.map((unit, index) => {
    const items = unitInteractions[index];
    const completed = items.filter((item) => completedIds.has(item.id)).length;
    const status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = completed === items.length ? "COMPLETED" : completed ? "IN_PROGRESS" : "NOT_STARTED";
    return { id: unit.id, title: unit.title, route: unit.route, completed, total: items.length, percent: Math.round(completed / items.length * 100), status };
  });
}

async function studentDashboard(userId: string, classId: string, teacherView = false) {
  const [student, classRoom, observations, progress, attempts, recentEvents, members] = await Promise.all([
    db.user.findFirstOrThrow({ where: { id: userId, enrollments: { some: { classId, status: "ACTIVE" } } }, select: { id: true, displayName: true, nickname: true, studentNo: true } }),
    db.classRoom.findUniqueOrThrow({ where: { id: classId } }),
    db.metricObservation.findMany({ where: { userId, classId }, orderBy: [{ lessonIndex: "asc" }, { measuredAt: "asc" }] }),
    db.progress.findMany({ where: { userId, interactionId: { in: allInteractions.map((item) => item.id) } }, select: { interactionId: true, status: true, completedAt: true } }),
    db.attempt.findMany({ where: { userId, completedAt: { not: null } }, select: { interactionId: true, effectiveDurationMs: true, answerAttempts: true, completedAt: true }, orderBy: { completedAt: "desc" } }),
    db.learningEvent.findMany({ where: { source: { not: "classroom-rehearsal" }, userId }, select: { id: true, eventType: true, interactionId: true, occurredAt: true, source: true }, orderBy: { occurredAt: "desc" }, take: 8 }),
    db.enrollment.findMany({ where: { classId, status: "ACTIVE", user: { role: "STUDENT", status: "ACTIVE" } }, select: { user: { select: { id: true, displayName: true, nickname: true } } } }),
  ]);
  const classUserIds = members.map((item) => item.user.id);
  const [classMetrics, classProgress, classAttempts] = await Promise.all([
    db.metricObservation.findMany({ where: { classId, userId: { in: classUserIds }, phase: "CURRENT", metricKey: { in: LITERACY_DIMENSIONS.map((item) => item.key) } } }),
    db.progress.findMany({ where: { userId: { in: classUserIds }, interactionId: { in: allInteractions.map((item) => item.id) } }, select: { userId: true, interactionId: true, status: true } }),
    db.attempt.findMany({ where: { userId: { in: classUserIds }, completedAt: { not: null } }, select: { userId: true, interactionId: true, effectiveDurationMs: true } }),
  ]);
  const ranking = members.map(({ user }) => {
    const current = classMetrics.filter((item) => item.userId === user.id);
    const completed = new Set(classProgress.filter((item) => item.userId === user.id && item.status === "COMPLETED").map((item) => item.interactionId));
    const mainCompleted = [...completed].filter((id) => allMainIds.has(id)).length;
    return {
      userId: user.id,
      name: classRoom.leaderboardAnonymous && !teacherView ? user.nickname ?? `云禾同学` : user.displayName,
      literacy: average(LITERACY_DIMENSIONS.map((dimension) => average(valuesFor(current, dimension.key)))),
      completion: Math.round(mainCompleted / allMainIds.size * 100),
      duration: classAttempts.filter((item) => item.userId === user.id && allMainIds.has(item.interactionId)).reduce((sum, item) => sum + item.effectiveDurationMs, 0),
      badges: badgeCount(completed),
    };
  });
  const rankingWindows = {
    literacy: rankWindow(ranking, userId, (a, b) => b.literacy - a.literacy),
    speed: rankWindow(ranking, userId, compareCompletionSpeed),
    badges: rankWindow(ranking, userId, (a, b) => b.badges - a.badges || b.completion - a.completion),
  };
  const completedIds = new Set(progress.filter((item) => item.status === ProgressStatus.COMPLETED).map((item) => item.interactionId));
  return {
    student,
    classRoom: { id: classRoom.id, name: classRoom.name, academicYear: classRoom.academicYear, semester: classRoom.semester },
    literacy: literacySummary(observations),
    curve: growthCurve(observations),
    units: unitProgress(progress),
    badges: PROGRAM_UNITS.map((unit, index) => ({ id: `badge-${index + 1}`, title: ["时代认知", "心灵成长", "和谐使者", "终身学习者", "生涯规划师"][index], earned: unitMain[index].every((item) => completedIds.has(item.id)), unitTitle: unit.title })),
    rankings: rankingWindows,
    recentEvents: recentEvents.map((item) => ({ ...item, occurredAt: item.occurredAt.toISOString() })),
    activity: { completedAttempts: attempts.length, effectiveMinutes: Math.round(attempts.reduce((sum, item) => sum + item.effectiveDurationMs, 0) / 60_000), retries: attempts.filter((item) => item.answerAttempts > 1).length },
  };
}

export async function getCurrentStudentDashboard() {
  const actor = await requireStudentContext();
  return studentDashboard(actor.userId, actor.classId);
}

export async function getTeacherStudentDashboard(studentId: string, classId?: string) {
  const actor = await requireTeacherContext(classId);
  return studentDashboard(studentId, actor.classId, true);
}

function filteredObservationWhere(classId: string, filters: DashboardFilters) {
  return {
    classId,
    ...(filters.source ? { source: filters.source } : {}),
    lessonIndex: { gte: Math.max(1, filters.lessonFrom ?? 1), lte: Math.min(15, filters.lessonTo ?? 15) },
  };
}

export async function getTeacherDashboard(filters: DashboardFilters = {}) {
  const actor = await requireTeacherContext(filters.classId);
  const now = Date.now();
  const currentPeriodStart = new Date(now - 7 * 86_400_000);
  const previousPeriodStart = new Date(now - 14 * 86_400_000);
  const observationWhere = filteredObservationWhere(actor.classId, filters);
  const [enrollments, observations, sourceGroups, progress, attempts, events, roleAttempts, currentEventGroups, previousEventGroups] = await Promise.all([
    db.enrollment.findMany({ where: { classId: actor.classId, status: "ACTIVE", user: { role: "STUDENT", status: "ACTIVE" } }, include: { user: { select: { id: true, displayName: true, nickname: true, studentNo: true } } }, orderBy: { user: { studentNo: "asc" } } }),
    db.metricObservation.findMany({ where: { ...observationWhere, metricKey: { in: overviewMetricKeys }, userId: { not: null } }, orderBy: [{ lessonIndex: "asc" }, { measuredAt: "asc" }] }),
    db.metricObservation.groupBy({ by: ["source"], where: observationWhere, _count: { _all: true } }),
    db.progress.findMany({ where: { user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } }, interactionId: { in: allInteractions.map((item) => item.id) } }, select: { userId: true, interactionId: true, status: true, bestScore: true, completedAt: true } }),
    db.attempt.findMany({ where: { user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } }, completedAt: { not: null } }, select: { id: true, userId: true, interactionId: true, effectiveDurationMs: true, answerAttempts: true, finalAnswerCorrect: true, score: true, completedAt: true, selectedAnswers: true, actionSummary: true } }),
    db.learningEvent.groupBy({ by: ["userId"], where: { source: { not: "classroom-rehearsal" }, classId: actor.classId }, _max: { occurredAt: true } }),
    db.attempt.findMany({ where: { user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } }, interactionId: { in: ["u01-assess-03-role-card", "u01-assess-02-report"] }, completedAt: { not: null } }, select: { userId: true, interactionId: true, actionSummary: true, completedAt: true }, orderBy: { completedAt: "desc" } }),
    db.learningEvent.groupBy({ by: ["eventType"], where: { source: { not: "classroom-rehearsal" }, classId: actor.classId, occurredAt: { gte: currentPeriodStart }, eventType: { in: [EventType.ANSWER_SUBMITTED, EventType.TASK_COMPLETED] } }, _count: { _all: true } }),
    db.learningEvent.groupBy({ by: ["eventType"], where: { source: { not: "classroom-rehearsal" }, classId: actor.classId, occurredAt: { gte: previousPeriodStart, lt: currentPeriodStart }, eventType: { in: [EventType.ANSWER_SUBMITTED, EventType.TASK_COMPLETED] } }, _count: { _all: true } }),
  ]);
  const studentIds = enrollments.map((item) => item.userId);
  const classLiteracy = literacySummary(observations.filter((item) => item.userId && studentIds.includes(item.userId)));
  const progressByStudent = groupByKey(progress, (item) => item.userId);
  const attemptsByStudent = groupByKey(attempts, (item) => item.userId);
  const metricsByStudent = groupByKey(observations, (item) => item.userId ?? "");
  const latestEventByStudent = new Map<string, Date>();
  for (const event of events) if (event._max.occurredAt) latestEventByStudent.set(event.userId, event._max.occurredAt);
  const studentRows = enrollments.map(({ user }) => {
    const studentProgress = progressByStudent.get(user.id) ?? [];
    const completed = new Set(studentProgress.filter((item) => item.status === "COMPLETED").map((item) => item.interactionId));
    const studentAttempts = attemptsByStudent.get(user.id) ?? [];
    const currentMetrics = (metricsByStudent.get(user.id) ?? []).filter((item) => item.phase === "CURRENT");
    const lastEvent = latestEventByStudent.get(user.id);
    const mainCompleted = [...completed].filter((id) => allMainIds.has(id)).length;
    return {
      id: user.id,
      name: user.displayName,
      nickname: user.nickname,
      studentNo: user.studentNo,
      completion: Math.round(mainCompleted / allMainIds.size * 100),
      literacy: average(LITERACY_DIMENSIONS.map((dimension) => average(valuesFor(currentMetrics, dimension.key)))),
      retries: studentAttempts.filter((item) => item.answerAttempts > 1).length,
      badges: badgeCount(completed),
      lastActiveAt: lastEvent?.toISOString() ?? null,
    };
  });
  const attention = studentRows.filter((item) => item.completion < 15 || item.retries >= 3 || !item.lastActiveAt || now - new Date(item.lastActiveAt).getTime() > 7 * 86_400_000).slice(0, 5).map((item) => ({ ...item, reason: item.retries >= 3 ? "近期重试较多" : item.completion < 15 ? "主线进度需要支持" : "近期未参与学习" }));
  const activeStudents = events.filter((item) => item._max.occurredAt && now - item._max.occurredAt.getTime() <= 30 * 86_400_000).length;
  const sourceCounts = sourceGroups.map((item) => ({ source: item.source, count: item._count._all }));
  const activityTrend = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now - (6 - offset) * 86_400_000); const key = date.toISOString().slice(5, 10);
    const daily = attempts.filter((item) => item.completedAt?.toISOString().slice(5, 10) === key);
    return { label: key, active: new Set(daily.map((item) => item.userId)).size, minutes: Math.round(daily.reduce((sum, item) => sum + item.effectiveDurationMs, 0) / 60_000) };
  });
  const unitPerformance = PROGRAM_UNITS.map((unit, index) => {
    const mainIds = new Set(unitMain[index].map((item) => item.id));
    const completed = progress.filter((item) => item.status === ProgressStatus.COMPLETED && mainIds.has(item.interactionId));
    return { id: unit.id, label: `单元${["一", "二", "三", "四", "五"][index]}`, title: unit.title, completion: enrollments.length ? Math.round(completed.length / (enrollments.length * mainIds.size) * 1000) / 10 : 0, averageScore: average(completed.map((item) => item.bestScore)) };
  });
  const latestRoleByStudent = new Map<string, string>();
  for (const attempt of roleAttempts) {
    if (latestRoleByStudent.has(attempt.userId)) continue;
    const summary = record(attempt.actionSummary);
    const raw = [summary.role, summary.topRole, summary.expandedRole].find((value) => typeof value === "string");
    if (typeof raw !== "string") continue;
    const label = roleLabels.find((item) => item === raw) ?? roleIdLabels[raw];
    if (label) latestRoleByStudent.set(attempt.userId, label);
  }
  const roleDistribution = roleLabels.map((label) => ({ label, count: [...latestRoleByStudent.values()].filter((item) => item === label).length })).filter((item) => item.count > 0);
  const resilienceTrend = Array.from({ length: 15 }, (_, index) => ({ lesson: index + 1, value: average(valuesFor(observations, "psych.resilience", index + 1)) }));
  const careerAbility = careerMetricKeys.map((key, index) => ({ key, label: careerMetricLabels[index], value: average(observations.filter((item) => item.metricKey === key && item.phase === "CURRENT").map((item) => item.value)) }));
  const currentAttempts = attempts.filter((item) => item.completedAt && item.completedAt >= currentPeriodStart);
  const previousAttempts = attempts.filter((item) => item.completedAt && item.completedAt >= previousPeriodStart && item.completedAt < currentPeriodStart);
  const eventCount = (groups: typeof currentEventGroups, eventType: EventType) => groups.find((item) => item.eventType === eventType)?._count._all ?? 0;
  const activityOverview = [
    { key: "duration", label: "总学习时长", current: Math.round(currentAttempts.reduce((sum, item) => sum + item.effectiveDurationMs, 0) / 60_000), previous: Math.round(previousAttempts.reduce((sum, item) => sum + item.effectiveDurationMs, 0) / 60_000), unit: "分钟" },
    { key: "sessions", label: "总学习次数", current: currentAttempts.length, previous: previousAttempts.length, unit: "次" },
    { key: "answers", label: "互动问答数", current: eventCount(currentEventGroups, EventType.ANSWER_SUBMITTED) || currentAttempts.reduce((sum, item) => sum + item.answerAttempts, 0), previous: eventCount(previousEventGroups, EventType.ANSWER_SUBMITTED) || previousAttempts.reduce((sum, item) => sum + item.answerAttempts, 0), unit: "次" },
    { key: "tasks", label: "任务提交数", current: eventCount(currentEventGroups, EventType.TASK_COMPLETED), previous: eventCount(previousEventGroups, EventType.TASK_COMPLETED), unit: "次" },
  ].map((item) => ({ ...item, change: percentChange(item.current, item.previous) }));
  return {
    teacher: { id: actor.user.id, displayName: actor.user.displayName },
    classRoom: actor.classRoom,
    kpis: { studentCount: enrollments.length, activeStudents, completion: average(studentRows.map((item) => item.completion)), literacy: average(classLiteracy.map((item) => item.current)) },
    students: studentRows,
    attention,
    literacy: classLiteracy,
    activityTrend,
    sourceCounts,
    unitPerformance,
    roleDistribution,
    resilienceTrend,
    careerAbility,
    activityOverview,
    filters: { lessonFrom: filters.lessonFrom ?? 1, lessonTo: filters.lessonTo ?? 15, source: filters.source ?? null },
  };
}

export async function getTeacherAnalytics(filters: DashboardFilters = {}) {
  const actor = await requireTeacherContext(filters.classId);
  const observations = await db.metricObservation.findMany({ where: filteredObservationWhere(actor.classId, filters), orderBy: [{ lessonIndex: "asc" }, { measuredAt: "asc" }] });
  const lessons = Array.from({ length: 15 }, (_, index) => index + 1).filter((lesson) => lesson >= (filters.lessonFrom ?? 1) && lesson <= (filters.lessonTo ?? 15));
  const series = (metricKey: string) => lessons.map((lesson) => average(valuesFor(observations, metricKey, lesson)));
  const distribution = (metricKey: string, bands: number[]) => {
    const current = observations.filter((item) => item.metricKey === metricKey && item.phase === "CURRENT").map((item) => item.value);
    return bands.map((limit, index) => current.filter((value) => value >= limit && (bands[index + 1] === undefined || value < bands[index + 1])).length);
  };
  return {
    classRoom: actor.classRoom,
    lessons,
    sources: filters.source ? [filters.source] : ["SIMULATION", "XUEXITONG", "NATIONAL_PLATFORM", "TEACHER_UPLOAD"] as DataSource[],
    psychological: {
      resilience: series("psych.resilience"), frustration: series("psych.frustration_completion"), strategyDistribution: distribution("psych.strategy_count", [0, 1, 3]), anxiety: series("psych.anxiety"),
      coping: { active: series("psych.coping_active"), adjust: series("psych.coping_adjust"), avoid: series("psych.coping_avoid") },
    },
    career: {
      radar: ["career.professional_identity", "career.job_cognition", "career.craftsmanship", "career.compliance_awareness", "career.action"].map((key) => ({ key, baseline: average(observations.filter((item) => item.metricKey === key && item.phase === "BASELINE").map((item) => item.value)), current: average(observations.filter((item) => item.metricKey === key && item.phase === "CURRENT").map((item) => item.value)) })),
      planQuality: distribution("career.plan_quality", [0, 60, 70, 85]), compliance: series("career.compliance_accuracy"), preview: series("career.preview_completion"),
      decisions: observations.filter((item) => item.metricKey === "career.decision_quality").map((quality) => ({ quality: quality.value, latency: observations.find((item) => item.userId === quality.userId && item.lessonIndex === quality.lessonIndex && item.metricKey === "career.decision_latency")?.value ?? 0, student: quality.userId })),
    },
    values: {
      rural: series("values.rural_identity"), youth: series("values.youth_learning"), service: observations.filter((item) => item.metricKey === "values.service_hours" && item.phase === "CURRENT").map((item) => ({ student: item.userId, value: item.value })), ideology: series("values.ideology_completion"),
      teamwork: { active: series("values.team_active"), passive: series("values.team_passive"), none: series("values.team_none") },
    },
    registry: METRIC_REGISTRY,
  };
}

export async function getTeacherUnits(classId?: string) {
  const actor = await requireTeacherContext(classId);
  const [units, progress, attempts] = await Promise.all([
    db.unit.findMany({
      include: {
        tasks: {
          include: { interactions: { include: { questions: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),
    db.progress.findMany({ where: { user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } } } }),
    db.attempt.findMany({ where: { user: { enrollments: { some: { classId: actor.classId, status: "ACTIVE" } } }, completedAt: { not: null } }, select: { interactionId: true, userId: true, effectiveDurationMs: true, answerAttempts: true, finalAnswerCorrect: true, selectedAnswers: true } }),
  ]);
  const studentCount = await db.enrollment.count({ where: { classId: actor.classId, status: "ACTIVE", user: { role: "STUDENT", status: "ACTIVE" } } });
  return units.map((unit) => {
    const interactionIds = unit.tasks.flatMap((task) => task.interactions.map((item) => item.id));
    const unitProgressItems = progress.filter((item) => interactionIds.includes(item.interactionId));
    const completed = unitProgressItems.filter((item) => item.status === "COMPLETED").length;
    const unitAttempts = attempts.filter((item) => interactionIds.includes(item.interactionId));
    return { ...unit, analytics: { studentCount, completion: studentCount && interactionIds.length ? Math.round(completed / (studentCount * interactionIds.length) * 100) : 0, activeStudents: new Set(unitAttempts.map((item) => item.userId)).size, averageDuration: Math.round(average(unitAttempts.map((item) => item.effectiveDurationMs)) / 1000), retryRate: unitAttempts.length ? Math.round(unitAttempts.filter((item) => item.answerAttempts > 1).length / unitAttempts.length * 100) : 0, accuracy: unitAttempts.length ? Math.round(unitAttempts.filter((item) => item.finalAnswerCorrect).length / unitAttempts.length * 100) : 0 } };
  });
}

export async function getTeacherClasses() {
  const actor = await requireActor(Role.TEACHER);
  return db.teacherClass.findMany({
    where: { teacherId: actor.id },
    include: { classRoom: { include: { enrollments: { include: { user: { select: { id: true, username: true, displayName: true, nickname: true, studentNo: true, status: true } } }, orderBy: { user: { studentNo: "asc" } } } } } },
    orderBy: { classRoom: { createdAt: "asc" } },
  });
}
