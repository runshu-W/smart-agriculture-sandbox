import { getClassroomArchive, archiveHtml } from "@/lib/server/classroom-archive";
import { classroomHttpError } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const format = new URL(request.url).searchParams.get("format") ?? "html";
  if (format !== "html" && format !== "json") return Response.json({ error: "不支持的导出格式" }, { status: 400 });
  try {
    const { id } = await params;
    const report = await getClassroomArchive(id);
    return new Response(format === "html" ? archiveHtml(report) : JSON.stringify(report, null, 2), { headers: { "Content-Type": format === "html" ? "text/html; charset=utf-8" : "application/json; charset=utf-8", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'", ...(format === "json" ? { "Content-Disposition": 'attachment; filename="unit-05-classroom.json"' } : {}) } });
  } catch (error) { return classroomHttpError(error); }
}
