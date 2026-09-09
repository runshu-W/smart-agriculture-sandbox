import { AppHeader } from "@/components/app-header";
import { ClassroomLobby } from "@/components/classroom-lobby";
import { listClassrooms } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export default async function ClassroomPage() { return <><AppHeader /><ClassroomLobby teacher={false} initial={await listClassrooms()} /></>; }
