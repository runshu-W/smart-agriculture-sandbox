# 第三单元素材清单与覆盖台账

状态：`planned` → `prompt-ready` → `generated` → `cleaned` → `approved`；代码项使用 `implemented-code`。

## 1. 单元专属场景

| 编号 | 用途 | 规格与路径 | 版本 | 状态 | 复用 | QA |
|---|---|---|---|---|---|---|
| `U03-SCN-COMM-01` | 职场沟通大厅，三面落地窗可进入 | 1920x1080 WebP；`public/assets/unit-03/scenes/communication-hall-v001.webp` | v001 | approved | U03 | 无人/无字/三空间通过 |
| `U03-SCN-FESTIVAL-01` | 丰收节协作广场与主舞台 | 1920x1080 WebP；`public/assets/unit-03/scenes/harvest-festival-v001.webp` | v001 | approved | U03 | 四空白看板与舞台通过 |
| `U03-SCN-MEDIATION-01` | 圆形木质矛盾调解室 | 1920x1080 WebP；`public/assets/unit-03/scenes/mediation-room-v001.webp` | v001 | approved | U03 | 三案卷/圆桌/无字通过 |
| `U03-SCN-GRATITUDE-01` | 青砖感恩墙与和谐之门 | 1920x1080 WebP；`public/assets/unit-03/scenes/gratitude-wall-v001.webp` | v001 | approved | U03 | 空白石板/门/暖光通过 |
| `U03-SCN-RELATION-01` | 关系图谱玻璃温室 | 1920x1080 WebP；`public/assets/unit-03/scenes/relationship-garden-v001.webp` | v001 | approved | U03 | 八花位/分析仪/白板通过 |
| `U03-SCN-EMPATHY-01` | 同理心剧场与换装间 | 1920x1080 WebP；`public/assets/unit-03/scenes/empathy-theater-v001.webp` | v001 | approved | U03 | 三灯位/空屏/导演椅通过 |
| `U03-SCN-FESTIVAL-OUTDOOR-01` | 分歧方案 A：稻田中央露天舞台 | 1200x675 WebP；`public/assets/unit-03/scenes/festival-outdoor-stage-v001.webp` | v001 | approved | U03 | 与室内方案同视角；无人、无字、天气风险可辨，通过 |
| `U03-SCN-FESTIVAL-INDOOR-01` | 分歧方案 B：室内仓库改造 | 1200x675 WebP；`public/assets/unit-03/scenes/festival-indoor-warehouse-v001.webp` | v001 | approved | U03 | 与露天方案同视角；无人、无字、空间限制可辨，通过 |

## 2. 人物帧与故事板

| 编号 | 用途 | 规格与路径 | 版本 | 状态 | 复用 | QA |
|---|---|---|---|---|---|---|
| `U03-NPC-WANG-01` | 王总中性、点头、皱眉、看手机四状态帧 | 透明 PNG atlas 1254x1254，单帧 627x627；`public/assets/unit-03/characters/manager/` | v001 | approved | U03 | 四角 alpha 0，身份/四状态通过 |
| `U03-NPC-TEAM-01` | 运营小李、设计小张、技术小王三人会议组 | 透明 PNG 1204x892；`public/assets/unit-03/characters/colleague-team-v001.png` | v001 | approved | U03 | 四角 alpha 0，三人动作通过 |
| `U03-STORY-CASE001-01` | 小赵被孤立三镜头故事板 | 1536x768 WebP；`public/assets/unit-03/storyboards/case-isolation-v001.webp` | v001 | approved | U03 | 三镜头身份/事件连续通过 |
| `U03-STORY-CASE002-01` | 供应商诱惑及双未来三镜头故事板 | 1536x1024 WebP；`public/assets/unit-03/storyboards/case-temptation-v001.webp` | v001 | approved | U03 | 邀约/分叉/上报连续通过 |
| `U03-STORY-CASE003-01` | 小刘账目误解三镜头故事板 | 1536x768 WebP；`public/assets/unit-03/storyboards/case-misunderstanding-v001.webp` | v001 | approved | U03 | 质疑/受伤/澄清连续通过 |
| `U03-NPC-EMPATHY-01` | 返乡创业青年、父亲、村干部角色组 | 透明 PNG 1252x854；`public/assets/unit-03/characters/empathy-cast-v001.png` | v001 | approved | U03，U05 可评估复用 | 四角 alpha 0，角色可辨通过 |

