# 第四单元素材清单与覆盖台账

状态：`planned` → `prompt-ready` → `generated` → `cleaned` → `approved`；代码项使用 `planned-code/implemented-code`；外部授权项使用 `blocked-external`。

## 1. 单元专属素材

| 编号 | 用途 | 规格与路径 | 版本 | 状态 | 复用 | QA |
|---|---|---|---|---|---|---|
| `U04-SCN-LEARN-01` | 智慧农业学习空间，三阶圆台 | 1920x1080 WebP；`public/assets/unit-04/scenes/learning-space-v001.webp` | v001 | approved | U04 | 无字/三光球/安全区通过 |
| `U04-SCN-LIVE-01` | 农产品直播话术训练间 | 1920x1080 WebP；`public/assets/unit-04/scenes/live-studio-v001.webp` | v001 | approved | U04/U01 直播任务可评估 | 补光灯/空白弹幕屏通过 |
| `U04-SCN-AI-01` | AI 创新实验室，三终端工作台 | 1920x1080 WebP；`public/assets/unit-04/scenes/ai-lab-v001.webp` | v001 | approved | U04 | 三空白终端/协作位通过 |
| `U04-SCN-CINEMA-01` | 新农人成长影院 | 1920x1080 WebP；`public/assets/unit-04/scenes/growth-cinema-v001.webp` | v001 | approved | U04/U05 可评估 | 星空/空幕/三卡位通过 |
| `U04-SCN-PLAN-01` | 梦想规划工作室与四季窗 | 1920x1080 WebP；`public/assets/unit-04/scenes/planning-studio-v001.webp` | v001 | approved | U04/U05 可评估 | 地图/信箱/水晶球通过 |
| `U04-SCN-METHOD-01` | 农业科技图书馆方法专区 | 1920x1080 WebP；`public/assets/unit-04/scenes/method-library-v001.webp` | v001 | approved | U04 | 三方法书/练习桌通过 |
| `U04-SCN-ARENA-01` | 五门数字技能竞技场 | 1920x1080 WebP；`public/assets/unit-04/scenes/digital-arena-v001.webp` | v001 | approved | U04 | 五色门/空榜/无字通过 |
| `U04-NPC-AI-01` | 蓝白农业 AI 助手全身悬浮姿态 | 透明 PNG 974x1222；`public/assets/unit-04/characters/ai-assistant-v001.png` | v001 | approved | U04/U05 可评估 | alpha/深底/完整轮廓通过 |
| `U04-STORY-ZHAO-01` | 小赵从打工到直播的三镜头故事板 | 1536x768 WebP；`public/assets/unit-04/storyboards/xiaozhao-v001.webp` | v001 | approved | U04 | 学习/首播/成长连续通过 |
| `U04-STORY-HUA-01` | 阿花姐返乡智慧农场三镜头故事板 | 1536x768 WebP；`public/assets/unit-04/storyboards/ahuajie-v001.webp` | v001 | approved | U04 | 调研/设计/改造连续通过 |
| `U04-STORY-ZHOU-01` | 老周 60 岁学电商三镜头故事板 | 1536x768 WebP；`public/assets/unit-04/storyboards/laozhou-v001.webp` | v001 | approved | U04 | 学电脑/复盘/直播连续通过 |

## 2. 外部与全局复用

| 编号 | 用途 | 状态 |
|---|---|---|
| `U04-VIDEO-STORIES-01..03` | 三位新农人正式 5 分钟视频 | blocked-external；需课程方授权与成片 |
| `G-CHAR-NXZ-GUIDE/ENCOURAGE-01` | 学习伙伴、课堂分身、反馈与结业 | approved |
| `G-PROP-DRONE-01` | 无人机学习材料和识别练习 | approved |
| `G-CROP-DISEASE-01..03` | AI 图像识别终端真实教学样本 | approved |
| `G-PROP-TOMATO-DISPLAY-01` | 直播实战产品展架 | approved |
| `G-PROP-STRATEGY-CASE-01` | 学习方法收藏与结业道具 | approved |
| `G-UI-BADGE-BASE-01` | 智创未来、学习方法、数字技能徽章 | approved |

## 3. 逐互动视觉覆盖

| 范围 | 场景/素材 | 代码动态 | 状态 |
|---|---|---|---|
| `u04-learn-01..06` | `U04-SCN-LEARN-01`、无人机 | 光球、全息板、12 图标拖拽、星级、数据看板、反思本 | implemented-code；桌面/移动 QA 通过 |
| `u04-learn-07..09` | `U04-SCN-LIVE-01`、番茄展示组 | 话术结构、弹幕、补光、信封门控、雷达 | implemented-code；交互 QA 通过 |
| `u04-ai-01..04` | `U04-SCN-AI-01`、`U04-NPC-AI-01`、病害样本 | 三终端状态机、协作流、投票、信心充电 | implemented-code；确定性模拟 QA 通过 |
| `u04-story-01..03` | `U04-SCN-CINEMA-01`、三套故事板 | 三镜头播放器、字幕/笔记、星空问答、感悟星 | implemented-code；媒体控制 QA 通过 |
| `u04-plan-01..03`、结业 | `U04-SCN-PLAN-01`、NXZ、徽章 | 数据时间轴、四季、12 格学习地图、火漆信封、水晶球 | implemented-code；私密字段 QA 通过 |
| `u04-method-01..03` | `U04-SCN-METHOD-01`、NXZ | 番茄环、8 节点思维导图生长、课堂表情 | implemented-code；过程动画 QA 通过 |
| `u04-digital-01..03` | `U04-SCN-ARENA-01`、AI 助手 | 五门场景、三门已定义互动、搜索核验、图表变换、审校轨迹 | implemented-code；原题边界 QA 通过 |

## 4. 代码实现边界

文字、题目、屏幕 UI、图表、计时器、12 个功能图标、拖放、光球、粒子、弹幕、终端内容、匿名票柱、电池、星空光点、播放器控件、思维导图节点、四季天气、计划表、信封、火漆、徽章图案均必须随数据变化，使用 DOM/CSS/SVG/Canvas，不生成固化位图。

## 5. 生成与 QA 门禁

- 概念图只作色彩、空间层次和氛围参考，不从合成图抠取素材。
- 场景无人、无文字、无假 UI，保留前端叠层安全区；故事板检查人物身份和事件连续；透明 AI 助手检查四角 alpha、白底/深底/棋盘格。
- 生成完成后补实际源文件、尺寸、日期、状态和 QA 报告；素材文件若无法反查到本表和提示词文档，`asset:audit` 必须失败。

## 6. v001 生成与 QA 记录

- 生成方式：built-in `imagegen`；源文件位于 `artifacts/imagegen/unit-04/`，概念图仅作风格参考。
- 场景与故事板：WebP q88/q90；联系表为 `docs/assets/reports/unit-04/scene-contact-sheet.jpg` 和 `storyboard-contact-sheet.jpg`。
- AI 助手：`transparent-visual-assets`，背景 `#ff00ff`、threshold 50、feather 110、trim+24px；报告 `docs/assets/reports/unit-04/ai-assistant-v001.json`，深底图 `ai-assistant-dark.png`。
- 日期：2026-07-27；人工检查通过，无可读文字/假 UI，故事连续性和交互安全区合格。
