import "server-only";
import { db } from "@/lib/db";
import { requireActor, AuthorizationError } from "@/lib/server/auth";
import { ClassroomError } from "@/lib/classroom";
import { summarizeImpact } from "@/lib/impact-summary";
import type { ImpactObservation } from "@/lib/classroom-impact";
import { summarizeFramework, type FrameworkProgress } from "@/lib/classroom-framework";
import { DECISION_CHOICES, summarizeDecisions } from "@/lib/classroom-decision";
import { decisionOutcome } from "@/lib/server/classroom-decision";
import { groupRepresentatives, timingStats, type MapCard, type MapSignal } from "@/lib/classroom-completion";
import { timingOutcome, settleCompletion } from "@/lib/server/completion-state";
import { settleExpiredDecision } from "@/lib/server/classroom-decision";
import { TELEMETRY_FIELDS, escapeHtml as e } from "@/lib/classroom-archive";

export async function getClassroomArchive(id: string) {
  const actor = await requireActor();
  const initial = await db.liveLesson.findUnique({ where: { id }, include: { classRoom: true } });
  if (!initial) throw new ClassroomError("课堂不存在", 404);
  // Archived classrooms retain read access for their active members and assigned teachers.
  const permitted = actor.role === "TEACHER" ? await db.teacherClass.findUnique({ where: { teacherId_classId: { teacherId: actor.id, classId: initial.classId } } }) : actor.role === "STUDENT" ? await db.enrollment.findFirst({ where: { userId: actor.id, classId: initial.classId, status: "ACTIVE" } }) : null;
  if (!permitted) throw new AuthorizationError();
  const lesson = await settleCompletion(await settleExpiredDecision(initial));
  const people = await db.lessonPresence.findMany({ where: { lessonId: id }, include: { student: { select: { displayName: true } } } });
  const own = people.find(person => person.studentId === actor.id);
  if (actor.role === "STUDENT" && !own) throw new AuthorizationError("尚未参加这次课堂");
  const events = await db.learningEvent.findMany({ where: { liveLessonId: id, ...(own ? { userId: actor.id } : {}) }, orderBy: { occurredAt: "asc" }, select: { eventType: true, userId: true, occurredAt: true, payload: true } });
  const groups = lesson.mapGroups as Record<string, number>;
  const maps: MapCard[] = people.map(person => ({ studentId: person.studentId, name: person.student.displayName, group: groups[person.studentId] ?? null, signals: person.mapSignals as MapSignal[], version: person.mapVersion, submitted: !!person.mapSubmittedAt, nominations: people.filter(voter => voter.mapNominatedId === person.studentId).length }));
  const representatives = groupRepresentatives(maps);
  const impact = summarizeImpact((own ? [own] : people).map(person => ({ id: person.studentId, name: person.student.displayName, synced: !!person.impactSyncedAt, entryMs: person.impactEntryMs, observations: events.filter(event => event.userId === person.studentId && event.eventType === "IMPACT_OBSERVED").flatMap(event => (event.payload as { observations?: ImpactObservation[] }).observations ?? []) })), lesson.impactElapsedMs, !!lesson.impactClosedAt, !!own);
  const base = { schemaVersion: 1, title: "第五单元 · 面对行业变化课堂档案", exportedAt: new Date().toISOString(), lesson: { id, className: initial.classRoom.name, rehearsal: lesson.rehearsal, status: lesson.status, createdAt: lesson.createdAt, endedAt: lesson.endedAt }, scope: own ? "个人档案" : "班级汇总与变化地图", notes: ["演练与正式课堂明确区分；本档案不生成能力或心理健康分数。", "缺失数据保留为空，不以零分或默认选项代替。", "教学模拟指数依据操作估算，不代表真实情绪；课堂不采集眼动。", "三信号中的陈帅、葛梦婷、小禾来自操作手册情境，不是班级学生画像。"], fields: TELEMETRY_FIELDS.map(([key, name, definition]) => ({ key, name, definition })) };
  if (!own) return { ...base, classSummary: { joined: people.length, impact, decision: summarizeDecisions(people.map(decisionOutcome)), framework: summarizeFramework(people.map(person => person.frameworkProgress as FrameworkProgress)), vote: lesson.voteClosedAt ? timingStats(people.map(timingOutcome)) : { state: "投票尚未收束" }, maps, representatives: representatives.map(card => ({ studentId: card.studentId, group: card.group })), projectedMap: lesson.mapPresentation } };
  const progress = own.frameworkProgress as FrameworkProgress;
  const decision = decisionOutcome(own);
  return { ...base, student: { name: actor.displayName }, personal: { impact: impact.details?.[0] ?? null, decision: { ...decision, inDeadline: decision.reason === "submitted", label: DECISION_CHOICES.find(option => option.key === decision.choice)?.label ?? null, feedback: DECISION_CHOICES.find(option => option.key === decision.choice)?.comment ?? null, trace: own.decisionTrace }, framework: { answers: progress, retries: Object.fromEntries(Object.entries(progress).map(([key, value]) => [key, Math.max(0, value.attempts - 1)])), completedMs: own.frameworkCompletedMs }, map: { signals: own.mapSignals, priorities: (own.mapSignals as MapSignal[]).map(signal => ({ id: signal.id, priority: signal.priority })), submitted: !!own.mapSubmittedAt, group: groups[actor.id] ?? null, independentMs: own.mapIndependentMs, representative: representatives.some(card => card.studentId === actor.id), groupInteractions: own.groupInteractions, lateSync: events.some(event => (event.payload as { lateSync?: boolean }).lateSync) }, vote: timingOutcome(own) }, events: events.map(({ eventType, occurredAt, payload }) => ({ eventType, occurredAt, payload })) };
}

