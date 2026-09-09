import { notifyClassroom } from "@/lib/server/classroom-notifications";
import { z } from "zod";
import { classroomHttpError } from "@/lib/server/classroom";
import { submitTimingVote } from "@/lib/server/classroom-map-vote";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = z.object({ choice: z.enum(["A", "B", "C"]) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "请选择有效选项" }, { status: 400 });
  try { const { id } = await context.params; const result = await submitTimingVote(id, parsed.data.choice); notifyClassroom(id); return Response.json(result); } catch (error) { return classroomHttpError(error); }
}
