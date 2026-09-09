import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStudentContext } from "@/lib/server/auth";

const answerSchema = z.object({ key: z.string().min(1).max(120).default("primary"), answer: z.string().min(1).max(20) });

export async function GET(_request: Request, context: { params: Promise<{ interactionId: string }> }) {
  try {
    await requireStudentContext();
    const { interactionId } = await context.params;
    const interaction = await db.interaction.findUnique({ where: { id: interactionId }, include: { task: true } });
    if (!interaction?.isPublished || !interaction.task.isPublished) return NextResponse.json({ error: "互动未开放" }, { status: 404 });
    const questions = await db.question.findMany({ where: { interactionId, isPublished: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ questions: questions.map((item) => ({ id: item.id, key: item.key, prompt: item.prompt, options: Array.isArray(item.options) ? item.options : [], version: item.version })) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 403 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ interactionId: string }> }) {
  try {
    await requireStudentContext();
    const { interactionId } = await context.params;
    const parsed = answerSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "答案格式无效" }, { status: 400 });
    const question = await db.question.findFirst({ where: { interactionId, key: parsed.data.key, isPublished: true } });
    if (!question) return NextResponse.json({ error: "题目未发布" }, { status: 404 });
    const accepted = Array.isArray(question.correctAnswers) ? question.correctAnswers.map(String) : [];
    const feedback = Array.isArray(question.feedback) ? question.feedback.map(String) : [];
    const optionIndex = Math.max(0, parsed.data.answer.toUpperCase().charCodeAt(0) - 65);
    const correct = accepted.includes(parsed.data.answer);
    return NextResponse.json({ correct, feedback: feedback[optionIndex] ?? feedback[0] ?? (correct ? "判断准确。" : "请结合场景线索再思考。"), version: question.version });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "判定失败" }, { status: 403 });
  }
}
