import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

function json(value: unknown) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function writeAudit(input: { actorId: string; classId?: string; entityType: string; entityId: string; action: string; before?: unknown; after?: unknown }) {
  return db.auditLog.create({ data: { actorId: input.actorId, classId: input.classId, entityType: input.entityType, entityId: input.entityId, action: input.action, before: json(input.before), after: json(input.after) } });
}
