import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { type Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/server/auth";

export type StudentIdentity = { studentNo: string; displayName: string; nickname?: string };
export async function prepareStudent(identity: StudentIdentity) {
  const password = randomBytes(10).toString("hex");
  return {
    user: { id: randomUUID(), username: identity.studentNo, studentNo: identity.studentNo, displayName: identity.displayName, nickname: identity.nickname || null, role: "STUDENT" as const, passwordHash: await hashPassword(password) },
    credential: { studentNo: identity.studentNo, displayName: identity.displayName, username: identity.studentNo, password },
  };
}
export async function insertStudents(tx: Prisma.TransactionClient, classId: string, prepared: Awaited<ReturnType<typeof prepareStudent>>[]) {
  const room = await tx.classRoom.findUnique({ where: { id: classId } });
  if (!room || room.isArchived) throw new Error("班级已归档，不能添加学生");
  await tx.user.createMany({ data: prepared.map(p => p.user) });
  await tx.enrollment.createMany({ data: prepared.map(p => ({ classId, userId: p.user.id })) });
  const units = await tx.unit.findMany({ select: { id: true } });
  if (units.length) await tx.scoreSnapshot.createMany({ data: prepared.flatMap(p => units.map(u => ({ userId: p.user.id, unitId: u.id }))) });
}
