import { ContentManager } from "@/components/content-manager";
import { getTeacherUnits } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherContentPage() {
  const units = await getTeacherUnits();
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>内容与题目</span><h1>课程发布中心</h1><p>按单元、任务、互动维护学生可见内容；每次发布自动增加题目版本并保留审计记录。</p></div></header><ContentManager units={units} /></main>;
}
