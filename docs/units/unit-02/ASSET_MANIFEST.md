# 第二单元素材清单与视觉覆盖

## 1. 状态与范围

状态流转：`planned` → `prompt-ready` → `generated` → `cleaned` → `approved`。本表已完成素材 G2 与页面 G4 复核，实际尺寸和 QA 记录见各表及第 8 节。

## 2. 场景背景

| 素材编号 | 用途 | 规格 | 路径 | 版本 | 当前状态 | 复用范围 | QA |
|---|---|---|---|---|---|---|---|
| `U02-SCN-MIRROR-01` | 自我认知镜像屋 | 1920x1080 WebP | `public/assets/unit-02/scenes/mirror-house-v001.webp` | v001 | approved | U02 | 无人物/文字/假 UI；构图通过 |
| `U02-SCN-FRUSTRATION-01` | 四季天气挫折田野 | 1920x1080 WebP | `public/assets/unit-02/scenes/frustration-field-v001.webp` | v001 | approved | U02 | 天空与前景留白通过 |
| `U02-SCN-LAB-01` | 三色分区情绪实验室 | 1920x1080 WebP | `public/assets/unit-02/scenes/emotion-lab-v001.webp` | v001 | approved | U02 | 三分区清晰、屏幕无内容 |
| `U02-SCN-GARDEN-01` | 青春花园与成长总结 | 1920x1080 WebP | `public/assets/unit-02/scenes/youth-garden-v001.webp` | v001 | approved | U02 | 成长树叠加区通过 |
| `U02-SCN-TREEHOLE-01` | 心灵树洞 | 1920x1080 WebP | `public/assets/unit-02/scenes/tree-hole-v001.webp` | v001 | approved | U02 | 温暖且无压迫感 |
| `U02-SCN-ENERGY-01` | 情绪能量站 | 1920x1080 WebP | `public/assets/unit-02/scenes/energy-station-v001.webp` | v001 | approved | U02 | 三层轨道与中央留白通过 |

## 3. 透明装置与道具

| 素材编号 | 用途 | 规格 | 路径 | 版本 | 当前状态 | 复用范围 | QA |
|---|---|---|---|---|---|---|---|
| `U02-PROP-MIRROR-FRAME-01` | 麦穗电路椭圆镜框；镜面由代码填充 | 透明 PNG，933x1484 | `public/assets/unit-02/props/mind-mirror-frame-v001.png` | v001 | approved | U02 | 四角/中心透明，三底色通过 |
| `U02-PROP-GROWTH-SCROLL-01` | 成长卷轴底板 | 透明 PNG，1454x738 | `public/assets/unit-02/props/growth-scroll-v001.png` | v001 | approved | U02 | 四角透明，三底色通过 |

## 4. 表情教学图

六张均为第二单元教学样本，不作为真实心理测量，不对应真实学生；场景和人物保持同一美术体系但表情必须清晰可辨。

| 素材编号 | 情绪 | 规格/路径 | 版本 | 当前状态 | QA |
|---|---|---|---|---|---|
| `U02-EDU-EXPR-ANGER-01` | 愤怒 | 768x768 WebP；`public/assets/unit-02/expressions/anger-v001.webp` | v001 | approved | 表情可辨、无文字 |
| `U02-EDU-EXPR-ANXIETY-01` | 焦虑 | 768x768 WebP；`public/assets/unit-02/expressions/anxiety-v001.webp` | v001 | approved | 表情可辨、无文字 |
| `U02-EDU-EXPR-JOY-01` | 开心 | 768x768 WebP；`public/assets/unit-02/expressions/joy-v001.webp` | v001 | approved | 表情可辨、无文字 |
| `U02-EDU-EXPR-SADNESS-01` | 悲伤 | 768x768 WebP；`public/assets/unit-02/expressions/sadness-v001.webp` | v001 | approved | 表情可辨、无文字 |
| `U02-EDU-EXPR-FEAR-01` | 恐惧 | 768x768 WebP；`public/assets/unit-02/expressions/fear-v001.webp` | v001 | approved | 表情可辨、无文字 |
| `U02-EDU-EXPR-SURPRISE-01` | 惊讶 | 768x768 WebP；`public/assets/unit-02/expressions/surprise-v001.webp` | v001 | approved | 表情可辨、无文字 |

## 5. 全局复用

| 全局素材 | 第二单元用途 | 状态 |
|---|---|---|
| `G-CHAR-NXZ-GUIDE-01` / `G-CHAR-NXZ-ENCOURAGE-01` | 引导、温和提示、结业反馈 | approved |
| `G-ROLE-ANCHOR/FARM/BRAND/OPS/FOUNDER-*-01` | 镜像显影、岗位挫折与演练 | approved |
| `G-PROP-TOMATO-DISPLAY-01` | 团队成果展评产品主体 | approved |
| `G-PROP-STRATEGY-TOOLBOX-01` | 四槽应对策略工具箱 | approved |
| `G-PROP-TYPEWRITER-01` | 情绪翻译与后续沟通训练 | approved |
| `G-PROP-STRATEGY-CASE-01` | TOP3 策略收纳箱 | approved |
| `G-UI-BADGE-BASE-01` | 第二单元“心灵成长”徽章底板 | approved |

## 6. 逐交互视觉覆盖表

