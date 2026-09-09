import { PLATFORM_NAME } from "@/lib/brand";
import { Suspense } from "react";
import { Leaf, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentActor } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function StudentLoginPage() {
  const actor = await getCurrentActor();
  if (actor?.role === "STUDENT") redirect("/student");
  return <main className="login-page student-login-page"><section className="login-brand"><span><Leaf /></span><p>智慧农业 · 学生成长与生涯探索</p><h1 aria-label={PLATFORM_NAME}>{PLATFORM_NAME.slice(0, 4)}<br />{PLATFORM_NAME.slice(4)}</h1><ul><li>五单元沉浸式职业训练</li><li>个人成长证据持续积累</li><li>学习内容与隐私数据独立保护</li></ul></section><section className="login-panel"><div><span className="eyebrow"><ShieldCheck />学生学习门户</span><h2>学生端登录</h2><p>登录后进入项目首页，继续五单元学习旅程。</p><Suspense><LoginForm portal="student" /></Suspense><a className="portal-switch" href="/teacher-login">教师请进入教师管理后台</a></div></section></main>;
}
