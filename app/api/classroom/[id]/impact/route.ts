import { z } from "zod";
import { classroomHttpError, saveImpactObservations, impactSummary } from "@/lib/server/classroom";
const schema = z.object({ batchId: z.string().uuid(), complete: z.boolean().optional(), observations: z.array(z.object({
  region: z.enum(["audience", "news", "farmer", "team"]), kind: z.enum(["view", "dwell"]),
  atMs: z.number().int().min(0).max(86_400_000), durationMs: z.number().int().min(0).max(86_400_000),
})).max(100) }).refine(value => value.observations.length > 0 || value.complete === true);
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "观察记录格式无效" }, { status: 400 });
  try { return Response.json(await saveImpactObservations((await params).id, parsed.data.batchId, parsed.data.observations, parsed.data.complete)); }
  catch (error) { return classroomHttpError(error); }
}
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const view = new URL(request.url).searchParams.get("view");
  if (view !== "teacher" && view !== "screen") return Response.json({ error: "无权查看班级数据" }, { status: 403 });
  try { return Response.json(await impactSummary((await params).id, view), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return classroomHttpError(error); }
}
