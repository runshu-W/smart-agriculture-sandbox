import { Role } from "@/generated/prisma/client";
import { LogOut } from "lucide-react";
import { requirePageActor } from "@/lib/server/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const actor = await requirePageActor(Role.STUDENT);
  return <div className="student-portal-shell">{children}<aside className="student-session-tools" aria-label="学生账号"><span>{actor.displayName.slice(0, 1)}</span><b>{actor.displayName}</b><form action="/api/auth/logout?portal=student" method="post"><button aria-label="退出登录" title="退出登录"><LogOut /></button></form></aside></div>;
}
