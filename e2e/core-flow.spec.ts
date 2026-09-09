import { expect, test, type Page } from "@playwright/test";

const password = "SmartAgri2026!";

async function login(page: Page, username: "student-demo" | "teacher-demo") {
  const response = await page.context().request.post("/api/auth/login", { data: { username, password, portal: username === "teacher-demo" ? "teacher" : "student" } });
  expect(response.ok()).toBeTruthy();
}

test.describe.configure({ mode: "serial" });

test("separate student and teacher portals require login before their home pages", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/student-login$/);
  await expect(page.getByRole("heading", { name: "学生端登录" })).toBeVisible();
  await expect(page.getByRole("button", { name: "使用学生演示账号" })).toBeVisible();
  await expect(page.getByRole("button", { name: /教师演示账号/ })).toHaveCount(0);
  await page.getByRole("button", { name: "进入学生端" }).click();
  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole("heading", { name: "农情润心虚拟仿真沙盘" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "五个成长单元" })).toBeVisible();
  await expect(page.getByRole("link", { name: /教师/ })).toHaveCount(0);
  // An opposite-role portal remains reachable and replaces the existing session after login.
  await page.goto("/teacher-login");
  await expect(page.getByRole("heading", { name: "教师端登录" })).toBeVisible();
  await expect(page.getByRole("button", { name: "使用教师演示账号" })).toBeVisible();
  await page.getByRole("button", { name: "进入教师管理后台" }).click();
  await expect(page).toHaveURL(/\/teacher\/dashboard$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "班级学习总览" })).toBeVisible();
  await expect(page.getByRole("link", { name: /学生端/ })).toHaveCount(0);
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/teacher-login$/);

  await page.goto("/student-login");
  await page.getByRole("button", { name: "进入学生端" }).click();
  await expect(page).toHaveURL(/\/student$/);
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/student-login$/);

  const crossPortal = await page.context().request.post("/api/auth/login", { data: { username: "student-demo", password, portal: "teacher" } });
  expect(crossPortal.status()).toBe(401);
});

test("student growth archive implements four modules and privacy-window rankings", async ({ page }) => {
  await login(page, "student-demo");
  await page.goto("/student/progress");
  await expect(page.getByRole("heading", { name: "我的素养画像" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "我的成长曲线" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "五单元学习路径" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "云禾英雄榜" })).toBeVisible();
  await expect(page.locator(".unit-progress-grid article")).toHaveCount(5);
  const rankingWindow = await page.locator(".rank-list>div").count();
  expect(rankingWindow).toBeGreaterThanOrEqual(3);
  expect(rankingWindow).toBeLessThanOrEqual(5);
  await expect(page.locator(".rank-list").getByText("本人", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /导出档案/ })).toHaveAttribute("href", "/api/student/reports/profile");
  await page.locator(".student-chart-grid").scrollIntoViewIfNeeded();
  await expect(page.locator(".student-chart-grid canvas").first()).toBeVisible({ timeout: 15_000 });
});

test("teacher home stays concise while analytics initializes all fifteen charts", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await login(page, "teacher-demo");
  await page.goto("/teacher/dashboard");
  await expect(page.getByRole("heading", { name: "班级学习总览" })).toBeVisible();
  await expect(page.locator(".teacher-kpis article")).toHaveCount(4);
  await expect(page.locator(".teacher-unit-list")).toHaveCount(0);
  await expect(page.locator(".teacher-table-panel .admin-table>div")).toHaveCount(6);
  expect(await page.locator(".attention-panel>a").count()).toBeLessThanOrEqual(5);
  await expect(page.getByText("林小禾").first()).toBeVisible();
  for (const title of ["各单元完成情况", "岗位选择分布", "心理韧性趋势", "职业能力雷达图"]) await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("heading", { name: "学习活动总览" })).toBeVisible();
  await expect(page.locator(".weekly-activity-overview article")).toHaveCount(4);
  await page.goto("/teacher/analytics");
  await expect(page.locator(".dashboard-chart")).toHaveCount(15);
  for (const title of ["班级心理韧性增值曲线", "职业认同度增值雷达", "乡村振兴价值认同率"]) await expect(page.getByRole("heading", { name: title })).toBeVisible();
  const lastChart = page.locator(".dashboard-chart").last(); await lastChart.scrollIntoViewIfNeeded();
  await expect(lastChart.locator("canvas, svg").first()).toBeVisible({ timeout: 15_000 });
  expect(pageErrors).toEqual([]);
});

