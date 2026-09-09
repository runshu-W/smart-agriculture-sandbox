import Link from "next/link";
import { db } from "@/lib/db";
import { requireActor } from "@/lib/server/auth";
import { Role } from "@/generated/prisma/client";
export async function ClassroomArchiveList({ page = 1 }: { page?: number }) {
  const actor = await requireActor(Role.STUDENT);
  const current = Math.max(1, Math.min(10000, Number.isFinite(page) ? Math.floor(page) : 1));
  const records = await db.lessonPresence.findMany({ where: { studentId: actor.id, lesson: { classRoom: { enrollments: { some: { userId: actor.id, status: "ACTIVE" } } } } }, orderBy: { joinedAt: "desc" }, skip: (current - 1) * 8, take: 9, include: { lesson: { include: { classRoom: { select: { name: true } } } } } });
  return <section className="classroom-archive-list" id="classroom-archives"><div className="section-title"><div><span>第五单元 · 面对行业变化</span><h2>我的课堂档案</h2></div></div><p>地图、学习过程与调整时机投票会保存在这里，演练记录单独标明。</p>{records.slice(0, 8).map(record => <article key={record.id}><div><b>{record.lesson.classRoom.name} · {record.lesson.rehearsal ? "演练课堂" : "正式课堂"}</b><p>{record.joinedAt.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })} · {record.lesson.status === "ENDED" ? "已结束" : "进行中"} · {record.mapSubmittedAt ? "已提交变化地图" : "地图草稿"}</p></div><a href={`/api/classroom/${record.lessonId}/archive?format=html`} target="_blank" rel="noopener noreferrer">回看 / 打印</a><a href={`/api/classroom/${record.lessonId}/archive?format=json`}>下载记录</a></article>)}{!records.length && <p>参加一次课堂后，可以在这里回看自己的记录。</p>}<nav aria-label="课堂档案翻页">{current > 1 && <Link href={`/student/progress?archivePage=${current - 1}#classroom-archives`}>上一页</Link>}<span>第 {current} 页</span>{records.length > 8 && <Link href={`/student/progress?archivePage=${current + 1}#classroom-archives`}>下一页</Link>}</nav></section>;
}
