import { Download, FileChartColumn, FileSpreadsheet, UserRound } from "lucide-react";
import { getTeacherDashboard } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherReportsPage() {
  const data = await getTeacherDashboard();
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>报告中心</span><h1>教学数据与成长报告</h1><p>报告和页面读取同一聚合结果，并记录当前筛选范围、来源与生成时间。</p></div></header><section className="report-actions"><article><FileChartColumn /><div><h2>班级完整报告</h2><p>含总览、砺心提质、明职定向、筑基强责三个专题及全部 15 张图表。</p></div><a className="primary-button" href="/api/teacher/reports/class"><Download />下载 PDF</a></article><article><FileSpreadsheet /><div><h2>当前筛选数据</h2><p>导出第 1 至 15 课统一指标明细，便于校内留档和进一步分析。</p></div><a className="primary-button" href="/api/teacher/reports/data"><Download />下载 XLSX</a></article></section><section className="student-report-list"><header><div><span>学生报告</span><h2>个人成长档案 PDF</h2></div><strong>{data.students.length} 人</strong></header><div className="admin-table"><div className="admin-table-head"><span>学生</span><span>学号</span><span>主线进度</span><span>五维均值</span><span>报告</span></div>{data.students.map((student) => <div key={student.id}><span><i className="student-avatar"><UserRound /></i><b>{student.name}</b></span><span>{student.studentNo}</span><span>{student.completion}%</span><span>{student.literacy}</span><a href={`/api/teacher/reports/student/${student.id}`}><Download />PDF</a></div>)}</div></section></main>;
}
