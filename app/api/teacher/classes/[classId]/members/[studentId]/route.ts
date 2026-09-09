import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireTeacherContext, AuthorizationError } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({ action: z.enum(["archive", "restore", "reset-password"]), displayName: z.string().trim().min(2).max(30).optional(), nickname: z.string().trim().max(30).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ classId: string; studentId: string }> }) {
  try {
    const { classId, studentId } = await params; const actor = await requireTeacherContext(classId); const input = schema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "操作格式不正确" }, { status: 400 });
    const enrollment = await db.enrollment.findUniqueOrThrow({ where: { userId_classId: { userId: studentId, classId } } });
    if (input.data.action === "reset-password") await db.user.update({ where: { id: studentId }, data: { passwordHash: await hashPassword("SmartAgri2026!") } });
    else await db.enrollment.update({ where: { id: enrollment.id }, data: { status: input.data.action === "archive" ? "ARCHIVED" : "ACTIVE" } });
    await writeAudit({ actorId: actor.userId, classId, entityType: "Enrollment", entityId: enrollment.id, action: input.data.action.toUpperCase(), before: { status: enrollment.status }, after: { status: input.data.action } });
    return NextResponse.json({ ok: true, defaultPassword: input.data.action === "reset-password" ? "SmartAgri2026!" : undefined });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "成员操作失败" }, { status: error instanceof AuthorizationError ? 403 : 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ classId: string; studentId: string }> }) {
  try {
    const { classId, studentId } = await params;
    const actor = await requireTeacherContext(classId);
    const enrollment = await db.enrollment.findUniqueOrThrow({ where: { userId_classId: { userId: studentId, classId } } });
    if (enrollment.status !== "ARCHIVED") await db.enrollment.update({ where: { id: enrollment.id }, data: { status: "ARCHIVED" } });
    await writeAudit({ actorId: actor.userId, classId, entityType: "Enrollment", entityId: enrollment.id, action: "REMOVE_MEMBER", before: { status: enrollment.status }, after: { status: "ARCHIVED", recordsPreserved: true } });
    return NextResponse.json({ ok: true, recordsPreserved: true });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "移出成员失败" }, { status: error instanceof AuthorizationError ? 403 : 500 }); }
}
