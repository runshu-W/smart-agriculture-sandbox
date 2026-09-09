import { notifyClassroom } from "@/lib/server/classroom-notifications";
import { z } from "zod";
import { classroomHttpError } from "@/lib/server/classroom";
import { submitFramework } from "@/lib/server/classroom-framework";
const schema = z.object({ attemptId: z.string().uuid(), event: z.enum(["ai", "farmer", "hesitation"]), layer: z.enum(["macro", "micro", "self"]) }).strict();
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "映射参数无效，请选择事件和层级" }, { status: 400 });
  try { const { attemptId, event, layer } = parsed.data; const { id } = await context.params; const result = await submitFramework(id, attemptId, event, layer); notifyClassroom(id); return Response.json(result); }
  catch (error) { return classroomHttpError(error); }
}
