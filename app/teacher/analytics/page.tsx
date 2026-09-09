import { Filter } from "lucide-react";
import { DataSource } from "@/generated/prisma/client";
import { TeacherAnalyticsCharts } from "@/components/teacher-analytics-charts";
import { getTeacherAnalytics } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherAnalyticsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; source?: string }> }) {
  const params = await searchParams;
  const source = Object.values(DataSource).includes(params.source as DataSource) ? params.source as DataSource : undefined;
  const lessonFrom = Math.max(1, Math.min(15, Number(params.from) || 1)); const lessonTo = Math.max(lessonFrom, Math.min(15, Number(params.to) || 15));
  const data = await getTeacherAnalytics({ lessonFrom, lessonTo, source });
  return <main className="teacher-page analytics-page"><header className="teacher-page-heading"><div><span>统一指标数据层</span><h1>班级数据分析</h1><p>{data.classRoom.name} · 三个教学专题共 15 张动态图表</p></div></header><form className="dashboard-filter-bar"><Filter /><label>起始课次<select defaultValue={lessonFrom} name="from">{data.lessons.concat(Array.from({ length: 15 }, (_, index) => index + 1)).filter((item, index, array) => array.indexOf(item) === index).sort((a, b) => a - b).map((item) => <option key={item} value={item}>第 {item} 课</option>)}</select></label><label>结束课次<select defaultValue={lessonTo} name="to">{Array.from({ length: 15 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>第 {item} 课</option>)}</select></label><label>数据来源<select defaultValue={source ?? ""} name="source"><option value="">全部来源</option><option value="SIMULATION">沙盘</option><option value="XUEXITONG">学习通</option><option value="NATIONAL_PLATFORM">国家职教平台</option><option value="TEACHER_UPLOAD">教师上传</option></select></label><button>应用筛选</button></form><TeacherAnalyticsCharts data={data} /></main>;
}