页面不再直接裁切三联画。以下文件由上述三张已批准故事板按镜头边界确定性拆分，不是重复生成的新美术版本：

| 派生编号 | 来源 | 成品与规格 | 状态 | QA |
|---|---|---|---|---|
| `U03-STORY-CASE001-F01~F03` | `U03-STORY-CASE001-01` | `public/assets/unit-03/storyboards/case-isolation-frame-01-v001.webp`、`public/assets/unit-03/storyboards/case-isolation-frame-02-v001.webp`、`public/assets/unit-03/storyboards/case-isolation-frame-03-v001.webp`；各 512x768 | approved | 三帧横排、完整画面、身份连续，通过 |
| `U03-STORY-CASE002-F01~F03` | `U03-STORY-CASE002-01` | `public/assets/unit-03/storyboards/case-temptation-frame-01-v001.webp`、`public/assets/unit-03/storyboards/case-temptation-frame-02-v001.webp`、`public/assets/unit-03/storyboards/case-temptation-frame-03-v001.webp`；1536x341、1536x341、1536x342 | approved | 三帧横排、完整画面、事件连续，通过 |
| `U03-STORY-CASE003-F01~F03` | `U03-STORY-CASE003-01` | `public/assets/unit-03/storyboards/case-misunderstanding-frame-01-v001.webp`、`public/assets/unit-03/storyboards/case-misunderstanding-frame-02-v001.webp`、`public/assets/unit-03/storyboards/case-misunderstanding-frame-03-v001.webp`；各 512x768 | approved | 三帧横排、完整画面、身份连续，通过 |

`U03-NPC-WANG-01` 文件组成：`public/assets/unit-03/characters/manager/manager-atlas-v001.png`、`public/assets/unit-03/characters/manager/neutral-v001.png`、`public/assets/unit-03/characters/manager/approve-v001.png`、`public/assets/unit-03/characters/manager/frown-v001.png`、`public/assets/unit-03/characters/manager/phone-v001.png`。Atlas 用于版本与连续性 QA，页面显式引用四张 627x627 单帧。

## 3. 全局复用

| 全局编号 | 第三单元用途 | 状态 |
|---|---|---|
| `G-CHAR-NXZ-GUIDE-01` / `G-CHAR-NXZ-ENCOURAGE-01` | 沟通教练、温和反馈、结业 | approved |
| `G-ROLE-ANCHOR/FARM/BRAND/OPS/FOUNDER-*-01` | 学生身份、团队成果标签和回顾 | approved |
| `G-PROP-TOMATO-DISPLAY-01` | 丰收节成果舞台农产品展示 | approved |
| `G-PROP-TYPEWRITER-01` | 沟通风格分析仪主体 | approved |
| `G-UI-BADGE-BASE-01` | 和谐使者、关系地图师、同理心达人徽章底板 | approved |

## 4. 逐互动视觉覆盖

