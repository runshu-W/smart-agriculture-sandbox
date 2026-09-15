import { describe, expect, it } from "vitest";
import { DataSource } from "@/generated/prisma/client";
import { readImportFile, TEMPLATE_HEADERS, validateImportRows } from "@/lib/server/imports";

describe("external metric import validation", () => {
  it("accepts a registered traceable metric row", () => {
    const rows = validateImportRows("literacy", [TEMPLATE_HEADERS.metric, ["林小禾", "S2026001", "literacy.political_identity", 78, "2026-09-01", 1, "BASELINE", "TEACHER_UPLOAD"]], DataSource.TEACHER_UPLOAD);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ rowNumber: 2, status: "VALID" });
  });

  it("rejects unknown metrics, invalid dates and invalid phases together", () => {
    const rows = validateImportRows("teacher", [TEMPLATE_HEADERS.metric, ["林小禾", "", "unknown.metric", -1, "not-a-date", 1, "UNKNOWN", "OTHER"]], DataSource.TEACHER_UPLOAD);
    expect(rows[0].status).toBe("INVALID");
    expect(rows[0].errors).toEqual(expect.arrayContaining(["指标编码不在指标注册表中", "测评时间无效", "阶段应为 BASELINE、PERIODIC 或 CURRENT", "数据来源编码无效"]));
  });

  it("requires all member identity fields used by local authentication", () => {
    const rows = validateImportRows("members", [TEMPLATE_HEADERS.members, ["", "新同学"]], DataSource.TEACHER_UPLOAD);
    expect(rows[0].status).toBe("INVALID");
  });
});

describe("student roster import", () => {
  it("uses the student number as login and preserves leading zeros", () => {
    const result = validateImportRows("members", [["学号", "学生姓名"], ["001234", "张同学"]], DataSource.TEACHER_UPLOAD);
    expect(result[0]).toMatchObject({ status: "VALID", raw: { studentNo: "001234", username: "001234", displayName: "张同学" } });
  });
  it("accepts either column order and the previous four-column template", () => {
    const result = validateImportRows("members", [["学生姓名", "学号", "登录账号", "匿名昵称"], ["张同学", "S1234", "old-login", "青禾"]], DataSource.TEACHER_UPLOAD);
    expect(result[0]).toMatchObject({ status: "VALID", raw: { username: "S1234", nickname: "青禾" } });
  });
  it("rejects repeated student numbers and unusable login identities", () => {
    const result = validateImportRows("members", [TEMPLATE_HEADERS.members, ["001234", "甲"], ["001234", "乙"], ["1e+18", "丙"]], DataSource.TEACHER_UPLOAD);
    expect(result[1].errors).toContain("文件内学号重复");
    expect(result[2].status).toBe("INVALID");
  });
});

  it("round-trips a real Excel roster, including text student numbers", async () => {
    const writeXlsxFile = (await import("write-excel-file/node")).default;
    const buffer = await writeXlsxFile([["学号", "学生姓名"], ["001234", "张同学"]].map(row => row.map(value => ({ value, type: String })))).toBuffer();
    const file = new File([new Uint8Array(buffer)], "名单.xlsx");
    const parsed = await readImportFile(file);
    expect(validateImportRows("members", parsed.rows, DataSource.TEACHER_UPLOAD)[0]).toMatchObject({ status: "VALID", raw: { studentNo: "001234" } });
  });

it("rejects Excel numbers that have already lost student-number precision", () => {
  const rows = validateImportRows("members", [TEMPLATE_HEADERS.members, [123456789012345678, "张同学"]], DataSource.TEACHER_UPLOAD);
  expect(rows[0].status).toBe("INVALID");
  expect(rows[0].errors).toContain("学号数值精度不足，请将学号列设为文本后重新填写");
});
