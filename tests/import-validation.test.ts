import { describe, expect, it } from "vitest";
import { DataSource } from "@/generated/prisma/client";
import { TEMPLATE_HEADERS, validateImportRows } from "@/lib/server/imports";

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
    const rows = validateImportRows("members", [TEMPLATE_HEADERS.members, ["新同学", "", "", "青禾"]], DataSource.TEACHER_UPLOAD);
    expect(rows[0].errors).toEqual(expect.arrayContaining(["缺少学号", "缺少登录账号"]));
  });
});
