import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import { ClassroomLobby } from "@/components/classroom-lobby";
const initial = { classes: [{ id: "class", name: "测试班" }], lessons: [
  { id: "active", className: "当前班", rehearsal: true, status: "RUNNING" as const, stage: 2, createdAt: "2026-09-15T00:00:00Z" },
  { id: "ended", className: "历史班", rehearsal: true, status: "ENDED" as const, stage: 5, createdAt: "2026-09-14T00:00:00Z" },
] };
describe("classroom lobby visibility", () => {
  it("shows only active classrooms to students even when supplied historical entries", () => {
    const html = renderToStaticMarkup(createElement(ClassroomLobby, { initial, teacher: false }));
    expect(html).toContain("/student/classroom/active");
    expect(html).not.toContain("/student/classroom/ended");
    expect(html).not.toContain("最近结束的课堂");
  });
  it("keeps ended classrooms available to teachers", () => {
    const html = renderToStaticMarkup(createElement(ClassroomLobby, { initial, teacher: true }));
    expect(html).toContain("/teacher/classroom/ended");
    expect(html).toContain("最近结束的课堂");
  });
  it("shows the waiting state when students only have ended classrooms", () => {
    const html = renderToStaticMarkup(createElement(ClassroomLobby, { initial: { ...initial, lessons: [initial.lessons[1]] }, teacher: false }));
    expect(html).toContain("等待老师开启课堂");
    expect(html).not.toContain("最近结束的课堂");
    expect(html).not.toContain("/student/classroom/ended");
  });
});
