import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
test.use({ channel: process.env.PLAYWRIGHT_CHANNEL });
test("change map collaboration, offline recovery, immutable vote and private archives", async ({ browser, baseURL }) => {
  test.setTimeout(180000);
  const output = process.env.CLASSROOM_QA_OUTPUT || join(tmpdir(), "classroom-completion"); await mkdir(output, { recursive: true });
  const contexts = await Promise.all(Array.from({ length: 5 }, (_, i) => browser.newContext({ baseURL, viewport: i === 2 ? process.env.CLASSROOM_TABLET_QA ? { width: 1024, height: 768 } : { width: 390, height: 844 } : { width: 1440, height: 1080 }, hasTouch: i === 2 })));
  const [teacher, first, second, third, stranger] = contexts, pool = new Pool({ connectionString: process.env.DATABASE_URL }); let classId = "", id = "";
  try {
    const login = async (context: typeof teacher, username: string, portal = "student") => expect((await context.request.post("/api/auth/login", { data: { username, portal, password: "SmartAgri2026!" } })).status()).toBe(200);
    await login(teacher, "teacher-demo", "teacher"); const stamp = Date.now();
    const created = await teacher.request.post("/api/teacher/classes", { data: { name: `地图投票验收 ${stamp}`, academicYear: "2026-2027", semester: "第一学期" } }); expect(created.status()).toBe(201); classId = (await created.json()).id;
    for (let index = 0; index < 3; index++) expect((await teacher.request.post(`/api/teacher/classes/${classId}/members`, { data: { displayName: ["林同学", "李同学", "王同学"][index], username: `completion_${stamp}_${index}`, studentNo: `M${stamp}${index}` } })).status()).toBe(201);
    await Promise.all([login(first, `completion_${stamp}_0`), login(second, `completion_${stamp}_1`), login(third, `completion_${stamp}_2`), login(stranger, "student-demo")]);
    id = (await (await teacher.request.post("/api/classroom", { data: { classId, rehearsal: true } })).json()).id;
    const api = `/api/classroom/${id}`;
    const snapshot = async (context = teacher, view = "teacher") => (await context.request.get(`${api}?view=${view}`)).json();
    const command = async (action: string, extra = {}) => expect((await teacher.request.patch(api, { data: { action, version: (await snapshot()).version, ...extra } })).status()).toBe(200);
    const action = (context: typeof first, data: object) => context.request.post(`${api}/map`, { data: { operationId: crypto.randomUUID(), ...data } });
    for (const context of [first, second, third]) await context.request.post(api, { data: { action: "join" } });
    await command("start"); await command("stage", { stage: 4 });
    expect((await action(first, { action: "save", version: 0, signals: [] })).status()).toBe(409);
    await command("map-start"); expect((await snapshot()).completion.mapRoster.map((card: { group: number }) => card.group)).toEqual([1, 1, 1]);
    const [t, s, m, screen] = await Promise.all([teacher.newPage(), first.newPage(), second.newPage(), teacher.newPage()]); await screen.setViewportSize({ width: 1920, height: 1080 });
    await s.addInitScript(() => { const host = window as unknown as { audioPulses: number }; host.audioPulses = 0; const original = AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator = function() { host.audioPulses++; return original.call(this); }; });
    const errors: string[] = []; for (const page of [t, s, m, screen]) { page.setDefaultTimeout(15000); page.on("pageerror", error => errors.push(error.message)); }
    await Promise.all([t.goto(`/teacher/classroom/${id}`), s.goto(`/student/classroom/${id}`), m.goto(`/student/classroom/${id}`), screen.goto(`/classroom/${id}/screen`)]);
    await expect(s.getByText("同步正常", { exact: true })).toBeVisible();
    for (const [layer, text] of [["宏观环境变化", "AI工具改变助农直播"], ["微观环境变化", "合作农户更需要稳定销路"], ["自身条件变化", "我要补足数据分析能力"]]) { await s.getByRole("button", { name: `在${layer}添加信号` }).click(); await s.getByRole("textbox", { name: "变化信号内容" }).fill(text); await s.getByRole("button", { name: "保存信号", exact: true }).click(); }
    await s.getByRole("button", { name: "AI工具改变助农直播：持续观察，点击切换" }).click();
    await expect(s.getByRole("button", { name: "提交地图给小组", exact: true })).toBeEnabled(); await s.getByRole("button", { name: "提交地图给小组", exact: true }).click(); await expect(s.getByRole("button", { name: "更新组内地图", exact: true })).toBeVisible();
    const own = (await snapshot(first, "student")).completion.ownMap; expect(own.signals).toHaveLength(3); expect(own.signals[0].priority).toBe("now");
    await s.getByRole("button", { name: "在宏观环境变化添加信号" }).click(); await s.getByRole("textbox", { name: "变化信号内容" }).fill("临时补充"); await s.getByRole("button", { name: "保存信号", exact: true }).click();
    await s.getByRole("button", { name: "上移临时补充", exact: true }).click(); await expect(s.locator(".map-macro .map-signal").first()).toContainText("临时补充");
    await s.getByRole("button", { name: "编辑临时补充", exact: true }).click(); await s.getByRole("textbox", { name: "变化信号内容" }).fill("修订补充"); await s.getByRole("button", { name: "保存信号", exact: true }).click();
    await s.locator(".map-macro .map-signal").filter({ hasText: "AI工具改变助农直播" }).dragTo(s.locator(".map-macro .map-signal").filter({ hasText: "修订补充" })); await expect(s.locator(".map-macro .map-signal").first()).toContainText("AI工具改变助农直播");
    await s.getByRole("button", { name: "删除修订补充", exact: true }).click(); await expect(s.locator(".map-save-status")).toContainText("地图已保存");
    const conflictSession = (await snapshot(first, "student")).ownSessionId;
    await s.evaluate(({ session, signals }) => { localStorage.setItem(`change-map:v1:${session}`, JSON.stringify({ signals, version: 0, operationId: crypto.randomUUID(), dirty: true, complete: false })); window.dispatchEvent(new Event("map-draft")); }, { session: conflictSession, signals: own.signals });
    await expect(s.locator(".map-conflict")).toBeVisible(); await s.getByRole("button", { name: "加载服务器版本", exact: true }).click(); await expect(s.locator(".map-conflict")).toHaveCount(0);
    expect((await snapshot(second, "student")).completion.groupMaps).toEqual([]); expect((await snapshot(teacher, "screen")).completion.mapRoster).toBeUndefined();
    expect((await action(stranger, { action: "save", signals: [], version: 0 })).status()).toBe(403);
    expect((await action(teacher, { action: "save", signals: [], version: 0 })).status()).toBe(403);
    const request = { action: "save", operationId: crypto.randomUUID(), version: 0, signals: own.signals, complete: true };
    expect((await action(second, request)).status()).toBe(200); expect((await action(second, request)).status()).toBe(200); expect((await action(second, { ...request, signals: [] })).status()).toBe(409);
    expect((await action(second, { action: "save", version: 0, signals: own.signals })).status()).toBe(409);
    await s.reload(); await expect(s.getByRole("button", { name: "更新组内地图", exact: true })).toBeVisible();
    await command("pause"); const paused = (await snapshot()).completion.map.elapsedMs; await s.waitForTimeout(350); expect((await snapshot()).completion.map.elapsedMs).toBe(paused); await command("reset", { minutes: 12 }); expect((await snapshot()).completion.map.elapsedMs).toBe(paused); await command("resume");
    // Simulate an offline edit without changing server clock or data.
    await expect(m.getByRole("button", { name: "在自身条件变化添加信号" })).toBeEnabled(); await second.setOffline(true); await m.getByRole("button", { name: "在自身条件变化添加信号" }).tap(); await m.getByRole("textbox", { name: "变化信号内容" }).fill("离线草稿：提升沟通能力"); await m.getByRole("button", { name: "保存信号", exact: true }).tap(); await expect(m.locator(".map-save-status")).toContainText("草稿");
    await second.setOffline(false); await expect.poll(async () => (await snapshot(second, "student")).completion.ownMap.signals.length).toBe(4);
    await m.screenshot({ path: join(output, "第六步-变化地图手机.png"), fullPage: true }); expect(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await pool.query('UPDATE "LiveLesson" SET "mapElapsedMs"=180100,"mapRunningSince"=NOW() WHERE id=$1', [id]); await expect(s.locator(".map-group")).toBeVisible();
    await s.locator(".map-group-cards article").filter({ hasText: "李同学" }).getByRole("button", { name: "查看地图" }).click(); await expect(s.locator(".map-preview")).toContainText("离线草稿：提升沟通能力");
    await s.locator(".map-group-cards article").filter({ hasText: "林同学" }).getByRole("button", { name: "推选为代表" }).click();
    await action(second, { action: "nominate", studentId: own.studentId }); await s.screenshot({ path: join(output, "第六步-组内讨论.png"), fullPage: true });
    await pool.query('UPDATE "LiveLesson" SET "mapElapsedMs"=600100,"mapRunningSince"=NOW() WHERE id=$1', [id]);
    await expect(t.locator(".map-representatives").getByRole("button", { name: /林同学/ })).toBeEnabled(); await t.locator(".map-representatives").getByRole("button", { name: /林同学/ }).click(); await expect(screen.locator(".map-projection")).toContainText("AI工具改变助农直播");
    await screen.screenshot({ path: join(output, "第六步-变化地图大屏.png"), fullPage: true });
    const latest = (await snapshot(first, "student")).completion.ownMap;
    expect((await action(first, { action: "save", version: latest.version, signals: latest.signals.map((signal: { text: string }) => ({ ...signal, text: `${signal.text}（补传）` })) })).status()).toBe(200);
    expect((await snapshot(teacher, "screen")).completion.projectedMap.signals[0].text).toBe("AI工具改变助农直播");
    await command("stage", { stage: 5 }); await command("vote-start"); await s.getByRole("button", { name: "开启倒计时提示音", exact: true }).click(); await expect(s.getByRole("button", { name: "关闭倒计时提示音", exact: true })).toHaveAttribute("aria-pressed", "true"); await expect(s.getByRole("button", { name: /A 3个以上/ })).toBeEnabled();
    await s.getByRole("button", { name: /A 3个以上/ }).click(); expect((await first.request.post(`${api}/vote`, { data: { choice: "B" } })).status()).toBe(409); expect((await first.request.post(`${api}/vote`, { data: { choice: "A" } })).status()).toBe(200);
    await m.getByRole("button", { name: /A 3个以上/ }).tap(); await command("pause"); expect((await third.request.post(`${api}/vote`, { data: { choice: "C" } })).status()).toBe(409); await command("resume");
    await expect(screen.getByRole("region", { name: "调整时机投票结果" })).toBeVisible({ timeout: 16000 });
    expect(await s.evaluate(() => (window as unknown as { audioPulses: number }).audioPulses)).toBeGreaterThan(0);
    expect((await snapshot()).completion.voteStats).toMatchObject({ total: 3, voted: 2, noAnswer: 1, pending: 0, majorityImmediate: true });
    expect((await third.request.post(`${api}/vote`, { data: { choice: "C" } })).status()).toBe(409);
    await command("signals-show"); await expect(screen.locator(".change-signals")).toContainText("规划执行中反复遇阻碍"); expect(await screen.locator(".completion-mentor").evaluate(element => element.getBoundingClientRect().bottom <= innerHeight)).toBe(true); await screen.screenshot({ path: join(output, "第七步-投票三信号大屏.png"), fullPage: true }); await m.screenshot({ path: join(output, "第七步-投票手机.png"), fullPage: true });
    expect(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await command("end");
    const reportResponse = await first.request.get(`${api}/archive?format=json`); expect(reportResponse.status()).toBe(200); const ownReport = await reportResponse.json(); expect(ownReport.fields).toHaveLength(19); expect(ownReport.personal.map.lateSync).toBe(true); expect(ownReport.personal.map.groupInteractions).toBe(2); expect(ownReport.personal.vote.choice).toBe("A"); expect(ownReport.classSummary).toBeUndefined();
    const teacherReport = await (await teacher.request.get(`${api}/archive?format=json`)).json(); expect(teacherReport.personal).toBeUndefined(); expect(teacherReport.events).toBeUndefined(); expect(teacherReport.classSummary.vote.noAnswer).toBe(1);
    expect((await stranger.request.get(`${api}/archive?format=json`)).status()).toBe(403);
    const reportPage = await first.newPage(); await reportPage.goto(`${api}/archive?format=html`); await expect(reportPage.getByRole("heading", { name: "我的变化地图", exact: true })).toBeVisible(); await reportPage.screenshot({ path: join(output, "第八步-个人课堂档案.png"), fullPage: true });
    await s.goto("/student/progress"); await expect(s.locator("#classroom-archives")).toContainText("地图投票验收");
    await teacher.request.patch(`/api/teacher/classes/${classId}`, { data: { isArchived: true } }); expect((await first.request.get(`${api}/archive?format=json`)).status()).toBe(200); await s.reload(); await expect(s.locator("#classroom-archives")).toContainText("地图投票验收");
    const votes = await pool.query('SELECT "payload","source" FROM "LearningEvent" WHERE "liveLessonId"=$1 AND "eventType"=\'TIMING_VOTED\'', [id]); expect(votes.rows).toHaveLength(3); expect(votes.rows.filter(row => row.payload.reason === "timeout")).toHaveLength(1); expect(votes.rows.every(row => row.source === "classroom-rehearsal")).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    if (id) { const state = await (await teacher.request.get(`/api/classroom/${id}?view=teacher`)).json(); if (state.version && state.status !== "ENDED") await teacher.request.patch(`/api/classroom/${id}`, { data: { action: "end", version: state.version } }); }
    if (classId) await teacher.request.patch(`/api/teacher/classes/${classId}`, { data: { isArchived: true } });
    await Promise.all(contexts.map(context => context.close())); await pool.end();
  }
});
