import { NextResponse } from "next/server";
import { z } from "zod";
import { ImportRowStatus, MetricPhase, type DataSource } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireTeacherContext } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";

const schema = z.object({ overwrite: z.boolean().default(false) });
import { insertStudents, prepareStudent, type StudentIdentity } from "@/lib/server/student-accounts";

export async function POST(request: Request, context: { params: Promise<{ batchId: string }> }) {
  try {
    const { batchId } = await context.params; const input = schema.parse(await request.json().catch(() => ({})));
    const batch = await db.importBatch.findUnique({ where: { id: batchId }, include: { rows: { orderBy: { rowNumber: "asc" } } } });
    if (!batch) return NextResponse.json({ error: "批次不存在" }, { status: 404 });
    const actor = await requireTeacherContext(batch.classId);
    if (batch.status !== "VALIDATED" || batch.invalidRows > 0) return NextResponse.json({ error: "该批次未通过完整校验" }, { status: 409 });
    if (batch.kind === "members") {
      const identities = batch.rows.map(row => row.raw as StudentIdentity);
      const numbers = identities.map(i => i.studentNo);
      if (identities.length > 200 || new Set(numbers).size !== numbers.length) throw new Error("学号重复或超过每批 200 人上限");
      const existing = await db.user.findFirst({ where: { OR: [{ username: { in: numbers } }, { studentNo: { in: numbers } }] } });
      if (existing) return NextResponse.json({ error: "名单中有已存在的学号或账号，请修正后重新上传" }, { status: 409 });
      const prepared: Awaited<ReturnType<typeof prepareStudent>>[] = [];
      for (const identity of identities) prepared.push(await prepareStudent(identity));
      await db.$transaction(async tx => {
        const claimed = await tx.importBatch.updateMany({ where: { id: batch.id, status: "VALIDATED" }, data: { status: "COMMITTED", committedAt: new Date() } });
        if (claimed.count !== 1) throw new Error("该批次已导入，请勿重复提交");
        await insertStudents(tx, batch.classId, prepared);
        await tx.importRow.updateMany({ where: { batchId: batch.id }, data: { status: "IMPORTED" } });
        await tx.auditLog.create({ data: { actorId: actor.userId, classId: batch.classId, entityType: "ImportBatch", entityId: batch.id, action: "COMMIT", after: { kind: batch.kind, rows: batch.totalRows } } });
      }, { timeout: 20000 });
      return NextResponse.json({ ok: true, credentials: prepared.map(p => p.credential) }, { headers: { "Cache-Control": "no-store" } });
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
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "导入失败" }, { status: 400 }); }
}
