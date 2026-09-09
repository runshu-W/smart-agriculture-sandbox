# Windows 一键脚本

本地开发只需要安装 Node.js 20+。

只需要记住：

- 新电脑第一次：`install.cmd`
- 启动：`start.cmd`
- 关闭：`stop.cmd`
- 查看地址：`status.cmd`
- 打包到新电脑：`package.cmd`

首次安装后不需要再次运行 `install.cmd`。应用日志保存在项目根目录 `.runtime/`。

本项目使用 Prisma Dev 本地数据库，数据保存在当前 Windows 用户目录中，不在项目文件夹或压缩包内。换电脑后运行 `install.cmd` 会生成一套新的演示数据，不会自动带走旧电脑的学习记录。

`package.cmd` 会在项目根目录 `.packages/` 生成带时间戳的 ZIP 和 SHA-256 校验文件。压缩包保留继续开发所需的源码、文档、素材、数据库迁移及一键脚本，自动排除 `.env`、数据库数据、Git 历史、依赖、构建缓存和运行日志。
