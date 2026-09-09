import { ClassroomRoom } from "@/components/classroom-room";
import { Role } from "@/generated/prisma/client";
import { requirePageActor } from "@/lib/server/auth";
import { classroomSnapshot } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export default async function ClassroomScreen({ params }: { params: Promise<{ id: string }> }) { await requirePageActor(Role.TEACHER); const { id } = await params; return <ClassroomRoom key={id} view="screen" initial={await classroomSnapshot(id, "screen")} />; }
