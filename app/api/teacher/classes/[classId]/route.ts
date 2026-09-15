import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeacherContext, AuthorizationError } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({ name: z.string().trim().min(2).max(60).optional(), academicYear: z.string().trim().min(4).max(20).optional(), semester: z.string().trim().min(2).max(20).optional(), isArchived: z.boolean().optional(), leaderboardAnonymous: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params; const actor = await requireTeacherContext(classId); const input = schema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "班级信息格式不正确" }, { status: 400 });
    const before = await db.classRoom.findUniqueOrThrow({ where: { id: classId } });
    const updated = await db.classRoom.update({ where: { id: classId }, data: input.data });
    await writeAudit({ actorId: actor.userId, classId, entityType: "ClassRoom", entityId: classId, action: "UPDATE", before, after: updated });
    return NextResponse.json(updated);
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "更新班级失败" }, { status: error instanceof AuthorizationError ? 403 : 500 }); }
}

// Class-owned records cascade; user accounts and user-level progress remain.
export async function DELETE(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params;
    const actor = await requireTeacherContext(classId);
    const input = z.object({ name: z.string().min(1) }).safeParse(await request.json().catch(() => null));
    if (!input.success) return NextResponse.json({ error: "请输入班级名称以确认删除" }, { status: 400 });
    const result = await db.$transaction(async (tx) => {
      const before = await tx.classRoom.findUnique({ where: { id: classId }, include: { _count: { select: { enrollments: true, sessions: true, liveLessons: true, metrics: true, importBatches: true } } } });
      if (!before) return { error: "班级不存在或已删除", status: 404 };
      if (input.data.name !== before.name) return { error: "班级名称不匹配，未删除", status: 400 };
      const activeLesson = await tx.liveLesson.findFirst({ where: { classId, status: { not: "ENDED" } }, select: { id: true } });
      if (activeLesson) return { error: "该班级还有未结束的课堂，请先结束课堂再删除", status: 409 };
      await tx.classRoom.delete({ where: { id: classId } });
      await tx.auditLog.create({ data: { actorId: actor.userId, entityType: "ClassRoom", entityId: classId, action: "DELETE", before: { name: before.name, academicYear: before.academicYear, semester: before.semester, counts: before._count } } });
      return { ok: true };
    }, { isolationLevel: "Serializable" });
    return NextResponse.json(result, { status: "status" in result ? result.status : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "删除班级失败，数据可能已变化，请刷新后重试" }, { status: error instanceof AuthorizationError ? 403 : 500 });
  }
}
