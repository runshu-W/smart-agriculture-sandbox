import { ClassManager } from "@/components/class-manager";
import { getTeacherClasses } from "@/lib/server/dashboards";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const classes = await getTeacherClasses();
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>班级管理</span><h1>班级与成员</h1><p>成员只归档不删除，已有学习记录始终保留。</p></div></header><ClassManager classes={classes} /></main>;
}
