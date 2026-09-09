import { ImportManager } from "@/components/import-manager";
import { db } from "@/lib/db";
import { requireTeacherContext } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function TeacherImportsPage() {
  const actor = await requireTeacherContext();
  const classes = await db.teacherClass.findMany({ where: { teacherId: actor.userId, classRoom: { isArchived: false } }, include: { classRoom: true } });
  const classIds = classes.map((item) => item.classId);
  const batches = await db.importBatch.findMany({ where: { classId: { in: classIds } }, include: { rows: { orderBy: { rowNumber: "asc" } } }, orderBy: { createdAt: "desc" }, take: 20 });
  return <main className="teacher-page"><header className="teacher-page-heading"><div><span>数据导入</span><h1>外部学习数据接入</h1><p>下载标准模板，逐行校验后将学习通、国家职教平台和教师数据写入统一指标层。</p></div></header><ImportManager batches={batches} classes={classes.map((item) => ({ id: item.classId, name: item.classRoom.name }))} /></main>;
}
