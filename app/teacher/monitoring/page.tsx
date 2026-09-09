import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getTeacherDashboard } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function MonitoringPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams; const data = await getTeacherDashboard();
  const rows = data.students.filter((item) => (!params.q || item.name.includes(params.q) || item.studentNo?.includes(params.q)) && (params.status !== "attention" || data.attention.some((attention) => attention.id === item.id)));
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>学情监控</span><h1>学生学习进度</h1><p>按主线完成率、成长证据和近期活动进行教学支持。</p></div></header><form className="dashboard-filter-bar"><Search /><input defaultValue={params.q} name="q" placeholder="姓名或学号" /><select defaultValue={params.status ?? ""} name="status"><option value="">全部学生</option><option value="attention">建议关注</option></select><button>筛选</button></form><section className="teacher-table-panel standalone"><div className="admin-table" role="table"><div className="admin-table-head"><span>学生</span><span>学号</span><span>完成率</span><span>五维均值</span><span>重试提示</span><span>徽章</span><span>最近学习</span><span>操作</span></div>{rows.map((student) => <div key={student.id}><span><i className="student-avatar">{student.name.slice(-1)}</i><b>{student.name}</b></span><span>{student.studentNo}</span><span><i className="inline-progress"><b style={{ width: `${student.completion}%` }} /></i>{student.completion}%</span><strong>{student.literacy}</strong><span>{student.retries ? `${student.retries} 次` : "正常"}</span><span>{student.badges} 枚</span><span>{student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleString("zh-CN", { hour12: false }) : "暂无"}</span><Link href={`/teacher/students/${student.id}`}>详情<ArrowRight /></Link></div>)}</div></section></main>;
}
