import "server-only";
import { createHash } from "node:crypto";
import readXlsxFile from "read-excel-file/node";
import { DataSource, ImportRowStatus, ImportStatus, MetricPhase, type Prisma } from "@/generated/prisma/client";
import { METRIC_REGISTRY } from "@/lib/metrics";

export const IMPORT_KINDS = {
  members: { label: "班级成员", source: DataSource.TEACHER_UPLOAD },
  literacy: { label: "五维素养", source: DataSource.TEACHER_UPLOAD },
  xuexitong: { label: "学习通数据", source: DataSource.XUEXITONG },
  national: { label: "国家职教平台数据", source: DataSource.NATIONAL_PLATFORM },
  teacher: { label: "教师专项数据", source: DataSource.TEACHER_UPLOAD },
} as const;

export type ImportKind = keyof typeof IMPORT_KINDS;
export type ValidatedRow = { rowNumber: number; raw: Prisma.InputJsonValue; status: ImportRowStatus; errors: Prisma.InputJsonValue | undefined };

export const TEMPLATE_HEADERS = {
  members: ["学生姓名", "学号", "登录账号", "匿名昵称"],
  metric: ["学生姓名", "学号", "指标编码", "得分", "测评时间", "课次", "阶段", "数据来源"],
};

export const TEMPLATE_EXAMPLES = {
  members: ["张小禾", "20260001", "student001", "青禾01"],
  metric: ["张小禾", "20260001", "literacy.political_identity", 72, "2026-09-01", 1, "BASELINE", "TEACHER_UPLOAD"],
};

function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); return rows;
}

export async function readImportFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(buffer).digest("hex");
  if (file.name.toLowerCase().endsWith(".csv")) return { checksum, rows: parseCsv(buffer.toString("utf8")) as unknown[][] };
  if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error("仅支持 .xlsx 或 .csv 文件");
  const sheets = await readXlsxFile(buffer);
  return { checksum, rows: (sheets[0]?.data ?? []) as unknown[][] };
}

function text(value: unknown) { return value === null || value === undefined ? "" : String(value).trim(); }
function dateText(value: unknown) { return value instanceof Date ? value.toISOString() : text(value); }

export function validateImportRows(kind: ImportKind, rows: unknown[][], source: DataSource): ValidatedRow[] {
  if (rows.length < 2) return [];
  const expected = kind === "members" ? TEMPLATE_HEADERS.members : TEMPLATE_HEADERS.metric;
  const actual = rows[0].map(text);
  if (expected.some((header, index) => actual[index] !== header)) throw new Error(`表头不匹配，应为：${expected.join("、")}`);
  return rows.slice(1).map((cells, index) => {
    const errors: string[] = [];
    if (kind === "members") {
      const raw = { displayName: text(cells[0]), studentNo: text(cells[1]), username: text(cells[2]), nickname: text(cells[3]) };
      if (!raw.displayName) errors.push("缺少学生姓名"); if (!raw.studentNo) errors.push("缺少学号"); if (!raw.username) errors.push("缺少登录账号");
      return { rowNumber: index + 2, raw, status: errors.length ? ImportRowStatus.INVALID : ImportRowStatus.VALID, errors: errors.length ? errors : undefined };
    }
    const raw = { studentName: text(cells[0]), studentNo: text(cells[1]), metricKey: text(cells[2]), value: Number(cells[3]), measuredAt: dateText(cells[4]), lessonIndex: Number(cells[5]) || null, phase: text(cells[6]).toUpperCase(), source: text(cells[7]).toUpperCase() || source };
    if (!raw.studentName && !raw.studentNo) errors.push("学生姓名和学号至少填写一项");
    if (!(raw.metricKey in METRIC_REGISTRY)) errors.push("指标编码不在指标注册表中");
    if (!Number.isFinite(raw.value) || raw.value < 0 || raw.value > 10000) errors.push("得分不是有效数值");
    if (!raw.measuredAt || Number.isNaN(Date.parse(raw.measuredAt))) errors.push("测评时间无效");
    if (!(Object.values(MetricPhase) as string[]).includes(raw.phase)) errors.push("阶段应为 BASELINE、PERIODIC 或 CURRENT");
    if (!(Object.values(DataSource) as string[]).includes(raw.source)) errors.push("数据来源编码无效");
    return { rowNumber: index + 2, raw, status: errors.length ? ImportRowStatus.INVALID : ImportRowStatus.VALID, errors: errors.length ? errors : undefined };
  });
}

export function inferSource(kind: ImportKind, submitted?: string) {
  const fixed = IMPORT_KINDS[kind].source;
  return submitted && (Object.values(DataSource) as string[]).includes(submitted) ? submitted as DataSource : fixed;
}

export function inferStatus(rows: ValidatedRow[]) {
  return rows.length && rows.every((row) => row.status === ImportRowStatus.VALID) ? ImportStatus.VALIDATED : ImportStatus.REJECTED;
}
