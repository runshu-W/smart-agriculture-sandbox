import { NextResponse } from "next/server";
import { z } from "zod";
import { completeSimpleInteraction } from "@/lib/server/simple-interaction";

const schema = z.object({
  durationMs: z.number().int().min(0).max(1_800_000),
  narrationCompleted: z.boolean(),
  answers: z.array(z.enum(["A", "B", "C", "D", "E"])).max(12),
  questionResponses: z.array(z.object({ key: z.string().min(1).max(120), answer: z.enum(["A", "B", "C", "D", "E"]), correct: z.boolean(), version: z.number().int().positive() })).max(12).optional(),
  actionSummary: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
  privateContent: z.record(z.string(), z.union([z.string(), z.array(z.string()).max(12)])).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ interactionId: string; attemptId: string }> }) {
  const { interactionId, attemptId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "提交数据格式不正确" }, { status: 400 });
  try {
    return NextResponse.json(await completeSimpleInteraction(interactionId, attemptId, parsed.data));
  } catch {
    return NextResponse.json({ error: "未找到当前互动记录" }, { status: 404 });
  }
}
