import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireTeacherContext, AuthorizationError } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({ displayName: z.string().trim().min(2).max(30), username: z.string().trim().regex(/^[a-zA-Z0-9_-]{3,32}$/), studentNo: z.string().trim().min(4).max(24), nickname: z.string().trim().max(30).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params; const actor = await requireTeacherContext(classId); const input = schema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "成员信息格式不正确" }, { status: 400 });
    const existing = await db.user.findFirst({ where: { OR: [{ username: input.data.username }, { studentNo: input.data.studentNo }] } });
    if (existing) return NextResponse.json({ error: "账号或学号已存在" }, { status: 409 });
    const passwordHash = await hashPassword("SmartAgri2026!");
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { ...input.data, passwordHash, role: "STUDENT" } });
      await tx.enrollment.create({ data: { userId: created.id, classId } });
      for (const unitId of ["unit-01", "unit-02", "unit-03", "unit-04", "unit-05"]) await tx.scoreSnapshot.create({ data: { userId: created.id, unitId } });
      return created;
    });
    await writeAudit({ actorId: actor.userId, classId, entityType: "User", entityId: user.id, action: "ADD_MEMBER", after: { displayName: user.displayName, studentNo: user.studentNo } });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "添加成员失败" }, { status: error instanceof AuthorizationError ? 403 : 500 }); }
}
