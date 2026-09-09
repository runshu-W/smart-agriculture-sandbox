import { z } from "zod";
import { classroomHttpError, createClassroom, listClassrooms } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { return Response.json(await listClassrooms(new URL(request.url).searchParams.get("view") === "teacher"), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return classroomHttpError(error); }
}
export async function POST(request: Request) {
  const parsed = z.object({ classId: z.string().min(1).max(100), rehearsal: z.boolean() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "请选择班级和课堂类型" }, { status: 400 });
  try { return Response.json(await createClassroom(parsed.data.classId, parsed.data.rehearsal)); }
  catch (error) { return classroomHttpError(error); }
}
