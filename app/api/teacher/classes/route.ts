import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireActor, AuthorizationError } from "@/lib/server/auth";


const schema = z.object({ name: z.string().trim().min(2).max(60), academicYear: z.string().trim().min(4).max(20), semester: z.string().trim().min(2).max(20) });

export async function POST(request: Request) {
  try {
    const actor = await requireActor(Role.TEACHER); const input = schema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "班级信息不完整" }, { status: 400 });
    const classRoom = await db.$transaction(async tx => {
      const created = await tx.classRoom.create({ data: { ...input.data, teachers: { create: { teacherId: actor.id } } } });
      await tx.auditLog.create({ data: { actorId: actor.id, classId: created.id, entityType: "ClassRoom", entityId: created.id, action: "CREATE", after: input.data } });
      return created;
    });
    return NextResponse.json(classRoom, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "新建班级失败" }, { status: error instanceof AuthorizationError ? 403 : 500 }); }
}
