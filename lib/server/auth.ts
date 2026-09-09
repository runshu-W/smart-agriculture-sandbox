import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "smart-agri-session";
const SESSION_DAYS = 7;

export class AuthorizationError extends Error {
  constructor(message = "无权访问") {
    super(message);
    this.name = "AuthorizationError";
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticate(username: string, password: string, expectedRole?: Role) {
  const user = await db.user.findUnique({ where: { username } });
  if (!user || user.status !== "ACTIVE" || (expectedRole && user.role !== expectedRole) || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return null;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();
  const previousToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (previousToken) await db.authSession.deleteMany({ where: { tokenHash: hashToken(previousToken) } });
  await db.authSession.create({ data: { tokenHash: hashToken(token), userId: user.id, expiresAt } });
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return { id: user.id, role: user.role };
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await db.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}

export const getCurrentActor = cache(async function getCurrentActor() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          enrollments: { where: { status: "ACTIVE", classRoom: { isArchived: false } }, include: { classRoom: true } },
          taughtClasses: { include: { classRoom: true } },
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") return null;
  return session.user;
});

export async function requireActor(role?: Role) {
  const actor = await getCurrentActor();
  if (!actor || (role && actor.role !== role)) throw new AuthorizationError();
  return actor;
}

export async function requirePageActor(role: Role) {
  const actor = await getCurrentActor();
  if (!actor) redirect(`${role === Role.TEACHER ? "/teacher-login" : "/student-login"}?next=${role === Role.TEACHER ? "/teacher/dashboard" : "/student"}`);
  if (actor.role !== role) redirect(actor.role === Role.TEACHER ? "/teacher/dashboard" : "/student");
  return actor;
}

export async function requireStudentContext() {
  const actor = await requireActor(Role.STUDENT);
  const enrollment = actor.enrollments[0];
  if (!enrollment) throw new AuthorizationError("学生尚未加入班级");
  return { userId: actor.id, classId: enrollment.classId, user: actor, classRoom: enrollment.classRoom };
}

export async function requireTeacherContext(classId?: string) {
  const actor = await requireActor(Role.TEACHER);
  let taught = classId
    ? await db.teacherClass.findUnique({ where: { teacherId_classId: { teacherId: actor.id, classId } }, include: { classRoom: true } })
    : await db.teacherClass.findFirst({ where: { teacherId: actor.id, classRoom: { isArchived: false } }, include: { classRoom: true }, orderBy: { createdAt: "asc" } });
  if (!taught && !classId) taught = await db.teacherClass.findFirst({ where: { teacherId: actor.id }, include: { classRoom: true }, orderBy: { createdAt: "desc" } });
  if (!taught) throw new AuthorizationError("教师未获该班级授权");
  return { userId: actor.id, classId: taught.classId, user: actor, classRoom: taught.classRoom };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
