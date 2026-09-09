import Link from "next/link";
import { Activity, ArrowRight, BookOpenCheck, GraduationCap, RefreshCw, TriangleAlert, UsersRound } from "lucide-react";
import { TeacherOverviewCharts } from "@/components/teacher-overview-charts";
import { TeacherLearningActivity } from "@/components/teacher-learning-activity";
import { getTeacherDashboard } from "@/lib/server/dashboards";
import { AuthorizationError } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let data: Awaited<ReturnType<typeof getTeacherDashboard>>;
  try { data = await getTeacherDashboard(); } catch (error) {
    if (!(error instanceof AuthorizationError)) throw error;
    return <main className="teacher-page"><header className="teacher-page-heading"><div><span>教师管理后台</span><h1>班级学习总览</h1><p>尚未建立可用的班级数据。</p></div></header><section className="admin-empty teacher-empty-dashboard"><UsersRound /><b>先创建第一个班级</b><p>创建后即可添加学生并查看学习数据。</p><Link className="teacher-action primary" href="/teacher/classes">前往班级与成员</Link></section></main>;
  }
  const students = data.students.filter((item) => !q || item.name.includes(q) || item.studentNo?.includes(q)).sort((a, b) => b.completion - a.completion || b.literacy - a.literacy).slice(0, 5);
  return <main className="teacher-page teacher-overview-page"><header className="teacher-page-heading"><div><span>教师管理后台</span><h1>班级学习总览</h1><p>{data.classRoom.name} · {data.classRoom.academicYear} {data.classRoom.semester}</p></div><div><Link className="teacher-action" href="/teacher/imports">导入数据</Link><Link className="teacher-action primary" href="/teacher/reports">导出报告</Link></div></header>
    <section className="teacher-kpis"><article><span><UsersRound /></span><div><small>班级总人数</small><strong>{data.kpis.studentCount}<i>人</i></strong><p>当前授权班级</p></div></article><article><span><Activity /></span><div><small>近期活跃</small><strong>{data.kpis.activeStudents}<i>人</i></strong><p>近 30 天产生学习记录</p></div></article><article><span><BookOpenCheck /></span><div><small>主线完成率</small><strong>{data.kpis.completion}<i>%</i></strong><p>五单元已开放主线</p></div></article><article><span><GraduationCap /></span><div><small>五维素养均值</small><strong>{data.kpis.literacy}</strong><p>基线与当前可追溯</p></div></article></section>
    <section className="teacher-overview-grid"><article className="teacher-table-panel"><header><div><h2>学生学习概况</h2><p>按主线完成率与素养均值展示前 5 名</p></div><form><input defaultValue={q} name="q" placeholder="搜索姓名或学号" /><button><RefreshCw />筛选</button></form></header><div className="admin-table" role="table"><div className="admin-table-head" role="row"><span>学生</span><span>学号</span><span>主线完成率</span><span>素养均值</span><span>徽章</span><span>最近学习</span><span>操作</span></div>{students.map((student) => <div role="row" key={student.id}><span><i className="student-avatar">{student.name.slice(-1)}</i><b>{student.name}</b></span><span>{student.studentNo ?? "未设置"}</span><span><i className="inline-progress"><b style={{ width: `${student.completion}%` }} /></i>{student.completion}%</span><strong>{student.literacy}</strong><span>{student.badges} 枚</span><span>{student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleDateString("zh-CN") : "暂无记录"}</span><Link href={`/teacher/students/${student.id}`}>查看<ArrowRight /></Link></div>)}</div><Link className="panel-footer-link" href="/teacher/monitoring">查看全部学生</Link></article>
      <article className="attention-panel"><header><div><TriangleAlert /><span><h2>建议关注</h2><p>仅用于安排教学支持</p></span></div><Link href="/teacher/monitoring">更多</Link></header>{data.attention.length ? data.attention.map((student) => <Link href={`/teacher/students/${student.id}`} key={student.id}><i className="student-avatar">{student.name.slice(-1)}</i><span><b>{student.name}</b><small>{student.reason}</small></span><strong>{student.completion}%</strong></Link>) : <p className="empty-admin">暂无需要关注的学习信号</p>}<small className="psych-safety-note">不依据单次情绪选择贴标签，不展示学生私密原文。</small></article></section>
    <TeacherOverviewCharts activity={data.activityTrend} careerAbility={data.careerAbility} literacy={data.literacy} resilience={data.resilienceTrend} roles={data.roleDistribution} sources={data.sourceCounts} units={data.unitPerformance} />
    <TeacherLearningActivity metrics={data.activityOverview} />
  </main>;
}
