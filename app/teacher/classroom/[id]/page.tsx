import { ClassroomRoom } from "@/components/classroom-room";
import { classroomSnapshot } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export default async function ClassroomPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ClassroomRoom key={id} view="teacher" initial={await classroomSnapshot(id, "teacher")} />; }
