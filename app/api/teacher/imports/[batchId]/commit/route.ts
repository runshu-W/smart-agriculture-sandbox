import { NextResponse } from "next/server";
import { z } from "zod";
import { ImportRowStatus, MetricPhase, Role, type DataSource } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { hashPassword, requireTeacherContext } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({ overwrite: z.boolean().default(false) });
const DEFAULT_PASSWORD = "SmartAgri2026!";

export async function POST(request: Request, context: { params: Promise<{ batchId: string }> }) {
  try {
    const { batchId } = await context.params; const input = schema.parse(await request.json().catch(() => ({})));
    const batch = await db.importBatch.findUnique({ where: { id: batchId }, include: { rows: { orderBy: { rowNumber: "asc" } } } });
    if (!batch) return NextResponse.json({ error: "批次不存在" }, { status: 404 });
    const actor = await requireTeacherContext(batch.classId);
    if (batch.status !== "VALIDATED" || batch.invalidRows > 0) return NextResponse.json({ error: "该批次未通过完整校验" }, { status: 409 });
    if (batch.kind === "members") {
      const passwordHash = await hashPassword(DEFAULT_PASSWORD);
      await db.$transaction(async (tx) => {
        for (const row of batch.rows) {
          const raw = row.raw as { displayName: string; studentNo: string; username: string; nickname?: string };
          const existing = await tx.user.findFirst({ where: { OR: [{ username: raw.username }, { studentNo: raw.studentNo }] } });
          if (existing) throw new Error(`第 ${row.rowNumber} 行账号或学号已存在`);
          const user = await tx.user.create({ data: { username: raw.username, displayName: raw.displayName, nickname: raw.nickname || null, studentNo: raw.studentNo, passwordHash, role: Role.STUDENT } });
          await tx.enrollment.create({ data: { classId: batch.classId, userId: user.id } });
          await tx.importRow.update({ where: { id: row.id }, data: { status: ImportRowStatus.IMPORTED } });
        }
        await tx.importBatch.update({ where: { id: batch.id }, data: { status: "COMMITTED", committedAt: new Date() } });
      });
    } else {
      const enrolled = await db.enrollment.findMany({ where: { classId: batch.classId, status: "ACTIVE" }, include: { user: true } });
      const prepared = batch.rows.map((row) => { const raw = row.raw as { studentName: string; studentNo: string; metricKey: string; value: number; measuredAt: string; lessonIndex: number | null; phase: string; source: string }; const member = enrolled.find((item) => (raw.studentNo && item.user.studentNo === raw.studentNo) || (!raw.studentNo && item.user.displayName === raw.studentName)); if (!member) throw new Error(`第 ${row.rowNumber} 行找不到班级成员`); return { row, raw, member }; });
      const duplicateKeys: string[] = [];
      for (const item of prepared) { const duplicate = await db.metricObservation.findFirst({ where: { classId: batch.classId, userId: item.member.userId, metricKey: item.raw.metricKey, source: item.raw.source as DataSource, measuredAt: new Date(item.raw.measuredAt) } }); if (duplicate) duplicateKeys.push(item.row.id); }
      if (duplicateKeys.length && !input.overwrite) return NextResponse.json({ error: `发现 ${duplicateKeys.length} 条重复指标，请确认覆盖`, requiresOverwrite: true }, { status: 409 });
      await db.$transaction(async (tx) => {
        for (const item of prepared) {
          if (input.overwrite) await tx.metricObservation.deleteMany({ where: { classId: batch.classId, userId: item.member.userId, metricKey: item.raw.metricKey, source: item.raw.source as DataSource, measuredAt: new Date(item.raw.measuredAt) } });
          await tx.metricObservation.create({ data: { classId: batch.classId, userId: item.member.userId, metricKey: item.raw.metricKey, value: item.raw.value, phase: item.raw.phase as MetricPhase, lessonIndex: item.raw.lessonIndex, measuredAt: new Date(item.raw.measuredAt), source: item.raw.source as DataSource, importBatchId: batch.id } });
          await tx.importRow.update({ where: { id: item.row.id }, data: { status: ImportRowStatus.IMPORTED } });
        }
        await tx.importBatch.update({ where: { id: batch.id }, data: { status: "COMMITTED", committedAt: new Date() } });
      });
    }
    await writeAudit({ actorId: actor.userId, classId: batch.classId, entityType: "ImportBatch", entityId: batch.id, action: "COMMIT", after: { kind: batch.kind, rows: batch.totalRows } });
    return NextResponse.json({ ok: true, defaultPassword: batch.kind === "members" ? DEFAULT_PASSWORD : undefined });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "导入失败" }, { status: 400 }); }
}