| 互动 ID | 场景/角色/道具 | 代码效果 | 状态 |
|---|---|---|---|
| `u03-comm-01-manager` | `U03-SCN-COMM-01`、`U03-NPC-WANG-01`、NXZ | 推镜、准备环、提纲、信任值、延迟反馈 | verified |
| `u03-comm-02-team` | `U03-SCN-COMM-01`、`U03-NPC-TEAM-01` | 温度计、两轮步骤、参与光圈 | verified |
| `u03-comm-03-customer` | `U03-SCN-COMM-01` | 客服窗、语音波形、历史抽屉、情绪轨迹 | verified |
| `u03-festival-01-role` | `U03-SCN-FESTIVAL-01` | 五旗、投票、拖放/键盘授旗 | verified |
| `u03-festival-02-dependencies` | `U03-SCN-FESTIVAL-01` | 四进度板、锁链、效率曲线 | verified |
| `u03-festival-03-conflict` | `U03-SCN-FESTIVAL-01`、`U03-SCN-FESTIVAL-OUTDOOR-01`、`U03-SCN-FESTIVAL-INDOOR-01` | 警灯、陈述计时、静音、方案合成 | verified |
| `u03-festival-04-showcase` | `U03-SCN-FESTIVAL-01`、番茄展示组 | 成果轮播、观众反应、雷达、标签 | verified |
| `u03-mediation-01-isolation` | `U03-SCN-MEDIATION-01`、`U03-STORY-CASE001-01` | 案卷、三镜头推演、角色切换 | verified |
| `u03-mediation-02-temptation` | `U03-SCN-MEDIATION-01`、`U03-STORY-CASE002-01` | 金币/信誉双路、分叉推进 | verified |
| `u03-mediation-03-misunderstanding` | `U03-SCN-MEDIATION-01`、`U03-STORY-CASE003-01` | 群聊字幕、真相天平 | verified |
| `u03-gratitude-01-write` | `U03-SCN-GRATITUDE-01` | 石板放大、对象光色、词库落笔 | verified |
| `u03-gratitude-02-card` | `U03-SCN-GRATITUDE-01` | 四主题 SVG、3D 翻卡、贴墙轨迹 | verified |
| `u03-gratitude-03-resonate` | `U03-SCN-GRATITUDE-01` | 匿名石板、共鸣光、温暖指数 | verified |
| `u03-completion-harmony-gate` | `U03-SCN-GRATITUDE-01`、徽章、NXZ | 四部件生长、开门、成长轨迹 | verified |
| `u03-relation-01-network` | `U03-SCN-RELATION-01` | 种子盘、五级植物、关系连线 | verified |
| `u03-relation-02-style` | `U03-SCN-RELATION-01`、全局打字机 | 齿轮、出纸、类型报告 | verified |
| `u03-relation-03-plan` | `U03-SCN-RELATION-01` | 白板、日历、水滴、植物新叶 | verified |
| `u03-empathy-01-role` | `U03-SCN-EMPATHY-01`、`U03-NPC-EMPATHY-01` | 抽卡、翻牌、换装聚光 | verified |
| `u03-empathy-02-dialogue` | 同上 | 字幕/内心独白、理解/信任曲线 | verified |
| `u03-empathy-03-review` | 同上 | 导演回放、平行分屏、指标 | verified |

## 5. 明确由代码实现

所有文字、问题、聊天窗口、卡片排版、按钮、旗帜图标、进度板数据、雷达图、折线、波形、聚光灯、光带、粒子、天平、植物生长、关系连线、感恩主题图案和徽章图案均随状态或数据变化，使用 DOM/CSS/SVG 实现，不生成固化位图。

## 6. 生成与 QA 记录

- 生成方式：built-in `image_gen`；概念图只作空间、色彩与质感参考。
- 源文件：`artifacts/imagegen/unit-03/`；成品：`public/assets/unit-03/`。
- 透明清理：`prepare_transparent_asset.py`，背景 `#ff00ff`，threshold 50、feather 110；三组透明素材四角 alpha 均为 0。
- QA：`docs/assets/reports/unit-03/scene-contact-sheet.jpg`、`storyboard-contact-sheet.jpg`、`transparent-dark-contact-sheet.png` 及三份透明 JSON 报告；新增场地对比与拆分分镜见 `docs/assets/reports/interaction-repairs/unit-03-venue-comparison-desktop.png`、`unit-03-case-001-desktop.png`、`unit-03-case-002-desktop.png` 和 `unit-03-case-002-mobile.png`。
- 日期：2026-07-27；版本：v001；场景无字/无假 UI、故事板事件连续、人物身份与动作可辨，人工检查通过。
