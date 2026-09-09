import { notifyClassroom } from "@/lib/server/classroom-notifications";
import { classroomHttpError } from "@/lib/server/classroom";
import { mapInput, updateChangeMap } from "@/lib/server/classroom-map-vote";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = mapInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "地图参数无效，每条信号限120字，最多30条" }, { status: 400 });
  try { const { id } = await context.params; const result = await updateChangeMap(id, parsed.data); if (!("conflict" in result)) notifyClassroom(id); return Response.json(result, { status: "conflict" in result ? 409 : 200 }); } catch (error) { return classroomHttpError(error); }
}