type Archive = Awaited<ReturnType<typeof getClassroomArchive>>;
export function archiveHtml(report: Archive) {
  const own = "personal" in report ? report.personal : undefined;
  const classReport = "classSummary" in report ? report.classSummary : undefined;
  const maps = own ? [{ name: "我的变化地图", signals: own.map.signals as MapSignal[] }] : classReport?.maps ?? [];
  const mapHtml = maps.map(map => `<article><h3>${e(map.name)}</h3><div class="layers">${(["macro", "micro", "self"] as const).map((layer, index) => `<section><h4>${["宏观环境变化", "微观环境变化", "自身条件变化"][index]}</h4>${map.signals.filter(signal => signal.layer === layer).map(signal => `<p class="signal ${signal.priority}"><b>${signal.priority === "now" ? "立即调整" : "持续观察"}</b><br>${e(signal.text)}</p>`).join("") || "<p>暂无记录</p>"}</section>`).join("")}</div></article>`).join("");
  const panel = own ? `<h2>我的课堂回顾</h2><p>角色决策：${e(own.decision.choice)} · ${e(own.decision.label)} · ${own.decision.elapsedMs === null ? "尚无提交用时" : (own.decision.elapsedMs / 1000).toFixed(1) + " 秒"}</p><p>${e(own.decision.feedback)}</p><p>归类完成：${Object.values(own.framework.answers).filter(answer => answer.solved).length} / 3；重试 ${Object.values(own.framework.retries).reduce((sum, count) => sum + count, 0)} 次</p><p>第 ${e(own.map.group)} 组 · ${own.map.representative ? "小组代表" : "组内参与者"} · 互动 ${own.map.groupInteractions} 次${own.map.lateSync ? " · 含活动结束后的补传" : ""}</p><p>调整时机投票：${e(own.vote.choice)} · ${own.vote.reason === "submitted" ? "已投票" : own.vote.reason ? "未作答" : "尚无结果"}</p>` : `<h2>班级课堂回顾</h2><p>到场 ${classReport?.joined} 人 · 地图提交 ${classReport?.maps.filter(map => map.submitted).length} 人 · 归类完成 ${classReport?.framework.completed} 人</p><p>决策已提交 ${classReport?.decision.submitted} 人 · 未作答 ${classReport?.decision.noAnswer} 人</p><p>调整时机投票：${classReport && "voted" in classReport.vote ? `有效 ${classReport.vote.voted} 票，未作答 ${classReport.vote.noAnswer} 人。${classReport.vote.options.map(option => `${option.key}：${option.count} 票（${option.percent}%）`).join("；")}` : "尚未收束"}</p>`;
  // JSON is escaped as text, never embedded in executable script or interpolated as markup.
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(report.title)}</title><style>body{font:16px/1.7 system-ui,sans-serif;color:#233d32;background:#f3f7f3;margin:0}main{max-width:1040px;margin:auto;padding:32px}h1{font-size:28px}h2{margin-top:32px}article{background:white;padding:24px;border:1px solid #d9e5da;border-radius:16px;margin:20px 0;break-inside:avoid}.layers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.signal{padding:12px;border-left:4px solid #f9a825;background:#fff8e7;overflow-wrap:anywhere}.signal.now{border-color:#e53935;background:#fff0ec}.signal b{font-size:12px}small{color:#586c60}pre{white-space:pre-wrap;word-break:break-word;font-size:12px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #d9e5da;padding:8px;text-align:left}@media(max-width:650px){main{padding:16px}.layers{grid-template-columns:1fr}}@media print{body{background:white}main{padding:0}.help{display:none}details{display:none}}</style><main><h1>${e(report.title)}</h1><p>${e(report.lesson.className)} · ${report.lesson.rehearsal ? "演练课堂" : "正式课堂"} · ${e(report.scope)}</p><small>课堂时间：${e(new Date(report.lesson.createdAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }))} · ${report.lesson.status === "ENDED" ? "课堂已结束" : "进行中快照"}</small><p class="help">可用浏览器“打印”保存为 PDF；也可保存本网页离线回看。</p>${panel}${mapHtml}<h2>记录说明</h2>${report.notes.map(note => `<p>${e(note)}</p>`).join("")}<details><summary>19 项采集口径</summary><table><thead><tr><th>记录项</th><th>含义</th></tr></thead><tbody>${report.fields.map(field => `<tr><td>${e(field.name)}</td><td>${e(field.definition)}</td></tr>`).join("")}</tbody></table></details><details><summary>完整记录</summary><pre>${e(JSON.stringify(report, null, 2))}</pre></details></main></html>`;
}
