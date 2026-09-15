import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { AuthorizationError, requireActor } from "@/lib/server/auth";

export async function PATCH(request: Request) {
  try {
    const actor = await requireActor("TEACHER");
    const input = z.object({ displayName: z.string().trim().min(1).max(30) }).safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "昵称请填写 1–30 个字符" }, { status: 400 });
    await db.$transaction(async tx => {
      await tx.user.update({ where: { id: actor.id }, data: input.data });
      await tx.auditLog.create({ data: { actorId: actor.id, entityType: "User", entityId: actor.id, action: "UPDATE_PROFILE", before: { displayName: actor.displayName }, after: input.data } });
    });
    revalidatePath("/teacher", "layout");
    return NextResponse.json(input.data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "保存失败，请重试" }, { status: error instanceof AuthorizationError ? 403 : 500 }); }
}
