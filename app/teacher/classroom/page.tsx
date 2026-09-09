import { ClassroomLobby } from "@/components/classroom-lobby";
import { listClassrooms } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export default async function ClassroomPage() { return <ClassroomLobby teacher initial={await listClassrooms(true)} />; }