test("server role checks block cross-role access and teacher views omit private text", async ({ page }) => {
  await login(page, "student-demo");
  const blocked = await page.context().request.patch("/api/teacher/content/unit/unit-01", { data: { title: "越权修改" } });
  expect(blocked.status()).toBe(403);
  await page.goto("/teacher/dashboard");
  await expect(page).toHaveURL(/\/student$/);
  await login(page, "teacher-demo");
  await page.goto("/teacher/students/demo-student");
  await expect(page.getByText("本页仅展示授权学习证据")).toBeVisible();
  await expect(page.getByText("仅个人可见的树洞测试原文")).toHaveCount(0);
});

test("published question and interaction configuration affect the student APIs", async ({ page }) => {
  await login(page, "student-demo");
  const originalResponse = await page.context().request.get("/api/student/questions/u01-trad-01-plow");
  const originalBody = await originalResponse.json() as { questions: Array<{ id: string; prompt: string }> };
  expect(originalBody.questions.length).toBeGreaterThan(0);
  const original = originalBody.questions[0]; const changedPrompt = `${original.prompt}（教学版本验证）`;
  await login(page, "teacher-demo");
  const changed = await page.context().request.patch(`/api/teacher/questions/${original.id}`, { data: { prompt: changedPrompt } });
  expect(changed.ok()).toBeTruthy();
  const hidden = await page.context().request.patch("/api/teacher/content/interaction/u01-trad-01-plow", { data: { isPublished: false } });
  expect(hidden.ok()).toBeTruthy();
  await login(page, "student-demo");
  expect((await page.context().request.get("/api/student/questions/u01-trad-01-plow")).status()).toBe(404);
  await login(page, "teacher-demo");
  expect((await page.context().request.patch("/api/teacher/content/interaction/u01-trad-01-plow", { data: { isPublished: true } })).ok()).toBeTruthy();
  await login(page, "student-demo");
  const published = await (await page.context().request.get("/api/student/questions/u01-trad-01-plow")).json() as { questions: Array<{ prompt: string }> };
  expect(published.questions[0].prompt).toBe(changedPrompt);
  await login(page, "teacher-demo");
  expect((await page.context().request.patch(`/api/teacher/questions/${original.id}`, { data: { prompt: original.prompt } })).ok()).toBeTruthy();

  await login(page, "student-demo");
  const unitFiveBody = await (await page.context().request.get("/api/student/questions/u05-path-01-role")).json() as { questions: Array<{ id: string; prompt: string }> };
  const unitFiveQuestion = unitFiveBody.questions[0];
  const unitFivePrompt = `${unitFiveQuestion.prompt}（跨单元发布验证）`;
  await login(page, "teacher-demo");
  expect((await page.context().request.patch(`/api/teacher/questions/${unitFiveQuestion.id}`, { data: { prompt: unitFivePrompt } })).ok()).toBeTruthy();
  await login(page, "student-demo");
  await page.goto("/student/unit-05/activity/u05-path-01-role");
  for (const index of [0, 1, 2]) await page.locator(".u05-job-holograms button").nth(index).click();
  await expect(page.getByRole("heading", { name: unitFivePrompt })).toBeVisible();
  await login(page, "teacher-demo");
  expect((await page.context().request.patch(`/api/teacher/questions/${unitFiveQuestion.id}`, { data: { prompt: unitFiveQuestion.prompt } })).ok()).toBeTruthy();
});

test("member management archives records instead of deleting learning history", async ({ page }) => {
  await login(page, "teacher-demo"); const suffix = Date.now().toString().slice(-7);
  const created = await page.context().request.post("/api/teacher/classes/class-2026-a/members", { data: { displayName: "测试成员", studentNo: `T${suffix}`, username: `test-${suffix}`, nickname: "测试青禾" } });
  expect(created.status()).toBe(201); const student = await created.json() as { id: string };
  const archived = await page.context().request.patch(`/api/teacher/classes/class-2026-a/members/${student.id}`, { data: { action: "archive" } });
  expect(archived.ok()).toBeTruthy();
  await page.goto("/teacher/classes");
  await expect(page.getByText("测试成员").last()).toBeVisible();
  await expect(page.locator(".member-table").getByText("已移出").last()).toBeVisible();
});

