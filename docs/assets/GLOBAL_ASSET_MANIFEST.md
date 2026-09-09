# 全局素材清单

## 状态定义

`planned` → `prompt-ready` → `generated` → `cleaned` → `approved`。外部待提供素材使用 `blocked-external`，废弃素材使用 `deprecated`。

## 全局核心素材

| 素材编号 | 素材 | 规格 | 路径 | 状态 | 复用范围 |
|---|---|---|---|---|---|
| G-BRAND-LOGO-01 | 叶片与农田组合标志 | SVG | `public/assets/global/brand/logo.svg` | planned | 全站 |
| G-CHAR-NXZ-IDLE-01 | 农小智标准站姿 | 透明 PNG，2048x2048 源图 | `public/assets/global/characters/nongxiaozhi/idle-v001.png` | planned | 五单元、首页、看板 |
| G-CHAR-NXZ-GUIDE-01 | 农小智抬手引导姿态 | 透明 PNG，776x1199 成品 | `public/assets/global/characters/nongxiaozhi/guide-v001.png` | approved | 五单元、M1 |
| G-CHAR-NXZ-ENCOURAGE-01 | 农小智鼓励姿态 | 透明 PNG，821x1381 | `public/assets/global/characters/nongxiaozhi/encourage-v001.png` | approved | 五单元 |
| G-ROLE-ANCHOR-F-01 | 女助农电商主播标准形象 | 透明 PNG，746x1409 | `public/assets/global/roles/anchor-f-v001.png` | approved | 一至五单元 |
| G-ROLE-ANCHOR-M-01 | 男助农电商主播标准形象 | 透明 PNG，692x1368 | `public/assets/global/roles/anchor-m-v001.png` | approved | 一至五单元 |
| G-ROLE-FARM-F-01 | 女智慧农场运营师标准形象 | 透明 PNG，551x1573 | `public/assets/global/roles/farm-f-v001.png` | approved | 一至五单元 |
| G-ROLE-FARM-M-01 | 男智慧农场运营师标准形象 | 透明 PNG，607x1545 | `public/assets/global/roles/farm-m-v001.png` | approved | 一至五单元 |
| G-ROLE-BRAND-F-01 | 女品牌策划师标准形象 | 透明 PNG，557x1386 | `public/assets/global/roles/brand-f-v001.png` | approved | 一至五单元 |
| G-ROLE-BRAND-M-01 | 男品牌策划师标准形象 | 透明 PNG，785x1679 | `public/assets/global/roles/brand-m-v001.png` | approved | 一至五单元 |
| G-ROLE-OPS-F-01 | 女乡村电商运营官标准形象 | 透明 PNG，563x1395 | `public/assets/global/roles/ops-f-v001.png` | approved | 一至五单元 |
| G-ROLE-OPS-M-01 | 男乡村电商运营官标准形象 | 透明 PNG，569x1419 | `public/assets/global/roles/ops-m-v001.png` | approved | 一至五单元 |
| G-ROLE-FOUNDER-F-01 | 女新农人创业家标准形象 | 透明 PNG，562x1542 | `public/assets/global/roles/founder-f-v001.png` | approved | 一至五单元 |
| G-ROLE-FOUNDER-M-01 | 男新农人创业家标准形象 | 透明 PNG，548x1400 | `public/assets/global/roles/founder-m-v001.png` | approved | 一至五单元 |
| G-UI-BADGE-BASE-01 | 通用徽章底板 | SVG，viewBox 200x220 | `public/assets/global/badges/base.svg` | approved | 全站 |
| G-PROP-HARVESTER-01 | 联合收割机标准外观 | 透明 PNG，1517x750 | `public/assets/global/props/harvester-v001.png` | approved | 一、四、五单元 |
| G-PROP-DRONE-01 | 植保无人机标准外观 | 透明 PNG，1458x832；后续可追加 GLB 变体 | `public/assets/global/props/drone-v001.png` | approved | 一、四、五单元 |
| G-PROP-SOIL-SENSOR-01 | 白色田间土壤传感探杆 | 透明 PNG，465x1354 | `public/assets/global/props/soil-sensor-v001.png` | approved | 一、四、五单元 |
| G-PROP-TOMATO-DISPLAY-01 | 高山番茄与无字包装展示组 | 透明 PNG，1422x823 | `public/assets/global/props/tomato-display-v001.png` | approved | 一、二、三、五单元 |
| G-PROP-STRATEGY-TOOLBOX-01 | 四槽策略工具箱，内容由代码叠加 | 透明 PNG，1015x947 | `public/assets/global/props/strategy-toolbox-v001.png` | approved | 二、三单元 |
| G-PROP-TYPEWRITER-01 | 沟通与情绪表达训练打字机 | 透明 PNG，1536x993 | `public/assets/global/props/typewriter-v001.png` | approved | 二、三单元 |
| G-PROP-STRATEGY-CASE-01 | 三槽个人策略收纳箱 | 透明 PNG，1009x977 | `public/assets/global/props/strategy-case-v001.png` | approved | 二、四单元 |
| G-CROP-DISEASE-01 | 番茄早疫叶斑教学样本 | 768x768 WebP | `public/assets/global/crops/disease-tomato-early-blight-v001.webp` | approved | 一、四单元 |
| G-CROP-DISEASE-02 | 黄瓜白粉病教学样本 | 768x768 WebP | `public/assets/global/crops/disease-cucumber-powdery-mildew-v001.webp` | approved | 一、四单元 |
| G-CROP-DISEASE-03 | 小麦叶锈病教学样本 | 768x768 WebP | `public/assets/global/crops/disease-wheat-leaf-rust-v001.webp` | approved | 一、四单元 |
| G-SCN-PROJECT-HOME-01 | 智慧农业项目全景背景 | 1920x1080 WebP | `public/assets/global/scenes/project-home-v001.webp` | approved | 系统首页、学生学习地图 |

