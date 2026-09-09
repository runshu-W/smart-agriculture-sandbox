import Link from "next/link";
import { ArrowRight, CalendarClock, CircleCheckBig, UsersRound } from "lucide-react";
import { getTeacherUnits } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherUnitsPage() {
  const units = await getTeacherUnits();
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>单元分析</span><h1>五单元教学全景</h1><p>选择单元后查看任务、互动、问答与学生完成数据。</p></div></header><section className="teacher-unit-list">{units.map((unit) => <article key={unit.id}><header><span>0{unit.order}</span><b className={unit.isPublished ? "published" : "draft"}>{unit.isPublished ? "已开放" : "未开放"}</b></header><h2>{unit.title}</h2><p>{unit.description}</p><div><span><CircleCheckBig />完成率<strong>{unit.analytics.completion}%</strong></span><span><UsersRound />活跃学生<strong>{unit.analytics.activeStudents}</strong></span><span><CalendarClock />平均用时<strong>{unit.analytics.averageDuration}s</strong></span></div><Link href={`/teacher/units/${unit.id}`}>进入单元分析<ArrowRight /></Link></article>)}</section></main>;
}
