import { PLATFORM_NAME } from "@/lib/brand";
import Link from "next/link";
import { Leaf, LogOut } from "lucide-react";
import { Role } from "@/generated/prisma/client";
import { TeacherMobileTitle, TeacherNav } from "@/components/teacher-nav";
import { requirePageActor } from "@/lib/server/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const actor = await requirePageActor(Role.TEACHER);
  return <div className="teacher-admin-shell"><aside className="teacher-sidebar"><Link className="teacher-brand" href="/teacher/dashboard"><span><Leaf /></span><div><b aria-label={PLATFORM_NAME}>{PLATFORM_NAME.slice(0, 4)}<br />{PLATFORM_NAME.slice(4)}</b><small>教师管理后台</small></div></Link><TeacherNav /><div className="teacher-profile"><span>{actor.displayName.slice(0, 1)}</span><div><b>{actor.displayName}</b><small>授课教师</small></div><form action="/api/auth/logout?portal=teacher" method="post"><button aria-label="退出登录" title="退出登录"><LogOut /></button></form></div></aside><div className="teacher-workspace"><header className="teacher-mobile-header"><Link href="/teacher/dashboard"><Leaf /></Link><TeacherMobileTitle /><div className="teacher-mobile-account"><span>{actor.displayName}</span><form action="/api/auth/logout?portal=teacher" method="post"><button aria-label="退出登录" title="退出登录"><LogOut /></button></form></div></header>{children}</div></div>;
}