## 代码生成效果

以下内容不生成位图：热点脉冲、描边高亮、路径光带、稻粒粒子、雨雪、数据波形、进度环、图表、按钮、对话框、字幕、排行榜和卡片排版。

## 素材记录要求

每次生成或接收外部素材后，在对应清单中补充：最终提示词或来源、生成方式、源文件、成品路径、尺寸、版本、状态、复用范围、授权信息和 QA 报告路径。

## M2-A 生成记录

| 素材编号 | 生成方式 | 源文件 | 成品与 QA | 日期 |
|---|---|---|---|---|
| `G-SCN-PROJECT-HOME-01` | built-in `image_gen`，概念图仅作风格参考 | `tmp/imagegen/project-home-v001-source.png` | `public/assets/global/scenes/project-home-v001.webp`；1920x1080，WebP q88；构图与文本留白检查通过 | 2026-07-26 |

## 第一单元素材审计补齐生成记录

完整提示词见 `GLOBAL_ASSET_PROMPTS.md`。透明素材均使用纯色键生成，再以软蒙版、边缘收缩和去溢色处理；四角 alpha、白底、深底和棋盘格检查通过。

| 素材编号 | 源文件 | 成品规格 | QA/报告 | 版本/日期 |
|---|---|---|---|---|
| `G-ROLE-ANCHOR-F-01` | `tmp/imagegen/audit-20260726/anchor-f-source.png` | 透明 PNG，746x1409 | `docs/assets/reports/G-ROLE-ANCHOR-F-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-ANCHOR-M-01` | `tmp/imagegen/audit-20260726/anchor-m-source.png` | 透明 PNG，692x1368 | `docs/assets/reports/G-ROLE-ANCHOR-M-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-FARM-F-01` | `tmp/imagegen/audit-20260726/farm-f-source.png` | 透明 PNG，551x1573 | `docs/assets/reports/G-ROLE-FARM-F-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-FARM-M-01` | `tmp/imagegen/audit-20260726/farm-m-source.png` | 透明 PNG，607x1545 | `docs/assets/reports/G-ROLE-FARM-M-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-BRAND-F-01` | `tmp/imagegen/audit-20260726/brand-f-source.png` | 透明 PNG，557x1386 | `docs/assets/reports/G-ROLE-BRAND-F-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-BRAND-M-01` | `tmp/imagegen/audit-20260726/brand-m-source.png` | 透明 PNG，785x1679 | `docs/assets/reports/G-ROLE-BRAND-M-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-OPS-F-01` | `tmp/imagegen/audit-20260726/ops-f-source.png` | 透明 PNG，563x1395 | `docs/assets/reports/G-ROLE-OPS-F-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-OPS-M-01` | `tmp/imagegen/audit-20260726/ops-m-source.png` | 透明 PNG，569x1419 | `docs/assets/reports/G-ROLE-OPS-M-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-FOUNDER-F-01` | `tmp/imagegen/audit-20260726/founder-f-source.png` | 透明 PNG，562x1542 | `docs/assets/reports/G-ROLE-FOUNDER-F-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-ROLE-FOUNDER-M-01` | `tmp/imagegen/audit-20260726/founder-m-source.png` | 透明 PNG，548x1400 | `docs/assets/reports/G-ROLE-FOUNDER-M-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-PROP-HARVESTER-01` | `tmp/imagegen/audit-20260726/harvester-source.png` | 透明 PNG，1517x750 | `docs/assets/reports/G-PROP-HARVESTER-01-v001.json`；细支架/镂空通过 | v001 / 2026-07-26 |
| `G-PROP-DRONE-01` | `tmp/imagegen/audit-20260726/drone-source.png` | 透明 PNG，1458x832 | `docs/assets/reports/G-PROP-DRONE-01-v001.json`；旋翼/喷杆通过 | v001 / 2026-07-26 |
| `G-PROP-SOIL-SENSOR-01` | `tmp/imagegen/audit-20260726/soil-sensor-source.png` | 透明 PNG，465x1354 | `docs/assets/reports/G-PROP-SOIL-SENSOR-01-v001.json`；探针通过 | v001 / 2026-07-26 |
| `G-PROP-TOMATO-DISPLAY-01` | `tmp/imagegen/audit-20260726/tomato-display-source.png` | 透明 PNG，1422x823 | `docs/assets/reports/G-PROP-TOMATO-DISPLAY-01-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-CHAR-NXZ-ENCOURAGE-01` | `tmp/imagegen/audit-20260726/nongxiaozhi-encourage-source.png` | 透明 PNG，821x1381 | `docs/assets/reports/G-CHAR-NXZ-ENCOURAGE-01-v001.json`；身份/三底通过 | v001 / 2026-07-26 |
| `G-CROP-DISEASE-01` | `tmp/imagegen/audit-20260726/disease-tomato-source.png` | WebP q88，768x768 | 同心叶斑、叶形和无文字检查通过 | v001 / 2026-07-26 |
| `G-CROP-DISEASE-02` | `tmp/imagegen/audit-20260726/disease-cucumber-source.png` | WebP q88，768x768 | 白粉菌落、叶形和无文字检查通过 | v001 / 2026-07-26 |
| `G-CROP-DISEASE-03` | `tmp/imagegen/audit-20260726/disease-wheat-source.png` | WebP q88，768x768 | 锈色孢子堆、麦叶和无文字检查通过 | v001 / 2026-07-26 |
| `G-UI-BADGE-BASE-01` | 代码原生 SVG | viewBox 200x220 | XML/SVG 构图和安全区检查通过 | v001 / 2026-07-26 |

