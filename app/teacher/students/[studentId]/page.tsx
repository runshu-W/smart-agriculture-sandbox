import Link from "next/link";
import { ArrowLeft, Award, Clock3, GraduationCap } from "lucide-react";
import { StudentDashboardVisuals } from "@/components/student-dashboard-visuals";
import { getTeacherStudentDashboard } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params; const data = await getTeacherStudentDashboard(studentId);
  return <main className="teacher-page teacher-student-page"><Link className="back-link" href="/teacher/monitoring"><ArrowLeft />返回学情监控</Link><header className="teacher-page-heading"><div><span>学生成长详情</span><h1>{data.student.displayName}</h1><p>{data.student.studentNo} · {data.classRoom.name}</p></div><Link className="teacher-action primary" href={`/api/teacher/reports/student/${studentId}`}>导出学生报告</Link></header><section className="teacher-kpis compact"><article><span><GraduationCap /></span><div><small>五维素养均值</small><strong>{Math.round(data.literacy.reduce((sum, item) => sum + item.current, 0) / data.literacy.length)}</strong></div></article><article><span><Award /></span><div><small>已获徽章</small><strong>{data.badges.filter((item) => item.earned).length}<i>枚</i></strong></div></article><article><span><Clock3 /></span><div><small>有效学习</small><strong>{data.activity.effectiveMinutes}<i>分钟</i></strong></div></article></section><StudentDashboardVisuals curve={data.curve} literacy={data.literacy} ownId={data.student.id} rankings={data.rankings} /><section className="teacher-student-units"><h2>五单元进度</h2>{data.units.map((unit) => <div key={unit.id}><span>{unit.title}</span><i><b style={{ width: `${unit.percent}%` }} /></i><strong>{unit.percent}%</strong></div>)}</section><p className="psych-safety-note">本页仅展示授权学习证据，不包含树洞、感恩、关系计划、规划书、签名、梦想或信件原文。</p></main>;
}
