import { PLATFORM_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import "./globals.css";
import "./classroom.css";
import "./classroom-impact.css";
import "./classroom-summary.css";
import "./classroom-decision.css";
import "./classroom-framework.css";
import "./classroom-completion.css";

export const metadata: Metadata = {
  title: PLATFORM_NAME,
  description: `${PLATFORM_NAME}，包含学生五单元学习、同步课堂、成长档案与教师教学管理。`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

