import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeacherContext } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  order: z.number().int().min(1).max(999).optional(),
  isPublished: z.boolean().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableUntil: z.string().datetime().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "至少修改一项内容");

const models = {
  unit: db.unit,
  task: db.task,
  interaction: db.interaction,
} as const;

export async function PATCH(request: Request, context: { params: Promise<{ entity: string; id: string }> }) {
  try {
    const actor = await requireTeacherContext();
    const { entity, id } = await context.params;
    if (!(entity in models)) return NextResponse.json({ error: "不支持的内容类型" }, { status: 404 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "提交内容无效" }, { status: 400 });
    const model = models[entity as keyof typeof models] as typeof db.unit;
    const before = await model.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    const data = {
      ...parsed.data,
      ...(parsed.data.availableFrom !== undefined ? { availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null } : {}),
      ...(parsed.data.availableUntil !== undefined ? { availableUntil: parsed.data.availableUntil ? new Date(parsed.data.availableUntil) : null } : {}),
    };
    const after = await model.update({ where: { id }, data });
    await writeAudit({ actorId: actor.userId, classId: actor.classId, entityType: entity, entityId: id, action: "UPDATE", before, after });
    return NextResponse.json(after);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 403 });
  }
}
