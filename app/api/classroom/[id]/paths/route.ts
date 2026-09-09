import { notifyClassroom } from "@/lib/server/classroom-notifications";
import { z } from "zod";
import { classroomHttpError, readClassroomPath } from "@/lib/server/classroom";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = z.object({ path: z.enum(["transform", "stay", "upgrade"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "无效路径" }, { status: 400 });
  try { const { id } = await params; const result = await readClassroomPath(id, parsed.data.path); notifyClassroom(id); return Response.json(result); }
  catch (error) { return classroomHttpError(error); }
}
