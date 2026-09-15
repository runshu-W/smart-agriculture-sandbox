import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  actor: vi.fn(), teacher: vi.fn(), transaction: vi.fn(),
  classRoom: { findUnique: vi.fn(), delete: vi.fn() },
  liveLesson: { findFirst: vi.fn() },
  importBatch: { findUnique: vi.fn(), delete: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ db: { ...mocks, $transaction: mocks.transaction } }));
vi.mock("@/lib/server/auth", () => ({
  requireActor: mocks.actor, requireTeacherContext: mocks.teacher,
  AuthorizationError: class AuthorizationError extends Error {},
}));
import { AuthorizationError } from "@/lib/server/auth";
import { DELETE as deleteClass } from "@/app/api/teacher/classes/[classId]/route";
import { DELETE as deleteBatch } from "@/app/api/teacher/imports/[batchId]/route";

const classContext = { params: Promise.resolve({ classId: "class-1" }) };
const batchContext = { params: Promise.resolve({ batchId: "batch-1" }) };
const request = (body?: unknown) => new Request("http://localhost/api", { method: "DELETE", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.actor.mockResolvedValue({ id: "teacher-1" });
  mocks.teacher.mockResolvedValue({ userId: "teacher-1" });
  mocks.transaction.mockImplementation(async fn => fn(mocks));
  mocks.classRoom.findUnique.mockResolvedValue({ id: "class-1", name: "测试班", academicYear: "2026-2027", semester: "第一学期", _count: { enrollments: 2 } });
  mocks.liveLesson.findFirst.mockResolvedValue(null);
  mocks.importBatch.findUnique.mockResolvedValue({ id: "batch-1", classId: "class-1" });
  mocks.importBatch.delete.mockResolvedValue({ fileName: "名单.csv", kind: "members", status: "COMMITTED", totalRows: 2 });
});

describe("class deletion", () => {
  it("rejects unauthorized teachers without deleting", async () => {
    mocks.teacher.mockRejectedValue(new AuthorizationError());
    expect((await deleteClass(request({ name: "测试班" }), classContext)).status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it.each([undefined, {}, { name: "错误名称" }])("requires the exact class name: %j", async body => {
    expect((await deleteClass(request(body), classContext)).status).toBe(400);
    expect(mocks.classRoom.delete).not.toHaveBeenCalled();
  });
  it("prevents deletion of a class with an unfinished lesson", async () => {
    mocks.liveLesson.findFirst.mockResolvedValue({ id: "running" });
    expect((await deleteClass(request({ name: "测试班" }), classContext)).status).toBe(409);
    expect(mocks.classRoom.delete).not.toHaveBeenCalled();
  });
  it("deletes a confirmed class and preserves a detached audit trail atomically", async () => {
    expect((await deleteClass(request({ name: "测试班" }), classContext)).status).toBe(200);
    expect(mocks.classRoom.delete).toHaveBeenCalledWith({ where: { id: "class-1" } });
    expect(mocks.auditLog.create.mock.calls[0][0].data).toMatchObject({ actorId: "teacher-1", entityId: "class-1", action: "DELETE" });
    expect(mocks.auditLog.create.mock.calls[0][0].data).not.toHaveProperty("classId");
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });
  it("reports a concurrently deleted class", async () => {
    mocks.classRoom.findUnique.mockResolvedValue(null);
    expect((await deleteClass(request({ name: "测试班" }), classContext)).status).toBe(404);
  });
});

describe("import history deletion", () => {
  it("requires a teacher login before looking up records", async () => {
    mocks.actor.mockRejectedValue(new AuthorizationError());
    expect((await deleteBatch(request(), batchContext)).status).toBe(403);
    expect(mocks.importBatch.findUnique).not.toHaveBeenCalled();
  });
  it("checks ownership of the batch class", async () => {
    mocks.teacher.mockRejectedValue(new AuthorizationError());
    expect((await deleteBatch(request(), batchContext)).status).toBe(403);
    expect(mocks.teacher).toHaveBeenCalledWith("class-1");
    expect(mocks.importBatch.delete).not.toHaveBeenCalled();
  });
  it.each(["REJECTED", "VALIDATED", "COMMITTED"])("deletes %s history without requesting deletion of imported data", async status => {
    mocks.importBatch.delete.mockResolvedValue({ fileName: "数据.csv", kind: "literacy", status, totalRows: 2 });
    expect((await deleteBatch(request(), batchContext)).status).toBe(200);
    expect(mocks.importBatch.delete).toHaveBeenCalledWith({ where: { id: "batch-1" } });
    expect(mocks.auditLog.create.mock.calls[0][0].data).toMatchObject({ action: "DELETE_RECORD", before: { status }, after: { importedDataRetained: true } });
  });
  it("reports a missing batch", async () => {
    mocks.importBatch.findUnique.mockResolvedValue(null);
    expect((await deleteBatch(request(), batchContext)).status).toBe(404);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("does not report success when the transaction fails", async () => {
    mocks.transaction.mockRejectedValue(new Error("database failure"));
    expect((await deleteBatch(request(), batchContext)).status).toBe(500);
  });
});
