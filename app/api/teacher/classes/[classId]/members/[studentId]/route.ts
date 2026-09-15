import { randomBytes } from "node:crypto";
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
    if (input.data.action === "reset-password") {
      const user = await db.user.findUniqueOrThrow({ where: { id: studentId } });
      if (user.role !== "STUDENT") throw new Error("仅可重置学生密码");
      const password = randomBytes(10).toString("hex"); const passwordHash = await hashPassword(password);
      await db.$transaction(async tx => {
        await tx.user.update({ where: { id: studentId }, data: { passwordHash } });
        await tx.authSession.deleteMany({ where: { userId: studentId } });
        await tx.auditLog.create({ data: { actorId: actor.userId, classId, entityType: "User", entityId: studentId, action: "RESET_PASSWORD" } });
      });
      return NextResponse.json({ ok: true, credentials: [{ displayName: user.displayName, studentNo: user.studentNo ?? "", username: user.username, password }] }, { headers: { "Cache-Control": "no-store" } });
    }
    await db.enrollment.update({ where: { id: enrollment.id }, data: { status: input.data.action === "archive" ? "ARCHIVED" : "ACTIVE" } });
    await writeAudit({ actorId: actor.userId, classId, entityType: "Enrollment", entityId: enrollment.id, action: input.data.action.toUpperCase(), before: { status: enrollment.status }, after: { status: input.data.action } });
    return NextResponse.json({ ok: true });
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
