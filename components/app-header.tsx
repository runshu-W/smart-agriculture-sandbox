"use client";
import { PLATFORM_NAME } from "@/lib/brand";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Home, Leaf, Sprout } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="app-header student-app-header">
      <Link className="brand" href="/student" aria-label="学生端首页">
        <span className="brand-mark"><Leaf size={21} strokeWidth={2.5} /></span>
        <span><b>{PLATFORM_NAME}</b><small>学生学习端</small></span>
      </Link>
      <nav aria-label="学生端导航">
        <Link className={pathname === "/student" ? "active" : ""} href="/student"><Home size={17} />项目首页</Link>
        <Link className={pathname.startsWith("/student/unit-") ? "active" : ""} href="/student"><Sprout size={17} />五单元学习</Link>
        <Link className={pathname.startsWith("/student/classroom") ? "active" : ""} href="/student/classroom"><GraduationCap size={17} />进入课堂</Link>
        <Link className={pathname.startsWith("/student/progress") ? "active" : ""} href="/student/progress"><GraduationCap size={17} />成长档案</Link>
      </nav>
    </header>
  );
}
