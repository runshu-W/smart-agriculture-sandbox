import { NextResponse } from "next/server";
import { z } from "zod";
import { completeThresherAttempt } from "@/lib/server/learning";

const bodySchema = z.object({
  effectiveDurationMs: z.number().int().min(0).max(120_000),
  dragSegments: z.number().int().min(0).max(100_000),
  narrationCompleted: z.boolean(),
  answers: z.array(z.enum(["A", "B", "C", "D"])).min(1).max(2),
  questionResponses: z.array(z.object({ key: z.string().min(1).max(120), answer: z.enum(["A", "B", "C", "D"]), correct: z.boolean(), version: z.number().int().positive() })).max(2).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "提交数据格式不正确" }, { status: 400 });
  try {
    return NextResponse.json(await completeThresherAttempt(attemptId, parsed.data));
  } catch {
    return NextResponse.json({ error: "未找到当前训练记录" }, { status: 404 });
  }
}
