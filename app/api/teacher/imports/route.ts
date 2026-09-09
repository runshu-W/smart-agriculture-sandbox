import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTeacherContext } from "@/lib/server/auth";
import { IMPORT_KINDS, inferSource, inferStatus, readImportFile, validateImportRows, type ImportKind } from "@/lib/server/imports";

export async function POST(request: Request) {
  try {
    const form = await request.formData(); const classId = String(form.get("classId") ?? ""); const actor = await requireTeacherContext(classId);
    const kind = String(form.get("kind") ?? "") as ImportKind; const file = form.get("file");
    if (!(kind in IMPORT_KINDS)) return NextResponse.json({ error: "导入类型无效" }, { status: 400 });
    if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "请选择不超过 5MB 的文件" }, { status: 400 });
    const source = inferSource(kind, String(form.get("source") ?? "")); const parsed = await readImportFile(file);
    const duplicate = await db.importBatch.findUnique({ where: { classId_checksum: { classId, checksum: parsed.checksum } } });
    if (duplicate) return NextResponse.json({ error: `相同文件已于 ${duplicate.createdAt.toLocaleString("zh-CN")} 上传`, batchId: duplicate.id }, { status: 409 });
    const rows = validateImportRows(kind, parsed.rows, source); const status = inferStatus(rows); const invalid = rows.filter((row) => row.status === "INVALID").length;
    const batch = await db.importBatch.create({ data: { classId, createdById: actor.userId, kind, source, fileName: file.name, checksum: parsed.checksum, status, totalRows: rows.length, validRows: rows.length - invalid, invalidRows: invalid, errors: invalid ? { message: "存在无效行，修正后重新上传" } : undefined, rows: { create: rows } }, include: { rows: { orderBy: { rowNumber: "asc" } } } });
    return NextResponse.json(batch, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "校验失败" }, { status: 400 }); }
}
