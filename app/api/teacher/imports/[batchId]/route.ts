import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AuthorizationError, requireActor, requireTeacherContext } from "@/lib/server/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  try {
    await requireActor("TEACHER");
    const { batchId } = await params;
    const batch = await db.importBatch.findUnique({ where: { id: batchId } });
    if (!batch) return NextResponse.json({ error: "导入记录不存在或已删除" }, { status: 404 });
    const actor = await requireTeacherContext(batch.classId);
    await db.$transaction(async (tx) => {
      // ImportRow cascades; MetricObservation.importBatchId becomes null.
      const deleted = await tx.importBatch.delete({ where: { id: batchId } });
      await tx.auditLog.create({ data: { actorId: actor.userId, classId: batch.classId, entityType: "ImportBatch", entityId: batchId, action: "DELETE_RECORD", before: { fileName: deleted.fileName, kind: deleted.kind, status: deleted.status, totalRows: deleted.totalRows }, after: { importedDataRetained: true } } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof AuthorizationError ? error.message : "删除导入记录失败，请刷新后重试" }, { status: error instanceof AuthorizationError ? 403 : 500 });
  }
}
