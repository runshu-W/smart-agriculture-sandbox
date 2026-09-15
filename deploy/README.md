# Docker 部署与迁移

本目录将应用与 PostgreSQL 独立部署。默认项目名为 `smart-agriculture`，应用只绑定本机 `127.0.0.1:3001`，数据库无宿主机端口。与现有 `/opt/voyage/deploy`、8080 端口和数据库分开。所有命令从项目根目录执行。

## 1 本地构建

需要 Docker 和 Compose v2 或更高版本。

```bash
./deploy/configure.sh
./deploy/compose.sh build app migrate
./deploy/start.sh
./deploy/compose.sh ps
curl --fail http://localhost:3001/api/health
```

`configure.sh` 生成仅当前用户可读的 `deploy/.env` 和随机密码；已有配置不会覆盖。`start.sh` 依次启动数据库、升级表结构、启动应用并等待健康检查。它不写入演示数据。启动后的空库需要选择下一节的一种初始化方式。

本地登录入口：`http://localhost:3001/student-login` 和 `http://localhost:3001/teacher-login`。正式使用须走 HTTPS，尤其通过非 localhost 地址访问时，登录 Cookie 需要 HTTPS。

Docker Hub 连接受限时，可从 AWS 的 Docker 官方公共镜像下载：

```bash
./deploy/compose.sh build --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:24-bookworm-slim app migrate
docker pull public.ecr.aws/docker/library/postgres:18-alpine
docker tag public.ecr.aws/docker/library/postgres:18-alpine postgres:18-alpine
```

镜像分为应用镜像和数据库运维镜像。应用以普通用户运行；素材和生成报告所需字体在镜像内。镜像不包含本地配置、数据库、Git 历史、测试记录或备份。VPS 是 `linux/amd64`；换用 Apple Silicon 构建时须指定目标平台，不能直接发送仅 arm64 的镜像。

## 2 首次数据准备 二选一

### 迁移现有数据

先停止新项目的应用；导出来源数据库，再恢复到一个尚未运行迁移的空 PostgreSQL 数据卷。不要将 Prisma Dev 的 `.pglite` 文件夹直接放入 PostgreSQL 容器。

```bash
# 新项目只启动数据库，不先执行 start.sh
./deploy/compose.sh up -d --wait db
./deploy/restore.sh /absolute/path/source.dump
./deploy/start.sh
```

`restore.sh` 拒绝覆盖非空数据库，也拒绝在本项目应用运行时恢复。先前若已经运行 start.sh，请使用另一个项目名和空数据卷做迁移验证，不要删除现有卷碰运气。

当前 Mac 使用 Prisma Dev / PGlite，实测标准 pg_dump 的 COPY 导出会导致开发数据库连接中断，不能直接按普通 PostgreSQL 导出。此次迁移先保存停机状态的开发数据库文件副本，再用只读事务按表读取，按外键依赖顺序导入独立 PostgreSQL，核对数据和功能后生成标准 pg_dump 备份。迁移排除 AuthSession 登录会话，并仅在新数据库中为账号设置独立随机密码。上线后的 PostgreSQL 可正常使用本目录 backup.sh / restore.sh 迁移。不要直接搬运 .pglite 文件夹到 PostgreSQL，也不要运行 db:seed 覆盖已有数据。

### 创建演示数据

仅用于没有数据的新库，先完成迁移，再手动执行：

```bash
./deploy/compose.sh run --rm initialize
```

初始化使用 `deploy/.env` 中随机生成的 `DEMO_PASSWORD`。`teacher-demo`、`student-demo` 及24个模拟学生共享这个初始化密码；不再使用公开的 `SmartAgri2026!`。这是试讲数据，不是正式学生名单。登录页不再预填公开演示密码，请手动输入分配的账号和密码。正式开放前应确认账号方案，处理模拟学生并为真实学生分配独立凭据。

初始化脚本拒绝在非空库重复执行；普通启动与镜像更新都不会重新导入演示数据。

## 3 发送镜像到 VPS

可用 `./deploy/package.sh /absolute/path/to/new-release-directory` 生成部署包，包含三个镜像、Compose、部署脚本、Nginx配置和镜像校验值，不包含密码或数据库。接收端进入包目录，执行 `shasum -a 256 -c SHA256SUMS` 和 `docker load < images.tar.gz`，再配置并启动。预构建包不含源码，不要在包目录执行 build。

