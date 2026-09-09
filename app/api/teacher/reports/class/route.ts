import { NextResponse } from "next/server";
import { getTeacherAnalytics, getTeacherDashboard } from "@/lib/server/dashboards";
import { renderClassReport } from "@/lib/server/report-pdf";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try { const url = new URL(request.url); const lessonFrom = Number(url.searchParams.get("lessonFrom") ?? 1); const lessonTo = Number(url.searchParams.get("lessonTo") ?? 15); const source = url.searchParams.get("source") || undefined; const filters = { lessonFrom, lessonTo, ...(source ? { source: source as "SIMULATION" | "XUEXITONG" | "NATIONAL_PLATFORM" | "TEACHER_UPLOAD" } : {}) }; const [overview, analytics] = await Promise.all([getTeacherDashboard(filters), getTeacherAnalytics(filters)]); const buffer = await renderClassReport(overview, analytics); return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${overview.classRoom.name}-班级报告.pdf`)}` } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "报告生成失败" }, { status: 403 }); }
}
