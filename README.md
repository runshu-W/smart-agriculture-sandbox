# 农情润心虚拟仿真沙盘

面向智慧农业的虚拟仿真学习平台，包含学生端五个单元、成长档案和教师管理后台。

## Windows 运行

只需安装 [Node.js 20 LTS 或更高版本](https://nodejs.org/)。

只需要记住：

| 操作 | 双击文件 |
| --- | --- |
| 新电脑首次安装 | `tools\windows\install.cmd` |
| 启动 | `tools\windows\start.cmd` |
| 关闭 | `tools\windows\stop.cmd` |
| 查看状态和访问地址 | `tools\windows\status.cmd` |
| 打包到其他电脑继续开发 | `tools\windows\package.cmd` |

启动后访问 `http://127.0.0.1:3000`。

打包结果保存在项目根目录 `.packages/`。压缩包不会包含 `.env`、数据库数据、依赖、Git 历史、缓存或日志；新电脑解压后从 `install.cmd` 开始即可。

启动后，脚本也会显示局域网地址，其他电脑可使用该地址访问。Windows 防火墙启用时，需要允许 Node.js 或 TCP 3000 的专用网络入站访问。

## 数据库说明

本项目本地开发固定使用 Prisma Dev 数据库。它随 npm 依赖安装，由一键脚本自动创建、启动和关闭。

数据库实例名称为 `smart-v2`。本地数据保存在当前 Windows 用户目录中，不在项目目录和项目压缩包内：

- 换电脑后运行 `install.cmd` 会重新生成演示数据。
- 项目压缩包不会自动带走旧电脑上的学习记录。
- Prisma Dev 仅用于开发和演示；正式校内部署时再改用独立 PostgreSQL。

演示账号：

- 学生：`student-demo` / `SmartAgri2026!`
- 教师：`teacher-demo` / `SmartAgri2026!`

## 页面入口

- 学生登录：`/student-login`
- 学生首页：`/student`
- 学生成长档案：`/student/progress`
- 学生同步课堂：`/student/classroom`
- 教师登录：`/teacher-login`
- 教师管理后台：`/teacher/dashboard`
- 教师课堂控制台：`/teacher/classroom`

## 第五单元同步课堂

教师控制六阶段授课节奏，学生在各自设备上完成行业观察、路径阅读、角色决策、三层变化识别、变化地图协作与调整时机投票。独立投影大屏展示全班进度与教师选定内容。

支持课堂暂停与恢复、断线草稿补传、分组推选、地图投屏，以及个人成长档案回看、打印和下载。原有自主闯关入口继续保留。

详细操作与验证范围见 [课堂使用与验收](docs/units/unit-05/课堂使用与验收.md)。

## 从 GitHub 获取项目

仓库包含源码、教学素材、需求文档与数据库迁移；本地配置、数据库实际数据、依赖、构建产物及自动生成的 Prisma 客户端不纳入版本控制。一键安装会安装依赖并生成 Prisma 客户端；手动安装时请运行 `npm ci` 和 `npm run db:generate`。

## 开发检查

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run asset:audit
npm run build
```

详细脚本说明见 [`tools/windows/README.md`](tools/windows/README.md)。需求文档位于 `docs/`，单元需求真相源位于 `docs/unit_details/`。
