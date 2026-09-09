import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/auth";

const schema = z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(8).max(128), portal: z.enum(["student", "teacher"]) });

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "请输入有效账号和密码" }, { status: 400 });
  const expectedRole = input.data.portal === "teacher" ? "TEACHER" : "STUDENT";
  const user = await authenticate(input.data.username, input.data.password, expectedRole);
  if (!user) return NextResponse.json({ error: "账号或密码不正确" }, { status: 401 });
  return NextResponse.json({ role: user.role, redirectTo: input.data.portal === "teacher" ? "/teacher/dashboard" : "/student" });
}
