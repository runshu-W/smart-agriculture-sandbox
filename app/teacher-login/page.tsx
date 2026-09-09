import { PLATFORM_NAME } from "@/lib/brand";
import { Suspense } from "react";
import { ChartNoAxesCombined, Leaf, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentActor } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function TeacherLoginPage() {
  const actor = await getCurrentActor();
  if (actor?.role === "TEACHER") redirect("/teacher/dashboard");
  return <main className="login-page teacher-login-page"><section className="login-brand"><span><Leaf /></span><p>智慧农业 · 课堂互动与教学管理</p><h1 aria-label={PLATFORM_NAME}>{PLATFORM_NAME.slice(0, 4)}<br />{PLATFORM_NAME.slice(4)}</h1><ul><li>班级、成员与课程内容管理</li><li>五单元学情分析与学生钻取</li><li>数据导入、报告生成与权限审计</li></ul></section><section className="login-panel"><div><span className="eyebrow"><ChartNoAxesCombined /><ShieldCheck />教师管理门户</span><h2>教师端登录</h2><p>登录后直接进入教师管理后台，不进入学生项目首页。</p><Suspense><LoginForm portal="teacher" /></Suspense><a className="portal-switch" href="/student-login">学生请返回学生学习门户</a></div></section></main>;
}
