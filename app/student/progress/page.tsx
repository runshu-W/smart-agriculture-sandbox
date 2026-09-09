import { requirePageActor } from "@/lib/server/auth";
import { Role } from "@/generated/prisma/client";
import { ClassroomArchiveList } from "@/components/classroom-archive-list";
import Link from "next/link";
import { Activity, ArrowRight, Award, BookOpenCheck, Clock3, Download, GraduationCap, Sprout } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { StudentDashboardVisuals } from "@/components/student-dashboard-visuals";
import { getCurrentStudentDashboard } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

const statusText = { NOT_STARTED: "未开始", IN_PROGRESS: "进行中", COMPLETED: "已完成" } as const;

export default async function StudentProgressPage({ searchParams }: { searchParams: Promise<{ archivePage?: string }> }) {
  const query = await searchParams;
  const actor = await requirePageActor(Role.STUDENT);
  if (!actor.enrollments.length) return <main className="page-shell growth-dashboard-page"><AppHeader /><section className="growth-dashboard-heading"><div><h1>{actor.displayName}，你的课堂档案已保留</h1><p>当前没有进行中的班级，可以继续回看已归档课堂。</p></div></section><ClassroomArchiveList page={Number(query.archivePage ?? 1)} /></main>;
  const data = await getCurrentStudentDashboard();
  return <main className="page-shell growth-dashboard-page">
    <AppHeader />
    <section className="growth-dashboard-heading"><div><span className="eyebrow"><GraduationCap />个人成长档案</span><h1>{data.student.displayName}，这是你的成长全景</h1><p>{data.classRoom.name} · {data.classRoom.academicYear} {data.classRoom.semester}</p></div><div className="heading-actions"><a className="quiet-action" href="/api/student/reports/profile"><Download />导出档案</a><Link className="primary-button compact" href="/student">继续训练<ArrowRight /></Link></div></section>
    <section className="growth-kpis"><article><Activity /><span>完成互动</span><strong>{data.activity.completedAttempts}</strong><small>仅统计已形成证据的互动</small></article><article><Clock3 /><span>有效学习</span><strong>{data.activity.effectiveMinutes}<small> 分钟</small></strong><small>由真实操作用时累计</small></article><article><Award /><span>已获徽章</span><strong>{data.badges.filter((item) => item.earned).length}<small> / 5</small></strong><small>完成单元主线后解锁</small></article></section>
    <StudentDashboardVisuals curve={data.curve} literacy={data.literacy} ownId={data.student.id} rankings={data.rankings} />
    <section className="progress-overview"><div className="section-title"><div><span>闯关进度</span><h2>五单元学习路径</h2></div><b>不显示逐互动得分</b></div><div className="unit-progress-grid">{data.units.map((unit, index) => <article key={unit.id}><header><span>0{index + 1}</span><b className={unit.status.toLowerCase()}>{statusText[unit.status]}</b></header><h3>{unit.title}</h3><div className="meter"><i style={{ width: `${unit.percent}%` }} /></div><p>{unit.completed} / {unit.total} 项 · {unit.percent}%</p><Link href={unit.route}>{unit.status === "NOT_STARTED" ? "进入单元" : "查看单元"}<ArrowRight /></Link></article>)}</div></section>
    <section className="badge-wall"><div className="section-title"><div><span>成长印记</span><h2>徽章墙</h2></div></div><div>{data.badges.map((badge) => <article className={badge.earned ? "earned" : ""} key={badge.id}><span><Sprout /></span><b>{badge.title}</b><small>{badge.earned ? "已获得" : `完成${badge.unitTitle}后解锁`}</small></article>)}</div></section>
    <ClassroomArchiveList page={Number(query.archivePage ?? 1)} />
    <section className="student-event-log"><div className="section-title"><div><span>最近记录</span><h2>学习行为</h2></div><BookOpenCheck /></div>{data.recentEvents.length ? data.recentEvents.map((event) => <div key={event.id}><i /><span>{event.eventType.replaceAll("_", " ")}</span><small>{new Date(event.occurredAt).toLocaleString("zh-CN", { hour12: false })}</small></div>) : <p>完成一次任务后，这里会显示学习轨迹。</p>}</section>
  </main>;
}
