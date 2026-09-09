import { NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { requireTeacherContext } from "@/lib/server/auth";
import { IMPORT_KINDS, TEMPLATE_EXAMPLES, TEMPLATE_HEADERS, type ImportKind } from "@/lib/server/imports";

export async function GET(_request: Request, context: { params: Promise<{ kind: string }> }) {
  try {
    await requireTeacherContext();
    const { kind } = await context.params;
    if (!(kind in IMPORT_KINDS)) return NextResponse.json({ error: "模板不存在" }, { status: 404 });
    const importKind = kind as ImportKind; const member = importKind === "members";
    const rows = [member ? TEMPLATE_HEADERS.members : TEMPLATE_HEADERS.metric, member ? TEMPLATE_EXAMPLES.members : TEMPLATE_EXAMPLES.metric].map((row, rowIndex) => row.map((value) => ({ value, fontWeight: rowIndex === 0 ? "bold" as const : undefined, backgroundColor: rowIndex === 0 ? "#E6F2EB" : undefined })));
    const buffer = await (await writeXlsxFile(rows, { columns: (member ? [22, 18, 22, 20] : [18, 16, 34, 12, 20, 10, 16, 24]).map((width) => ({ width })) })).toBuffer();
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${IMPORT_KINDS[importKind].label}模板.xlsx`)}` } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "下载失败" }, { status: 403 }); }
}
