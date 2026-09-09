import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeacherContext } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({
  prompt: z.string().trim().min(2).max(1000).optional(),
  options: z.array(z.string().trim().min(1).max(300)).min(2).max(8).optional(),
  correctAnswers: z.array(z.string().trim().min(1)).min(1).max(8).optional(),
  feedback: z.array(z.string().trim().max(500)).max(8).optional(),
  isPublished: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "至少修改一项内容");

export async function PATCH(request: Request, context: { params: Promise<{ questionId: string }> }) {
  try {
    const actor = await requireTeacherContext();
    const { questionId } = await context.params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "题目内容无效" }, { status: 400 });
    const before = await db.question.findUnique({ where: { id: questionId }, include: { interaction: { include: { task: true } } } });
    if (!before) return NextResponse.json({ error: "题目不存在" }, { status: 404 });
    if (parsed.data.correctAnswers && parsed.data.options) {
      const valid = parsed.data.correctAnswers.every((answer) => /^[A-H]$/.test(answer) && answer.charCodeAt(0) - 65 < parsed.data.options!.length);
      if (!valid) return NextResponse.json({ error: "正确项必须对应现有选项序号" }, { status: 400 });
    }
    const after = await db.question.update({ where: { id: questionId }, data: { ...parsed.data, version: { increment: 1 } } });
    await writeAudit({ actorId: actor.userId, classId: actor.classId, entityType: "question", entityId: questionId, action: "PUBLISH_VERSION", before, after });
    return NextResponse.json(after);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 403 });
  }
}
