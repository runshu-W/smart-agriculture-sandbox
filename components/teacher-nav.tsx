"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpenCheck, ChartNoAxesCombined, FileDown, LayoutDashboard, ListChecks, Upload, UsersRound } from "lucide-react";

const items = [
  ["/teacher/dashboard", "总览", LayoutDashboard],
  ["/teacher/classroom", "课堂控制台", BookOpenCheck],
  ["/teacher/classes", "班级与成员", UsersRound],
  ["/teacher/monitoring", "学情监控", ChartNoAxesCombined],
  ["/teacher/units", "单元分析", BookOpenCheck],
  ["/teacher/analytics", "数据分析", BarChart3],
  ["/teacher/content", "内容与题目", ListChecks],
  ["/teacher/imports", "数据导入", Upload],
  ["/teacher/reports", "报告中心", FileDown],
] as const;

export function TeacherNav() {
  const pathname = usePathname();
  const router = useRouter();
  return <nav className="teacher-nav" aria-label="教师管理导航">{items.map(([href, label, Icon]) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const prepare = () => { if (!active) router.prefetch(href); };
    return <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={href} key={href} prefetch={false} onFocus={prepare} onMouseEnter={prepare}><Icon /><span>{label}</span></Link>;
  })}</nav>;
}

export function TeacherMobileTitle() {
  const pathname = usePathname();
  return <span>{items.find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ?? "教师管理"}</span>;
}
