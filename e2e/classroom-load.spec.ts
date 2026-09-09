import { Pool } from "pg";
import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
test.use({ channel: process.env.PLAYWRIGHT_CHANNEL });
test("25 authenticated students synchronize and persist simultaneous maps and votes", async ({ browser, baseURL }) => {
  test.setTimeout(240000);
  const contexts = await Promise.all(Array.from({ length: 26 }, () => browser.newContext({ baseURL })));
  const [teacher, ...students] = contexts; const pool = new Pool({ connectionString: process.env.DATABASE_URL }); let id = "", classId = "";
  try {
    const login = async (context: typeof teacher, username: string, portal = "student") => expect((await context.request.post("/api/auth/login", { data: { username, portal, password: "SmartAgri2026!" } })).status()).toBe(200);
    await login(teacher, "teacher-demo", "teacher"); const stamp = Date.now();
    const created = await teacher.request.post("/api/teacher/classes", { data: { name: `25人并发验收 ${stamp}`, academicYear: "2026-2027", semester: "第一学期" } }); expect(created.status()).toBe(201); classId = (await created.json()).id;
    for (let index = 0; index < 25; index++) expect((await teacher.request.post(`/api/teacher/classes/${classId}/members`, { data: { displayName: `并发同学${index + 1}`, username: `load_${stamp}_${index}`, studentNo: `L${stamp}${String(index).padStart(2, "0")}` } })).status()).toBe(201);
    // Limit expensive password verification concurrency, independent from the measured classroom load.
    for (let start = 0; start < 25; start += 5) await Promise.all(students.slice(start, start + 5).map((context, offset) => login(context, `load_${stamp}_${start + offset}`)));
    id = (await (await teacher.request.post("/api/classroom", { data: { classId, rehearsal: true } })).json()).id; const api = `/api/classroom/${id}`;
    expect((await Promise.all(students.map(context => context.request.post(api, { data: { action: "join" } })))).every(response => response.status() === 200)).toBe(true);
    const snapshot = async () => (await teacher.request.get(`${api}?view=teacher`)).json();
    const command = async (action: string, extra = {}) => { const version = (await snapshot()).version; const startedAt = Date.now(); const response = await teacher.request.patch(api, { data: { action, version, ...extra } }); expect(response.status()).toBe(200); return { startedAt, version: (await snapshot()).version }; };
    // 25 real authenticated EventSource connections, isolated cookies; a minimal host keeps
    // the measurement focused on transport latency. Full pages are tested separately.
    const pages = await Promise.all(students.map(context => context.newPage()));
    await Promise.all(pages.map(async page => { await page.route("**/__classroom_load_probe", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>课堂连接验收</title>" })); await page.goto("/__classroom_load_probe"); await page.evaluate(url => { const host = window as unknown as { samples: { version: number; at: number; ownId: string }[]; connection: EventSource }; host.samples = []; host.connection = new EventSource(url); host.connection.onmessage = event => { const data = JSON.parse(event.data); host.samples.push({ version: data.version, at: Date.now(), ownId: data.completion.ownMap?.studentId }); }; }, `${api}/stream?view=student`); }));
    await expect.poll(async () => (await Promise.all(pages.map(page => page.evaluate(() => (window as unknown as { samples: unknown[] }).samples.length > 0)))).filter(Boolean).length, { timeout: 20000 }).toBe(25);
    await command("start");
    const latency: number[] = [];
    for (const stage of [1, 2, 3, 4]) { const change = await command("stage", { stage }); await expect.poll(async () => (await Promise.all(pages.map(page => page.evaluate(version => (window as unknown as { samples: { version: number }[] }).samples.some(sample => sample.version === version), change.version)))).filter(Boolean).length, { timeout: 15000, intervals: [30, 60, 100] }).toBe(25); const times = await Promise.all(pages.map(page => page.evaluate(version => (window as unknown as { samples: { version: number; at: number }[] }).samples.find(sample => sample.version === version)!.at, change.version))); latency.push(...times.map(at => at - change.startedAt)); }
    const identities = await Promise.all(pages.map(page => page.evaluate(() => (window as unknown as { samples: { ownId: string }[] }).samples.at(-1)!.ownId))); expect(new Set(identities).size).toBe(25);
    await command("map-start"); const groups = (await snapshot()).completion.mapRoster.map((card: { group: number }) => card.group); expect(new Set(groups).size).toBe(5); for (const group of new Set(groups)) expect(groups.filter((value: number) => value === group)).toHaveLength(5);
    const saves = await Promise.all(students.map((context, index) => context.request.post(`${api}/map`, { data: { action: "save", operationId: crypto.randomUUID(), version: 0, complete: true, signals: ["macro", "micro", "self"].map(layer => ({ id: crypto.randomUUID(), layer, text: `${index + 1}号同学的${layer}信号`, priority: "now" })) } })));
    expect(saves.map(response => response.status())).toEqual(Array(25).fill(200)); expect((await snapshot()).completion.mapRoster.filter((card: { submitted: boolean }) => card.submitted)).toHaveLength(25);
    const personal = await Promise.all(students.map(context => context.request.get(`${api}?view=student`).then(response => response.json()))); personal.forEach((data, index) => { expect(data.completion.ownMap.signals[0].text).toContain(`${index + 1}号同学`); expect(data.completion.groupMaps).toEqual([]); });
    await pool.query('UPDATE "LiveLesson" SET "mapElapsedMs"=180100,"mapRunningSince"=NOW() WHERE id=$1', [id]);
    const otherGroup = personal.find(data => data.completion.ownMap.group !== personal[0].completion.ownMap.group).completion.ownMap;
    expect((await students[0].request.post(`${api}/map`, { data: { action: "view", operationId: crypto.randomUUID(), studentId: otherGroup.studentId } })).status()).toBe(403);
    expect((await students[0].request.post(`${api}/map`, { data: { action: "nominate", operationId: crypto.randomUUID(), studentId: otherGroup.studentId } })).status()).toBe(403);
    const groupView = await (await students[0].request.get(`${api}?view=student`)).json(); expect(groupView.completion.groupMaps).toHaveLength(5); expect(groupView.completion.groupMaps.every((card: { group: number }) => card.group === personal[0].completion.ownMap.group)).toBe(true);
    await command("stage", { stage: 5 }); await command("vote-start");
    const votes = await Promise.all(students.map((context, index) => context.request.post(`${api}/vote`, { data: { choice: index < 15 ? "A" : index < 20 ? "B" : "C" } })));
    expect(votes.map(response => response.status())).toEqual(Array(25).fill(200)); await command("end");
    expect((await snapshot()).completion.voteStats).toMatchObject({ total: 25, voted: 25, noAnswer: 0, majorityImmediate: true });
    const report = await (await teacher.request.get(`${api}/archive?format=json`)).json(); expect(report.classSummary.maps).toHaveLength(25); expect(report.classSummary.vote.options.map((option: { count: number }) => option.count)).toEqual([15, 5, 5]);
    const sorted = latency.toSorted((a, b) => a - b), output = process.env.CLASSROOM_QA_OUTPUT || join(tmpdir(), "classroom-completion"); await mkdir(output, { recursive: true });
    const result = { date: new Date().toISOString(), browser: process.env.PLAYWRIGHT_CHANNEL, environment: "本机 Next 开发服务与隔离 PostgreSQL，25 个独立登录的真实 SSE 连接；轻量测试页接收，非25台真实设备", lessonId: id, students: 25, transitionSamples: sorted.length, latencyMs: { min: sorted[0], median: sorted[Math.floor(sorted.length * .5)], p95: sorted[Math.ceil(sorted.length * .95) - 1], max: sorted.at(-1), mean: Math.round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length) }, within500ms: sorted.filter(value => value < 500).length, simultaneousMapsSaved: 25, simultaneousVotesSaved: 25, uniqueStudentViews: 25 };
    await writeFile(join(output, "第八步-25人并发验收.json"), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result)); expect(sorted.at(-1)).toBeLessThan(500);
  } finally {
    if (id) { const state = await (await teacher.request.get(`/api/classroom/${id}?view=teacher`)).json(); if (state.version && state.status !== "ENDED") await teacher.request.patch(`/api/classroom/${id}`, { data: { action: "end", version: state.version } }); }
    if (classId) await teacher.request.patch(`/api/teacher/classes/${classId}`, { data: { isArchived: true } }); await Promise.all(contexts.map(context => context.close())); await pool.end();
  }
});