| 交互 ID | 稳定视觉对象 | 实现方式/编号 | 动态效果 | 状态 |
|---|---|---|---|---|
| `u02-mirror-01-activate` | 镜像屋、镜框、职业角色、农小智 | `UNIT` U02-SCN-MIRROR-01/U02-PROP-MIRROR-FRAME-01；`GLOBAL` 角色/NXZ | `CODE` 涟漪、粒子、气泡、加载 | verified |
| `u02-mirror-02-growth-scroll` | 卷轴、农小智 | `UNIT` U02-PROP-GROWTH-SCROLL-01；`GLOBAL` NXZ | `CODE` 展开、拖拽、回弹 | verified |
| `u02-mirror-03-swot` | 镜像屋 | `UNIT` U02-SCN-MIRROR-01 | `CODE` 罗盘、旋转、雷达 | verified |
| `u02-frustration-01-live-crisis` | 田野、主播角色 | `UNIT` U02-SCN-FRUSTRATION-01；`GLOBAL` 主播 | `CODE` 天气、直播间、弹幕、心率 | verified |
| `u02-frustration-02-emotion-dial` | 田野 | `UNIT` U02-SCN-FRUSTRATION-01 | `CODE` 仪表、拖拽、着陆法 | verified |
| `u02-frustration-03-coping-toolbox` | 工具箱 | `GLOBAL` G-PROP-STRATEGY-TOOLBOX-01 | `CODE` 开盖、工具、人数、星级 | verified |
| `u02-frustration-04-farm-crisis` | 田野、农场角色 | `UNIT` 田野；`GLOBAL` 农场角色 | `CODE` 报警、温度、排序 | verified |
| `u02-frustration-05-brand-rejection` | 田野转会议层、品牌角色 | `UNIT` 田野；`GLOBAL` 品牌角色 | `CODE` 会议遮罩、分支时间线 | verified |
| `u02-lab-01-expression-decoder` | 实验室、6 表情图 | `UNIT` U02-SCN-LAB-01/U02-EDU-EXPR-* | `CODE` 六屏、拖放、粒子/震动 | verified |
| `u02-lab-02-emotion-translator` | 打字机、表情图 | `GLOBAL` G-PROP-TYPEWRITER-01；`UNIT` U02-EDU-EXPR-* | `CODE` 打字、纸带、反应切换 | verified |
| `u02-lab-03-regulation-cabin` | 实验室 | `UNIT` U02-SCN-LAB-01 | `CODE` 舱体、计时、五类体验、宝石 | verified |
| `u02-team-01-role-claim` | 花园 | `UNIT` U02-SCN-GARDEN-01 | `CODE` 五类 Lucide 矢量角色图标、加大字号、3D 徽章与翻面 | verified |
| `u02-team-02-communication` | 花园 | `UNIT` U02-SCN-GARDEN-01 | `CODE` 温度计与参与光圈 | verified |
| `u02-team-03-showcase` | 花园、番茄展示组 | `UNIT` 花园；`GLOBAL` 番茄组 | `CODE` 海报、鲜花、雷达 | verified |
| `u02-completion-growth-tree` | 花园、徽章底板、农小智 | `UNIT` 花园；`GLOBAL` 徽章/NXZ | `CODE` 数据成长树和花瓣 | verified |
| `u02-treehole-01-write` | 树洞、农小智 | `UNIT` U02-SCN-TREEHOLE-01；`GLOBAL` NXZ | `CODE` 烛光、折纸飞机、轨迹 | verified |
| `u02-treehole-02-respond` | 树洞 | `UNIT` U02-SCN-TREEHOLE-01 | `CODE` 匿名纸飞机与暖光 | verified |
| `u02-treehole-03-receive` | 树洞 | `UNIT` U02-SCN-TREEHOLE-01 | `CODE` 信封、花朵、花束 | verified |
| `u02-energy-01-collect` | 能量站、能量箱 | `UNIT` U02-SCN-ENERGY-01；`GLOBAL` G-PROP-STRATEGY-CASE-01 | `CODE` 轨道、计时、宝石、拖排 | verified |
| `u02-energy-02-card` | 能量站 | `UNIT` U02-SCN-ENERGY-01 | `CODE` 应急卡与打印样式 | verified |
| `u02-energy-03-practice` | 能量站、职业角色 | `UNIT` 能量站；`GLOBAL` 职业角色 | `CODE` 三步状态与恢复条 | verified |

## 7. 明确不生成的效果

镜面液体、星空粒子、能力气泡、天气、弹幕、直播人数、心率、情绪表盘、SWOT 罗盘、雷达图、三色光带、调节球、团队徽章、角色职能图标、海报文字、成长树、纸飞机、花瓣、能量轨道、宝石、急救卡和图表均由代码实现。它们随状态或数据变化，不得固化为图片。

## 8. 页面引用与 G4 复核

- 页面：`/student/unit-02`、`/student/unit-02/activity/[interactionId]`、`/student/progress`、`/teacher/dashboard`。
- 截图：`docs/assets/reports/unit-02/page-map-desktop.png`、`page-map-mobile.png`、`page-mirror-desktop.png`、`page-teacher-desktop.png`。
- 2026-07-26 已检查桌面、Pixel 5、默认/操作/完成状态、素材路径反查、教师隐私边界与减少动态样式；状态 `verified`。