test("teacher can create a class, add and remove a student without losing authorization", async ({ page }) => {
  await login(page, "teacher-demo");
  await page.goto("/teacher/classes");
  const suffix = Date.now().toString().slice(-7); const className = `权限回归班${suffix}`; const studentName = `新成员${suffix.slice(-3)}`;
  await page.getByText("新建班级", { exact: true }).click();
  const classForm = page.locator(".class-list-panel form");
  await classForm.locator('[name="name"]').fill(className);
  await classForm.getByRole("button", { name: "创建" }).click();
  await expect(page.getByRole("status")).toHaveText("操作已保存");
  await expect(page.locator(".class-list-panel").getByRole("button", { name: new RegExp(className) })).toBeVisible();
  await expect(page.locator(".member-manager h2")).toHaveText(className);

  await page.getByText("添加学生", { exact: true }).click();
  const memberForm = page.locator(".add-member form");
  await memberForm.locator('[name="displayName"]').fill(studentName);
  await memberForm.locator('[name="studentNo"]').fill(`N${suffix}`);
  await memberForm.locator('[name="username"]').fill(`new-${suffix}`);
  await memberForm.getByRole("button", { name: "添加成员" }).click();
  await expect(page.locator(".member-table").getByText(studentName)).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator(".member-table").getByTitle("移出班级").click();
  await expect(page.locator(".member-table").getByText("已移出")).toBeVisible();

  await page.goto("/teacher/dashboard");
  await expect(page.getByRole("heading", { name: "班级学习总览" })).toBeVisible();
  await page.goto("/teacher/classes");
  await expect(page.getByRole("heading", { name: "班级与成员" })).toBeVisible();
  await expect(page.getByText("教师未获该班级授权")).toHaveCount(0);
  await page.locator(".class-list-panel").getByRole("button", { name: new RegExp(className) }).click();
  await page.getByRole("button", { name: "归档班级" }).click();
  await expect(page.getByRole("status")).toHaveText("操作已保存");
});

test("import validation, templates and unified report exports return real files", async ({ page }) => {
  await login(page, "teacher-demo");
  const template = await page.context().request.get("/api/teacher/imports/templates/literacy");
  expect(template.ok()).toBeTruthy(); expect(template.headers()["content-type"]).toContain("spreadsheetml"); expect((await template.body()).byteLength).toBeGreaterThan(1_000);
  const invalidCsv = Buffer.from(`学生姓名,学号,指标编码,得分,测评时间,课次,阶段,数据来源\n林小禾,S${Date.now()},unknown.metric,88,2026-09-01,1,CURRENT,TEACHER_UPLOAD`, "utf8");
  const invalid = await page.context().request.post("/api/teacher/imports", { multipart: { classId: "class-2026-a", kind: "teacher", file: { name: "invalid.csv", mimeType: "text/csv", buffer: invalidCsv } } });
  expect(invalid.status()).toBe(201); const batch = await invalid.json() as { status: string; invalidRows: number }; expect(batch.status).toBe("REJECTED"); expect(batch.invalidRows).toBe(1);
  const xlsx = await page.context().request.get("/api/teacher/reports/data");
  expect(xlsx.ok()).toBeTruthy(); expect(xlsx.headers()["content-type"]).toContain("spreadsheetml"); expect((await xlsx.body()).byteLength).toBeGreaterThan(10_000);
  const pdf = await page.context().request.get("/api/teacher/reports/class");
  expect(pdf.ok()).toBeTruthy(); expect(pdf.headers()["content-type"]).toContain("application/pdf"); const pdfBody = await pdf.body(); expect(pdfBody.subarray(0, 4).toString()).toBe("%PDF"); expect(pdfBody.byteLength).toBeGreaterThan(50_000);
});

test("teacher shell remains usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await login(page, "teacher-demo"); await page.goto("/teacher/dashboard");
  await expect(page.locator(".teacher-nav")).toBeVisible(); await expect(page.locator(".teacher-mobile-header")).toBeVisible();
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth); expect(bodyWidth).toBeLessThanOrEqual(410);
});
