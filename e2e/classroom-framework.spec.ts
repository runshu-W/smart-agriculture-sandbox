import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
test.use({ channel: process.env.PLAYWRIGHT_CHANNEL });
test("framework rings, retries, class statistics and private progress stay synchronized", async ({ browser, baseURL }) => {
  test.setTimeout(120000);
  const output = process.env.CLASSROOM_QA_OUTPUT || join(tmpdir(), "classroom-framework"); await mkdir(output, { recursive: true });
  const [teacher, first, second, stranger] = await Promise.all(Array.from({ length: 4 }, (_, index) => browser.newContext({ baseURL, viewport: index === 2 ? { width: 390, height: 844 } : { width: 1440, height: 1080 }, hasTouch: index === 2 })));
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let classId = "", id = "";
  try {
    const login = async (context: typeof teacher, username: string, portal = "student") => expect((await context.request.post("/api/auth/login", { data: { username, portal, password: "SmartAgri2026!" } })).status()).toBe(200);
    await login(teacher, "teacher-demo", "teacher"); const stamp = Date.now();
    const created = await teacher.request.post("/api/teacher/classes", { data: { name: `三层变化课堂 ${stamp.toString().slice(-5)}`, academicYear: "2026-2027", semester: "第一学期" } }); expect(created.status()).toBe(201); classId = (await created.json()).id;
    for (let index = 0; index < 2; index++) expect((await teacher.request.post(`/api/teacher/classes/${classId}/members`, { data: { displayName: index ? "葛同学" : "陈同学", username: `framework_${stamp}_${index}`, studentNo: `F${stamp}${index}` } })).status()).toBe(201);
    await Promise.all([login(first, `framework_${stamp}_0`), login(second, `framework_${stamp}_1`), login(stranger, "student-demo")]);
    id = (await (await teacher.request.post("/api/classroom", { data: { classId, rehearsal: true } })).json()).id;
    const api = () => `/api/classroom/${id}`;
    const snapshot = async (context = teacher, view = "teacher") => (await context.request.get(`${api()}?view=${view}`)).json();
    const command = async (action: string, extra = {}) => expect((await teacher.request.patch(api(), { data: { action, version: (await snapshot()).version, ...extra } })).status()).toBe(200);
    const map = (context: typeof first, event: string, layer: string, attemptId = crypto.randomUUID()) => context.request.post(`${api()}/framework`, { data: { attemptId, event, layer } });
    for (const context of [first, second]) await context.request.post(api(), { data: { action: "join" } });
    expect((await map(first, "ai", "macro")).status()).toBe(409);
    await command("start"); await command("stage", { stage: 3 });
    const [t, s, m, screen] = await Promise.all([teacher.newPage(), first.newPage(), second.newPage(), teacher.newPage()]);
    const errors: string[] = []; for (const page of [t, s, m, screen]) { page.setDefaultTimeout(15000); page.on("pageerror", error => errors.push(error.message)); }
    await screen.setViewportSize({ width: 1920, height: 1080 });
    await Promise.all([t.goto(`/teacher/classroom/${id}`), s.goto(`/student/classroom/${id}`), m.goto(`/student/classroom/${id}`), screen.goto(`/classroom/${id}/screen`)]);
    await expect(s).toHaveURL(new RegExp(`/student/classroom/${id}`)); await expect(s).toHaveTitle(/农情润心虚拟仿真沙盘/);
    await expect(s.getByTestId("current-stage")).toHaveText("三层变化识别");
    await expect(screen.getByTestId("framework-stat-ai")).toContainText("暂无作答");
    expect((await map(stranger, "ai", "macro")).status()).toBe(403); expect((await map(teacher, "ai", "macro")).status()).toBe(403);
    expect((await map(first, "missing", "macro")).status()).toBe(400);
    expect((await first.request.post(`${api()}/framework`, { data: { attemptId: crypto.randomUUID(), event: "ai", layer: "macro", correct: true, studentId: "other" } })).status()).toBe(400);
    await s.getByRole("button", { name: "开启映射反馈音", exact: true }).click(); await expect(s.getByRole("button", { name: "关闭映射反馈音", exact: true })).toHaveAttribute("aria-pressed", "true");
    // Keyboard selects the inner circle for an intentionally incorrect first attempt.
    const inner = s.getByRole("button", { name: "映射到自身条件变化", exact: true }); await expect(inner).toHaveAttribute("aria-disabled", "false"); await inner.focus(); await inner.press("Enter");
    await s.getByRole("button", { name: "确认映射", exact: true }).click(); await expect(s.locator(".framework-feedback")).toContainText("再想想");
    await expect(screen.getByTestId("framework-stat-ai")).toContainText("已答对 0 / 已尝试 1 人");
    await s.screenshot({ path: join(output, "第五步-映射重试.png"), fullPage: true });
    await command("pause"); await expect(s.getByRole("button", { name: "确认映射", exact: true })).toBeDisabled(); expect((await map(first, "ai", "macro")).status()).toBe(409);
    await command("resume");
    // Click a visible point in the annulus, not the overlapping center of its SVG bounding box.
    const outer = s.getByRole("button", { name: "映射到宏观环境变化", exact: true }); await outer.click({ position: { x: (await outer.boundingBox())!.width / 2, y: 26 } });
    await s.getByRole("button", { name: "确认映射", exact: true }).click(); await expect(s.locator(".framework-feedback")).toContainText("映射正确");
    await expect(s.getByTestId("framework-progress")).toHaveText("1 / 3");
    await s.reload(); await expect(s.getByTestId("framework-progress")).toHaveText("1 / 3");
    expect((await map(first, "ai", "self")).status()).toBe(200); expect((await snapshot(first, "student")).ownFramework.ai.attempts).toBe(2);
    await s.getByRole("button", { name: "继续下一事件", exact: true }).click();
    await s.getByRole("button", { name: "映射到微观环境变化", exact: true }).focus(); await s.keyboard.press("Space"); await s.getByRole("button", { name: "确认映射", exact: true }).click();
    await expect(s.getByTestId("framework-progress")).toHaveText("2 / 3");
    await s.getByRole("button", { name: "继续下一事件", exact: true }).click(); await s.getByRole("button", { name: "映射到自身条件变化", exact: true }).click(); await s.getByRole("button", { name: "确认映射", exact: true }).click();
    await expect(s.getByTestId("framework-progress")).toHaveText("3 / 3"); await expect(s.getByTestId("framework-mentor")).toContainText("三题全对 · 框架已点亮"); await expect(s.locator(".framework-ring.correct")).toHaveCount(3);
    await s.screenshot({ path: join(output, "第五步-三层框架完成.png"), fullPage: true });
    const retryId = crypto.randomUUID(); const results = await Promise.all([map(second, "ai", "self", retryId), map(second, "ai", "self", retryId)]); expect(results.map(response => response.status())).toEqual([200, 200]);
    expect((await map(second, "ai", "micro", retryId)).status()).toBe(409);
    await expect(m.locator(".framework-feedback")).toContainText("再想想"); await m.reload();
    await expect(screen.getByTestId("framework-completed")).toHaveText("1"); await expect(screen.getByTestId("framework-stat-ai")).toContainText("50%");
    const archive = await (await first.request.get(`${api()}/archive?format=json`)).json(); expect(archive.personal.framework.completedMs).toBeGreaterThan(0); expect(archive.personal.framework.retries.ai).toBe(1);
    const stats = (await snapshot()).frameworkStats; expect(stats.events[0]).toMatchObject({ attempted: 2, solved: 1, firstCorrect: 0, masteryRate: 50, firstCorrectRate: 0 });
    const publicData = await snapshot(teacher, "screen"); expect(publicData.ownFramework).toBeUndefined(); expect(publicData.roster).toBeUndefined(); expect((await snapshot()).ownFramework).toBeUndefined(); expect((await snapshot(first, "student")).frameworkStats).toBeUndefined();
    const mobileOuter = m.getByRole("button", { name: "映射到宏观环境变化", exact: true }); await mobileOuter.tap({ position: { x: (await mobileOuter.boundingBox())!.width / 2, y: 24 } });
    await m.getByRole("button", { name: "确认映射", exact: true }).tap(); await expect(m.getByTestId("framework-progress")).toHaveText("1 / 3"); await expect(m.getByRole("button", { name: "继续下一事件", exact: true })).toBeEnabled();
    await expect(screen.getByTestId("framework-stat-ai")).toContainText("已答对 2 / 已尝试 2 人");
    expect(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await m.screenshot({ path: join(output, "第五步-三层框架手机.png"), fullPage: true });
    await screen.screenshot({ path: join(output, "第五步-教师大屏.png"), fullPage: true });
    expect(await screen.getByTestId("framework-mentor").evaluate(element => element.getBoundingClientRect().bottom <= innerHeight)).toBe(true);
    await second.setOffline(true); await m.getByRole("button", { name: "继续下一事件", exact: true }).tap(); await expect(m.getByRole("button", { name: "确认映射", exact: true })).toBeDisabled(); await second.setOffline(false); await m.reload(); await expect(m.getByTestId("framework-progress")).toHaveText("1 / 3");
    await command("reset", { minutes: 8 }); expect((await snapshot(first, "student")).ownFramework.ai.attempts).toBe(2);
    await command("stage", { stage: 4 }); expect((await map(second, "farmer", "micro")).status()).toBe(409);
    await s.getByRole("button", { name: "查看本次框架学习", exact: true }).click(); await expect(s.getByTestId("framework-progress")).toHaveText("3 / 3");
    await command("end"); expect((await map(second, "farmer", "micro")).status()).toBe(409); expect((await map(second, "ai", "self", retryId)).status()).toBe(200);
    const events = await pool.query('SELECT "source", "payload" FROM "LearningEvent" WHERE "liveLessonId"=$1 AND "eventType"=\'FRAMEWORK_MAPPED\'', [id]); expect(events.rows).toHaveLength(6); expect(events.rows.every(row => row.source === "classroom-rehearsal" && row.payload.schemaVersion === 1)).toBe(true);
    // A fresh formal classroom has no prior progress and records the proper source.
    id = (await (await teacher.request.post("/api/classroom", { data: { classId, rehearsal: false } })).json()).id;
    await first.request.post(api(), { data: { action: "join" } }); expect((await snapshot(first, "student")).ownFramework).toEqual({}); await command("start"); await command("stage", { stage: 3 }); expect((await map(first, "ai", "macro")).status()).toBe(200);
    const formal = await pool.query('SELECT "source", "payload" FROM "LearningEvent" WHERE "liveLessonId"=$1 AND "eventType"=\'FRAMEWORK_MAPPED\'', [id]); expect(formal.rows[0].source).toBe("classroom"); expect(formal.rows[0].payload.rehearsal).toBe(false);
    expect(errors).toEqual([]);
  } finally {
    if (id) { const state = await (await teacher.request.get(`/api/classroom/${id}?view=teacher`)).json(); if (state.version && state.status !== "ENDED") await teacher.request.patch(`/api/classroom/${id}`, { data: { action: "end", version: state.version } }); }
    if (classId) await teacher.request.patch(`/api/teacher/classes/${classId}`, { data: { isArchived: true } });
    await Promise.all([teacher.close(), first.close(), second.close(), stranger.close()]); await pool.end();
  }
});
