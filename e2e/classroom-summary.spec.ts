import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
test.use({ channel: process.env.PLAYWRIGHT_CHANNEL });
test("impact summary handles missing uploads and paths persist per student", async ({ browser, baseURL }) => {
  test.setTimeout(150000);
  const output = process.env.CLASSROOM_QA_OUTPUT || join(tmpdir(), "classroom-summary"); await mkdir(output, { recursive: true });
  const [teacher, first, second, stranger] = await Promise.all(Array.from({ length: 4 }, () => browser.newContext({ baseURL, viewport: { width: 1440, height: 1080 } })));
  const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
  let classId = "", id = "";
  try {
    const login = async (context: typeof teacher, username: string, portal = "student") => expect((await context.request.post("/api/auth/login", { data: { username, portal, password: "SmartAgri2026!" } })).status()).toBe(200);
    await login(teacher, "teacher-demo", "teacher"); const stamp = Date.now();
    const create = await teacher.request.post("/api/teacher/classes", { data: { name: `课堂观察 ${stamp.toString().slice(-5)}`, academicYear: "2026-2027", semester: "第一学期" } }); expect(create.status()).toBe(201); classId = (await create.json()).id;
    for (let i = 0; i < 2; i++) expect((await teacher.request.post(`/api/teacher/classes/${classId}/members`, { data: { displayName: i ? "葛同学" : "陈同学", username: `summary_${stamp}_${i}`, studentNo: `S${stamp}${i}` } })).status()).toBe(201);
    await Promise.all([login(first, `summary_${stamp}_0`), login(second, `summary_${stamp}_1`), login(stranger, "student-demo")]);
    const createLesson = await teacher.request.post("/api/classroom", { data: { classId, rehearsal: true } }); expect(createLesson.status()).toBe(200); id = (await createLesson.json()).id;
    const api = `/api/classroom/${id}`;
    const snapshot = async () => (await teacher.request.get(`${api}?view=teacher`)).json();
    const command = async (action: string, extra = {}) => { const state = await snapshot(); const response = await teacher.request.patch(api, { data: { action, version: state.version, ...extra } }); expect(response.status()).toBe(200); };
    const stats = async () => (await teacher.request.get(`${api}/impact?view=teacher`)).json();
    const [t, s, m, screen] = await Promise.all([teacher.newPage(), first.newPage(), second.newPage(), teacher.newPage()]);
    const errors: string[] = [];
    for (const page of [t, s, m, screen]) page.on("pageerror", error => errors.push(error.message));
    await screen.setViewportSize({ width: 1920, height: 1080 });
    await Promise.all([t.goto(`/teacher/classroom/${id}`), s.goto(`/student/classroom/${id}`), m.goto(`/student/classroom/${id}`), screen.goto(`/classroom/${id}/screen`)]);
    await s.getByRole("button", { name: "加入本次课堂" }).click(); await m.getByRole("button", { name: "加入本次课堂" }).click();
    expect((await first.request.post(`${api}/paths`, { data: { path: "transform" } })).status()).toBe(409);
    await command("start"); await command("impact-start");
    expect((await teacher.request.patch(api, { data: { action: "impact-results", version: (await snapshot()).version } })).status()).toBe(409);
    // Advance only this disposable fixture. The authored real-time sequence has its own browser test.
    if (pool) await pool.query('UPDATE "LiveLesson" SET "impactRunningSince"=NOW()-INTERVAL \'40 seconds\' WHERE "id"=$1', [id]);
    else await s.waitForTimeout(40000);
    await expect(s.getByTestId("impact-scene")).toHaveAttribute("data-moment", "observing", { timeout: 10000 });
    const batch = { batchId: crypto.randomUUID(), observations: [{ kind: "view", region: "news", atMs: 27000, durationMs: 0 }, { kind: "view", region: "farmer", atMs: 29000, durationMs: 0 }, { kind: "dwell", region: "news", atMs: 31000, durationMs: 4000 }] };
    expect((await first.request.post(`${api}/impact`, { data: batch })).status()).toBe(200);
    await second.route("**/api/classroom/*/impact", route => route.abort());
    await t.getByRole("button", { name: "查看班级数据", exact: true }).click(); await t.getByRole("dialog").getByRole("button", { name: "确认", exact: true }).click();
    await expect(t.getByRole("heading", { name: "刚才，大家关注了什么？" })).toBeVisible();
    await expect.poll(async () => (await stats()).uploaded, { timeout: 12000 }).toBe(1);
    expect(await stats()).toMatchObject({ total: 2, missing: 1, samples: 1, waitRate: 0 });
    await expect(screen.getByTestId("impact-uploaded")).toHaveText("1 / 2");
    const publicData = await (await teacher.request.get(`${api}/impact?view=screen`)).json(); expect(publicData.details).toBeUndefined();
    expect((await first.request.get(`${api}/impact?view=teacher`)).status()).toBe(403);
    expect((await stranger.request.get(`${api}/impact?view=screen`)).status()).toBe(403);
    await second.unroute("**/api/classroom/*/impact");
    await expect.poll(async () => (await stats()).uploaded, { timeout: 12000 }).toBe(2);
    await expect(screen.getByTestId("impact-uploaded")).toHaveText("2 / 2");
    expect(await stats()).toMatchObject({ total: 2, missing: 0, samples: 2, waitRate: 50 });
    expect((await stats()).top[0]).toMatchObject({ region: "news", count: 1, percent: 50 });
    const cutoff = (await snapshot()).impact.elapsedMs;
    await s.locator(".impact-news").click(); await s.getByRole("button", { name: "继续观察", exact: true }).click();
    await t.getByRole("button", { name: "查看陈同学观察明细" }).click();
    await expect(t.getByRole("region", { name: "陈同学的观察明细" })).toContainText("AI上线新闻 → 张大叔来电");
    expect(await screen.locator(".summary-guide").evaluate(element => element.getBoundingClientRect().bottom <= innerHeight)).toBe(true);
    await screen.screenshot({ path: join(output, "第三步-班级统计大屏.png") }); await t.screenshot({ path: join(output, "第三步-教师个人明细.png"), fullPage: true });
    await t.reload(); await expect(t.getByRole("heading", { name: "刚才，大家关注了什么？" })).toBeVisible();
    await t.getByRole("button", { name: "返回情境回看" }).click(); await expect(screen.getByTestId("impact-audience")).toHaveText("200");
    expect((await snapshot()).impact.elapsedMs).toBe(cutoff);
    await command("stage", { stage: 1 });
    await expect(s.getByTestId("current-stage")).toHaveText("路径参考");
    for (const title of ["转型", "坚守", "升级"]) { await s.getByRole("button", { name: `阅读${title}路径`, exact: true }).click(); await expect(s.locator(".path-reference-detail")).toContainText("需要考虑的风险"); await s.getByRole("button", { name: "标记这条路径已阅读" }).click(); await expect(s.getByRole("button", { name: "这条路径已阅读" })).toBeDisabled(); }
    await expect(s.getByTestId("paths-progress")).toHaveText("已阅读 3 / 3 条路径");
    await expect(screen.getByTestId("paths-progress")).toHaveText("1 / 2 人已阅读全部路径");
    expect(await screen.locator(".path-mentor").evaluate(element => element.getBoundingClientRect().bottom <= innerHeight)).toBe(true);
    await s.reload(); await expect(s.getByTestId("paths-progress")).toHaveText("已阅读 3 / 3 条路径");
    expect((await first.request.post(`${api}/paths`, { data: { path: "upgrade" } })).status()).toBe(200);
    expect((await stranger.request.post(`${api}/paths`, { data: { path: "upgrade" } })).status()).toBe(403);
    await m.setViewportSize({ width: 390, height: 844 }); await m.getByRole("button", { name: "阅读转型路径" }).click(); await m.getByRole("button", { name: "标记这条路径已阅读" }).click();
    await expect(m.getByTestId("paths-progress")).toHaveText("已阅读 1 / 3 条路径");
    expect(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await m.screenshot({ path: join(output, "第三步-路径参考手机.png"), fullPage: true }); await screen.screenshot({ path: join(output, "第三步-路径参考大屏.png") });
    await command("stage", { stage: 2 }); await expect(m.getByText("先补读三条参考路径，再参加后续决策。")).toBeVisible();
    if (pool) { const records = await pool.query('SELECT "userId", COUNT(*)::int AS count FROM "LearningEvent" WHERE "liveLessonId"=$1 AND "eventType"=\'PATH_REFERENCE_READ\' GROUP BY "userId"', [id]); expect(records.rows.map(row => row.count).sort()).toEqual([1, 3]); }
    await command("end"); expect((await first.request.post(`${api}/paths`, { data: { path: "stay" } })).status()).toBe(409);
    expect(errors).toEqual([]);
  } finally {
    if (id) { const state = await (await teacher.request.get(`/api/classroom/${id}?view=teacher`)).json(); if (state.version && state.status !== "ENDED") await teacher.request.patch(`/api/classroom/${id}`, { data: { action: "end", version: state.version } }); }
    if (classId) await teacher.request.patch(`/api/teacher/classes/${classId}`, { data: { isArchived: true } });
    await Promise.all([teacher.close(), first.close(), second.close(), stranger.close()]); await pool?.end();
  }
});
