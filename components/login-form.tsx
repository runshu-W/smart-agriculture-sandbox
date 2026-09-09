"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

export function LoginForm({ portal }: { portal: "student" | "teacher" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(portal === "teacher" ? "teacher-demo" : "student-demo");
  const [password, setPassword] = useState("SmartAgri2026!");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password, portal }) });
      const data = await response.json().catch(() => ({})) as { error?: string; redirectTo?: string };
      if (!response.ok) throw new Error(data.error ?? "登录失败，请稍后重试");
      const requested = searchParams.get("next");
      const validRequested = portal === "teacher" ? requested?.startsWith("/teacher") : requested?.startsWith("/student");
      router.replace(validRequested && requested ? requested : data.redirectTo ?? (portal === "teacher" ? "/teacher/dashboard" : "/student"));
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "无法连接登录服务，请检查网络后重试");
      setPending(false);
    }
  }

  return <form className="login-form" onSubmit={submit}>
    <label><span><UserRound />账号</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
    <label><span><LockKeyhole />密码</span><input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {error && <p className="form-error">{error}</p>}
    <button className="primary-button" disabled={pending} type="submit">{pending ? "正在登录" : portal === "teacher" ? "进入教师管理后台" : "进入学生端"}<ArrowRight /></button>
    <div className="demo-accounts"><button type="button" onClick={() => { setUsername(portal === "teacher" ? "teacher-demo" : "student-demo"); setPassword("SmartAgri2026!"); }}>使用{portal === "teacher" ? "教师" : "学生"}演示账号</button></div>
  </form>;
}