## 第二单元新增全局道具生成记录

| 素材编号 | 源文件 | 成品规格 | QA/报告 | 版本/日期 |
|---|---|---|---|---|
| `G-PROP-STRATEGY-TOOLBOX-01` | `artifacts/imagegen/unit-02/strategy-toolbox-source.png` | 透明 PNG，1015x947 | `docs/assets/reports/unit-02/strategy-toolbox-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-PROP-TYPEWRITER-01` | `artifacts/imagegen/unit-02/typewriter-source.png` | 透明 PNG，1536x993 | `docs/assets/reports/unit-02/typewriter-v001.json`；三底通过 | v001 / 2026-07-26 |
| `G-PROP-STRATEGY-CASE-01` | `artifacts/imagegen/unit-02/strategy-case-source.png` | 透明 PNG，1009x977 | `docs/assets/reports/unit-02/strategy-case-v001.json`；三底通过 | v001 / 2026-07-26 |

## 2026-09-09 用户指定形象统一

| 编号 | 说明 | 文件 | 状态 | 复用范围 |
|---|---|---|---|---|
| G-CHAR-NXZ-PORTRAIT-02 | 用户提供的农小智半身形象，505x532，RGBA PNG | `public/assets/global/characters/nongxiaozhi/portrait-v002.png` | approved | 首页、单元地图、邀请函、操作引导、结业、感恩卡、费曼课堂、规划书、总结寄语、未来结局 |

来源：用户提供 `图片1.png`，2026-09-09 明确指定用于形象统一。直接复制原图，未生成、重绘或修改人物；生成提示词不适用。胸牌文字、棕色眼睛、黑发、帽子、耳机与服装全部沿用原图。旧 guide-v001.png 与 encourage-v001.png 保留作历史素材，不再由应用页面引用；原站姿和抬手姿态规范由此半身标准形象取代。展示必须保持原图比例，不能为了填满旧全身位置而拉伸。

验证：原图与接入素材 SHA-256 一致；12 个源文件中 15 处图片引用已统一，应用源码中不再引用旧 guide/encourage 图片。Edge 桌面 1440x900 检查首页、第五单元、邀请函、脱粒机引导；390x844 检查首页与第五单元，无横向溢出。邀请函展开/进入传统馆及脱粒机开始操作正常。lint 零错误（prisma.config.ts 有一项已有未使用变量警告）、typecheck、28 项测试、build 与素材审计通过。控制台仅发现既有 favicon.ico 404，无应用运行异常。验证使用独立 nxz-review-20260909 数据库，不修改已有班级记录。
