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
