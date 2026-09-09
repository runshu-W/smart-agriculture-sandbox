import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw, UsersRound } from "lucide-react";
import { UnitAnalysisCharts } from "@/components/unit-analysis-charts";
import { getTeacherUnits } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherUnitDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params; const unit = (await getTeacherUnits()).find((item) => item.id === unitId); if (!unit) notFound();
  const taskRows = unit.tasks.map((task) => ({ title: task.title, completion: task.interactions.length ? Math.round(task.interactions.reduce((sum) => sum + unit.analytics.completion, 0) / task.interactions.length) : 0, accuracy: unit.analytics.accuracy, retryRate: unit.analytics.retryRate }));
  return <main className="teacher-page unit-detail-page"><Link className="back-link" href="/teacher/units"><ArrowLeft />返回单元列表</Link><header className="teacher-page-heading"><div><span>单元 {unit.order}</span><h1>{unit.title}</h1><p>{unit.description}</p></div></header><section className="teacher-kpis compact"><article><span><CheckCircle2 /></span><div><small>整体完成率</small><strong>{unit.analytics.completion}<i>%</i></strong></div></article><article><span><UsersRound /></span><div><small>活跃学生</small><strong>{unit.analytics.activeStudents}<i>人</i></strong></div></article><article><span><Clock3 /></span><div><small>平均有效用时</small><strong>{unit.analytics.averageDuration}<i>秒</i></strong></div></article><article><span><RotateCcw /></span><div><small>重试率</small><strong>{unit.analytics.retryRate}<i>%</i></strong></div></article></section><UnitAnalysisCharts tasks={taskRows} /><section className="unit-task-table"><header><h2>任务与关卡明细</h2><span>来源：沙盘统一 Progress / Attempt</span></header>{unit.tasks.map((task) => <article key={task.id}><div><b>{task.title}</b><small>{task.description || `${task.interactions.length} 个互动点`}</small></div><div>{task.interactions.map((interaction) => <span key={interaction.id}><i className={interaction.isPublished ? "open" : "closed"} />{interaction.title}<small>{interaction.questions.length} 题</small></span>)}</div></article>)}</section></main>;
}
