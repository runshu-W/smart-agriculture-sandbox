import { requirePageActor } from "@/lib/server/auth";
import { AppHeader } from "@/components/app-header";
import { ClassroomLobby } from "@/components/classroom-lobby";
import { listClassrooms } from "@/lib/server/classroom";
export const dynamic = "force-dynamic";
export default async function ClassroomPage() { await requirePageActor("STUDENT"); return <><AppHeader /><ClassroomLobby teacher={false} initial={await listClassrooms()} /></>; }
