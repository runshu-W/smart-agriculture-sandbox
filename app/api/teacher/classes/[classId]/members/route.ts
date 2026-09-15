import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeacherContext, AuthorizationError } from "@/lib/server/auth";
import { prepareStudent, insertStudents } from "@/lib/server/student-accounts";
const schema = z.object({ displayName: z.string().trim().min(1).max(30), studentNo: z.string().trim().regex(/^[a-zA-Z0-9_-]{3,24}$/), nickname: z.string().trim().max(30).optional() });
export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params; const actor = await requireTeacherContext(classId); const input = schema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "请填写姓名和 3–24 位学号（字母、数字、下划线或短横线）" }, { status: 400 });
    const existing = await db.user.findFirst({ where: { OR: [{ username: input.data.studentNo }, { studentNo: input.data.studentNo }] } });
    if (existing) return NextResponse.json({ error: "账号或学号已存在" }, { status: 409 });
    const prepared = await prepareStudent(input.data);
    await db.$transaction(async tx => {
      await insertStudents(tx, classId, [prepared]);
      await tx.auditLog.create({ data: { actorId: actor.userId, classId, entityType: "User", entityId: prepared.user.id, action: "ADD_MEMBER", after: { displayName: input.data.displayName, studentNo: input.data.studentNo } } });
    });
    return NextResponse.json({ id: prepared.user.id, credentials: [prepared.credential] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "添加失败，请检查学号是否重复或班级是否已归档" }, { status: error instanceof AuthorizationError ? 403 : 400 }); }
}
