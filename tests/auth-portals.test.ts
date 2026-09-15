import { beforeEach, describe, expect, it, vi } from "vitest";

const { jar, sessions, authSession } = vi.hoisted(() => {
  const jar = new Map<string, string>();
  const sessions = new Map<string, { user: { id: string; role: "STUDENT" | "TEACHER"; status: string }; expiresAt: Date }>();
  return { jar, sessions, authSession: { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() } };
});
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (key: string) => jar.has(key) ? { value: jar.get(key) } : undefined, set: (key: string, value: string) => jar.set(key, value), delete: (key: string) => jar.delete(key) }) }));
vi.mock("@/lib/db", () => ({ db: { authSession, user: { findUnique: async ({ where }: { where: { username: string } }) => ({ id: where.username, role: where.username === "teacher" ? "TEACHER" : "STUDENT", status: "ACTIVE", passwordHash: "hash" }) } } }));
vi.mock("bcryptjs", () => ({ default: { compare: async (password: string) => password === "correct" } }));

import { createHash } from "node:crypto";
import { authenticate, getCurrentActor, logout, requireActor, SESSION_COOKIE, SESSION_COOKIES } from "@/lib/server/auth";
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
function remember(token: string, role: "STUDENT" | "TEACHER") {
  sessions.set(hash(token), { user: { id: role.toLowerCase(), role, status: "ACTIVE" }, expiresAt: new Date(Date.now() + 60_000) });
}
beforeEach(() => {
  jar.clear(); sessions.clear(); vi.clearAllMocks();
  authSession.findUnique.mockImplementation(async ({ where }) => sessions.get(where.tokenHash) ?? null);
  authSession.create.mockImplementation(async ({ data }) => sessions.set(data.tokenHash, { user: { id: data.userId, role: data.userId === "teacher" ? "TEACHER" : "STUDENT", status: "ACTIVE" }, expiresAt: data.expiresAt }));
  authSession.deleteMany.mockImplementation(async ({ where }) => sessions.delete(where.tokenHash));
});

describe("portal session isolation", () => {
  it.each([["student", "teacher"], ["teacher", "student"]])("keeps both roles signed in after %s then %s login", async (first, second) => {
    for (const username of [first, second]) await authenticate(username, "correct", username === "teacher" ? "TEACHER" : "STUDENT");
    expect((await requireActor("STUDENT")).id).toBe("student");
    expect((await requireActor("TEACHER")).id).toBe("teacher");
    await authenticate("teacher", "correct", "TEACHER");
    expect((await requireActor("STUDENT")).id).toBe("student");
  });
  it.each(["STUDENT", "TEACHER"] as const)("signs out only %s", async role => {
    await authenticate("student", "correct", "STUDENT");
    await authenticate("teacher", "correct", "TEACHER");
    await logout(role);
    expect(await getCurrentActor(role)).toBeNull();
    expect(await getCurrentActor(role === "STUDENT" ? "TEACHER" : "STUDENT")).not.toBeNull();
  });
  it("does not use the other portal or a cookie with the wrong role", async () => {
    await authenticate("teacher", "correct", "TEACHER");
    jar.set(SESSION_COOKIES.STUDENT, jar.get(SESSION_COOKIES.TEACHER)!);
    await expect(requireActor("STUDENT")).rejects.toThrow("无权访问");
  });
  it("migrates legacy sessions without signing out the other role", async () => {
    remember("legacy", "STUDENT"); jar.set(SESSION_COOKIE, "legacy");
    await authenticate("teacher", "correct", "TEACHER");
    expect((await requireActor("STUDENT")).id).toBe("student");
    await logout("TEACHER");
    expect(await getCurrentActor("STUDENT")).not.toBeNull();
    await logout("STUDENT");
    expect(await getCurrentActor("STUDENT")).toBeNull();
    expect(jar.has(SESSION_COOKIE)).toBe(false);
  });
  it("rejects invalid credentials and expired sessions", async () => {
    expect(await authenticate("student", "wrong", "STUDENT")).toBeNull();
    expect(await authenticate("teacher", "correct", "STUDENT")).toBeNull();
    remember("expired", "STUDENT"); sessions.get(hash("expired"))!.expiresAt = new Date(0);
    jar.set(SESSION_COOKIES.STUDENT, "expired");
    expect(await getCurrentActor("STUDENT")).toBeNull();
  });
});
