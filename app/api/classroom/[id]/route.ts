import { notifyClassroom } from "@/lib/server/classroom-notifications";
import { z } from "zod";
import { classroomHttpError, classroomSnapshot, controlClassroom, studentClassroomAction } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ version: z.number().int().positive(), action: z.enum(["start", "pause", "resume", "reset", "stage", "end", "impact-start", "impact-results", "impact-scene", "decision-start", "map-start", "vote-start", "signals-show"]), stage: z.number().int().min(0).max(5).optional(), minutes: z.number().int().min(1).max(60).optional() });
export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const view = new URL(request.url).searchParams.get("view");
  if (view !== "teacher" && view !== "student" && view !== "screen") return Response.json({ error: "无效视图" }, { status: 400 });
  try { return Response.json(await classroomSnapshot(id, view), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return classroomHttpError(error); }
}
export async function PATCH(request: Request, context: Context) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "课堂控制参数无效" }, { status: 400 });
  try { const { id } = await context.params; const result = await controlClassroom(id, parsed.data.version, parsed.data); notifyClassroom(id); return Response.json(result); } catch (error) { return classroomHttpError(error); }
}
export async function POST(request: Request, context: Context) {
  const parsed = z.object({ action: z.enum(["join", "presence", "ready"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "课堂操作无效" }, { status: 400 });
  try { const { id } = await context.params; const result = await studentClassroomAction(id, parsed.data.action); if (parsed.data.action !== "presence") notifyClassroom(id); return Response.json(result); } catch (error) { return classroomHttpError(error); }
}
