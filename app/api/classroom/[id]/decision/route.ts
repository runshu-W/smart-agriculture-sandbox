import { notifyClassroom } from "@/lib/server/classroom-notifications";
import { z } from "zod";
import { classroomDecisionReport, classroomHttpError, submitClassroomDecision } from "@/lib/server/classroom";
const input = z.object({ choice: z.enum(["A", "B", "C", "D"]), trace: z.array(z.object({ choice: z.enum(["A", "B", "C", "D"]), atMs: z.number().int().min(0).max(180000) })).max(300).default([]) }).strict();
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "无效的决策选择" }, { status: 400 });
  try { const { id } = await context.params; const result = await submitClassroomDecision(id, parsed.data.choice, parsed.data.trace); notifyClassroom(id); return Response.json(result); }
  catch (error) { return classroomHttpError(error); }
}
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { return Response.json(await classroomDecisionReport((await context.params).id), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return classroomHttpError(error); }
}
