import { requirePageActor } from "@/lib/server/auth";
import { ClassroomRoom } from "@/components/classroom-room";
import { classroomSnapshot } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export default async function ClassroomPage({ params }: { params: Promise<{ id: string }> }) { await requirePageActor("STUDENT"); const { id } = await params; return <ClassroomRoom key={id} view="student" initial={await classroomSnapshot(id, "student")} />; }
