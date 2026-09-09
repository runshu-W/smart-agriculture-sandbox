import { NextResponse } from "next/server";
import { getCurrentStudentDashboard } from "@/lib/server/dashboards";
import { renderStudentReport } from "@/lib/server/report-pdf";

export const runtime = "nodejs";

export async function GET() {
  try { const data = await getCurrentStudentDashboard(); const buffer = await renderStudentReport(data); return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${data.student.displayName}-成长档案.pdf`)}` } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "报告生成失败" }, { status: 403 }); }
}
