import { ImportManager } from "@/components/import-manager";
import { db } from "@/lib/db";
import { requireActor } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function TeacherImportsPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const { classId } = await searchParams;
  const actor = await requireActor("TEACHER");
  const classes = await db.teacherClass.findMany({ where: { teacherId: actor.id }, include: { classRoom: true } });
  const classIds = classes.map((item) => item.classId);
  const batches = await db.importBatch.findMany({ where: { classId: { in: classIds } }, include: { rows: { orderBy: { rowNumber: "asc" } } }, orderBy: { createdAt: "desc" }, take: 20 });
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>数据导入</span><h1>班级名单与学习数据导入</h1><p>先建班，再上传学号和姓名。系统为学生生成独立密码，学生使用学号登录。</p></div></header><ImportManager initialClassId={classes.some(c => c.classId === classId && !c.classRoom.isArchived) ? classId : undefined} batches={batches} classes={classes.filter(item => !item.classRoom.isArchived).map((item) => ({ id: item.classId, name: item.classRoom.name }))} /></main>;
}
