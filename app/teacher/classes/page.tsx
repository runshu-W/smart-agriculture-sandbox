import { ClassManager } from "@/components/class-manager";
import { getTeacherClasses } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const classes = await getTeacherClasses();
  return <main className="teacher-page class-management-page"><header className="teacher-page-heading"><div><span>班级管理</span><h1>班级与成员</h1><p>移出成员或归档班级会保留学习记录；删除班级将永久清理该班级数据。</p></div></header><ClassManager classes={classes} /></main>;
}