当前不自动推送镜像仓库。可从本地通过 SSH 发送已构建镜像，避免在2核 VPS 上构建。

```bash
docker save smart-agriculture-app:local smart-agriculture-tools:local | gzip > /your/output/directory/smart-agriculture-images.tar.gz
# 上传镜像包、compose.yaml、deploy目录；配置文件通过安全通道单独传送。
# 在新项目目录解包并执行：
docker load < smart-agriculture-images.tar.gz
./deploy/configure.sh
./deploy/start.sh
```

实际发布应使用固定版本标签，并保留上一版镜像。`deploy/.env` 可以通过 APP_IMAGE / TOOLS_IMAGE 指定版本；PostgreSQL 镜像也可固定到已验证的镜像摘要。首次数据库创建后不要随意修改 POSTGRES_PASSWORD；修改环境变量不会自动修改已存在数据库的密码。

## 4 域名与 Nginx

计划域名：`agri.voyageage.com`。

1. DNS 添加 A 记录：主机 `agri`，指向 `149.28.37.245`。确认解析生效，避免配置指向其他服务器的 AAAA 记录。
2. 备份现有 Nginx 配置。单独为农业系统新增站点，不替换现有 api.voyageage.com 站点。
3. 创建 `/var/www/letsencrypt`，先使用 `nginx/agri-http.conf`，执行 `nginx -t` 成功后平滑 reload。
4. 使用已安装的 Certbot 为新域名单独签发证书，例如 `certbot certonly --webroot -w /var/www/letsencrypt -d agri.voyageage.com`。
5. 证书存在、数据和账号确认完成后，再使用 `nginx/agri-https.conf`。再次检查并 reload，复查原站和新站。
6. 核对续期后会 reload Nginx；现有 certbot 定时器继续承担续期任务。

只使用原有80/443端口。不要新开一个抢占这些端口的代理容器，不需要开放3001或5432。课堂实时更新使用 SSE，新站配置明确关闭代理缓冲。

学生入口：`https://agri.voyageage.com/student-login`

教师入口：`https://agri.voyageage.com/teacher-login`

## 5 备份 更新和回退

```bash
./deploy/backup.sh
./deploy/compose.sh logs --tail=100 app
./deploy/compose.sh stats --no-stream
```

备份保存在 `deploy/backups/`，包含课程、账号、学习与课堂记录；备份本身也需要妥善保存到服务器以外。当前数据导入后写入数据库，报告按需生成，未发现需要额外迁移的用户上传目录；静态教学素材随镜像携带。今后增加文件上传持久化时需要补充备份目录。

更新流程：先备份数据库和部署配置，加载新镜像，修改 APP_IMAGE / TOOLS_IMAGE 为新版本，再运行 `deploy/start.sh`。涉及数据库结构变更时应先验证迁移兼容性；不能仅靠切回旧镜像保证回退。应用启动失败时检查日志，不要再次初始化数据库。

资源初值：应用最多1核/1GB内存，数据库最多0.5核/512MB内存；运维任务另限0.5核/512MB并只在需要时运行。需通过实际课堂并发测试调整，限制并不能完全隔离宿主机磁盘、网络等资源。日志滚动避免无限增长。

停止新系统使用 `./deploy/compose.sh stop`。不要运行全局 Docker 清理命令，不要使用 `down -v`，后者会删除本项目数据库数据卷。

## 6 换 VPS

1. 新服务器加载同一版本的镜像，复制 Compose 和 deploy 配置，启动空数据库。
2. 先进行一次备份恢复演练，并验证登录、课堂、导出。
3. 正式切换前暂停旧站写入，生成最终备份；恢复到新服务器的空库，运行 start.sh。
4. 配置新服务器域名和 HTTPS，完成验证后切换 DNS。
5. 保留旧服务器与切换前备份作为回退。旧站不要继续接受写入，避免两边数据分叉。

通过 `AGRI_ENV_FILE=/absolute/path/other.env` 可选择另一份环境配置；更改 COMPOSE_PROJECT_NAME 会使用独立网络和数据卷，APP_PORT 也必须避开占用。该方式适合备份恢复演练。
