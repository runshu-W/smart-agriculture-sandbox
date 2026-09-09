# 第一单元素材清单

## 1. 清单字段与状态

每项记录素材编号、用途、类型、规格、保存路径、版本、状态和复用范围。生成完成后追加最终提示词、生成方式、源文件和 QA 报告。

## 2. M1 必需素材

| 素材编号 | 用途 | 类型/规格 | 保存路径 | 版本 | 状态 | 复用 |
|---|---|---|---|---|---|---|
| `U01-SCN-TRAD-HALL-01` | 传统农业馆与脱粒机样板背景 | 1920x1080 WebP；源 PNG | `public/assets/unit-01/scenes/traditional-hall-v001.webp` | v001 | approved | 第一单元专属 |
| `G-CHAR-NXZ-GUIDE-01` | 样板农小智引导 | 透明 PNG，776x1199 | `public/assets/global/characters/nongxiaozhi/guide-v001.png` | v001 | approved | 全局 |
| `U01-PROP-THRESHER-01` | 手摇脱粒机主体 | 透明 PNG，917x946 | `public/assets/unit-01/props/thresher-body-v001.png` | v001 | approved | 第一单元专属 |
| `U01-PROP-THRESHER-HANDLE-01` | 可旋转摇柄 | 前端 SVG/DOM | 代码生成 | v001 | implemented-code | 第一单元专属 |
| `U01-FX-RICE-01` | 稻粒喷出效果 | Canvas 2D | 代码生成 | v001 | implemented-code | 可复用粒子逻辑 |
| `U01-AUDIO-TRAD-02-01` | 脱粒机讲解 | MP3/OGG + 字幕 | `public/assets/unit-01/audio/trad-02-v001.mp3` | v001 | blocked-external | 第一单元专属 |

M1 允许音频显示明确缺失状态并使用字幕继续；其余三项图片不得使用概念图裁切代替最终素材。

## 3. 主线场景与道具

| 素材族 | 主要内容 | 类型 | 状态 | 复用判断 |
|---|---|---|---|---|
| 入口大厅 | 智慧农业元宇宙入口、邀请函氛围 | 背景图 | approved | U01 专属背景，农小智全局 |
| 传统农业馆 | 稻田、茅草屋、农具墙、木犁黄牛、蓑衣斗笠、节气牌 | 背景 + 透明道具 | approved | 农具 U01 专属 |
| 现代农业馆 | 麦田、大棚、控制箱、滴灌管、阀门 | 背景 + CSS/SVG/Canvas 状态效果 | 背景 approved；状态效果 implemented-code | 收割机改用全局透明设备，大棚控制逻辑可供 U04 复用 |
| 智慧农业馆 | 田块、分析区、数据屏 | 背景 + DOM/Canvas 状态效果 | 背景 approved；状态效果 implemented-code | 无人机、传感器和病害样本改用全局素材 |
| 岗位体验中心 | 环形大厅与五体验舱 | 背景图 + DOM 工作台 | approved | U01 专属背景，工作台控件可复用 |
| 五岗位舱内 | 主播、农场控制、品牌、订单、创业工作台 | 共享中心背景 + 五套 DOM 工作台 | implemented-code | 表单和参数控件跨单元复用 |
| 测评空间 | 测评、ECharts 雷达、角色卡纹理 | 全局背景 + ECharts/SVG/CSS | implemented-code | 角色卡框全局复用 |
| 结业 | 时代认知勋章 | 全局 SVG 底板 + U01 SVG 图案 + 农小智透明角色 | approved | 徽章底板全局、图案 U01 |

### M2-A 细化素材

| 素材编号 | 用途 | 类型/规格 | 保存路径 | 版本 | 状态 | 复用 |
|---|---|---|---|---|---|---|
| `U01-SCN-ENTRY-HALL-01` | 第一单元邀请函入口大厅 | 1920x1080 WebP，无人物和文字 | `public/assets/unit-01/scenes/entry-hall-v001.webp` | v001 | approved | 第一单元专属 |
| `U01-PROP-OX-PLOW-01` | 牛耕演示移动主体 | 透明 PNG，1577x690 | `public/assets/unit-01/props/ox-plow-v001.png` | v001 | approved | 第一单元专属 |
| `U01-PROP-RAIN-GEAR-01` | 蓑衣斗笠细节展示 | 透明 PNG，1139x1122 | `public/assets/unit-01/props/rain-gear-v001.png` | v001 | approved | 第一单元专属 |
| `U01-FX-SOIL-01` | 犁头翻土粒子 | Canvas 2D | 代码生成 | v001 | implemented-code | 可复用粒子逻辑 |
| `U01-UI-SEASON-BOARD-01` | 二十四节气翻牌与农谚 | CSS 3D + DOM 文字 | 代码生成 | v001 | implemented-code | 第一单元专属 |

## 4. 支线素材

| 素材编号/族 | 用途 | 状态 | 说明 |
|---|---|---|---|
| `U01-SCN-STORY-HALL-01` | 环形新农人故事馆 | approved | `public/assets/unit-01/scenes/story-hall-v001.webp`；无文字背景，展柜由 DOM 定位 |
| `U01-MEDIA-STORY-01..10` | 十位新农人纪实视频 | blocked-external | 外部提供，需记录人物授权和字幕 |
| `U01-SCN-IMPRESSION-01` | 职业初印象墙 | reused | 复用岗位体验中心背景；便签和文字由代码生成 |
| `U01-UI-STICKER-SET-01` | 感悟卡装饰 | implemented-code | 首版使用 CSS 与 Lucide 图标，避免无效位图增量 |
| `U01-MEDIA-STORY-POSTER-01..10` | 十位新农人授权人物封面 | blocked-external | 校方/权利人提供，逐项登记姓名、授权、来源和替代文本；不得生成虚构真人 |

## 4.1 2026-07-26 素材完整性审计补齐项

| 素材编号 | 第一单元用途 | 类型/规格 | 路径 | 版本 | 状态 | 复用 |
|---|---|---|---|---|---|---|
| `G-ROLE-ANCHOR-F-01` | 主播舱、测评报告、女角色卡 | 透明 PNG，746x1409 | `public/assets/global/roles/anchor-f-v001.png` | v001 | approved | 全局 |
| `G-ROLE-ANCHOR-M-01` | 主播舱、测评报告、男角色卡 | 透明 PNG，692x1368 | `public/assets/global/roles/anchor-m-v001.png` | v001 | approved | 全局 |
| `G-ROLE-FARM-F-01` | 农场运营舱、测评报告、女角色卡 | 透明 PNG，551x1573 | `public/assets/global/roles/farm-f-v001.png` | v001 | approved | 全局 |
| `G-ROLE-FARM-M-01` | 农场运营舱、测评报告、男角色卡 | 透明 PNG，607x1545 | `public/assets/global/roles/farm-m-v001.png` | v001 | approved | 全局 |
| `G-ROLE-BRAND-F-01` | 品牌策划舱、测评报告、女角色卡 | 透明 PNG，557x1386 | `public/assets/global/roles/brand-f-v001.png` | v001 | approved | 全局 |
| `G-ROLE-BRAND-M-01` | 品牌策划舱、测评报告、男角色卡 | 透明 PNG，785x1679 | `public/assets/global/roles/brand-m-v001.png` | v001 | approved | 全局 |
| `G-ROLE-OPS-F-01` | 电商运营舱、测评报告、女角色卡 | 透明 PNG，563x1395 | `public/assets/global/roles/ops-f-v001.png` | v001 | approved | 全局 |
| `G-ROLE-OPS-M-01` | 电商运营舱、测评报告、男角色卡 | 透明 PNG，569x1419 | `public/assets/global/roles/ops-m-v001.png` | v001 | approved | 全局 |
| `G-ROLE-FOUNDER-F-01` | 创业舱、测评报告、女角色卡 | 透明 PNG，562x1542 | `public/assets/global/roles/founder-f-v001.png` | v001 | approved | 全局 |
| `G-ROLE-FOUNDER-M-01` | 创业舱、测评报告、男角色卡 | 透明 PNG，548x1400 | `public/assets/global/roles/founder-m-v001.png` | v001 | approved | 全局 |
| `G-PROP-HARVESTER-01` | 联合收割互动主体 | 透明 PNG，1517x750 | `public/assets/global/props/harvester-v001.png` | v001 | approved | 全局 |
| `G-PROP-DRONE-01` | 无人机互动主体 | 透明 PNG，1458x832 | `public/assets/global/props/drone-v001.png` | v001 | approved | 全局 |
| `G-PROP-SOIL-SENSOR-01` | 土壤传感器互动主体 | 透明 PNG，465x1354 | `public/assets/global/props/soil-sensor-v001.png` | v001 | approved | 全局 |
| `G-CROP-DISEASE-01` | AI 识别番茄早疫叶斑样本 | 768x768 WebP | `public/assets/global/crops/disease-tomato-early-blight-v001.webp` | v001 | approved | 全局 |
| `G-CROP-DISEASE-02` | AI 识别黄瓜白粉病样本 | 768x768 WebP | `public/assets/global/crops/disease-cucumber-powdery-mildew-v001.webp` | v001 | approved | 全局 |
| `G-CROP-DISEASE-03` | AI 识别小麦叶锈病样本 | 768x768 WebP | `public/assets/global/crops/disease-wheat-leaf-rust-v001.webp` | v001 | approved | 全局 |
| `G-PROP-TOMATO-DISPLAY-01` | 主播/品牌舱农产品展示 | 透明 PNG，1422x823 | `public/assets/global/props/tomato-display-v001.png` | v001 | approved | 全局 |
| `G-CHAR-NXZ-ENCOURAGE-01` | 结业鼓励反馈 | 透明 PNG，821x1381 | `public/assets/global/characters/nongxiaozhi/encourage-v001.png` | v001 | approved | 全局 |
| `G-UI-BADGE-BASE-01` | 通用勋章底板 | SVG，viewBox 200x220 | `public/assets/global/badges/base.svg` | v001 | approved | 全局 |
| `U01-UI-BADGE-ERA-01` | 时代认知勋章图案 | SVG，viewBox 200x220 | `public/assets/unit-01/ui/badge-era-v001.svg` | v001 | approved | 第一单元专属 |

## 5. 不生成的内容

- 所有标题、按钮、题目、公式、字幕、数据面板、进度、便签文字和个人角色卡文字。
- 稻粒、水滴、翻土、喷洒、扫描线、路径流光和完成粒子。
- 热点边框、选择状态、错误提示、雷达图和报告图表。

## 6. 透明素材处理记录模板

```text
素材编号：
最终提示词：
生成方式：built-in image_gen
纯色键背景：
源文件：
成品文件：
清理命令：
QA 报告：
白底/深底/棋盘格检查：
审核人/日期：
```

## 7. M1 生成记录

完整提示词见 `ASSET_PROMPTS.md` 与 `docs/assets/GLOBAL_ASSET_PROMPTS.md`。

| 素材编号 | 生成方式 | 源文件 | 处理与 QA | 日期 |
|---|---|---|---|---|
| `U01-SCN-TRAD-HALL-01` | built-in `image_gen`，新图生成 | `tmp/imagegen/traditional-hall-v001-source.png` | ImageMagick 居中裁切至 1920x1080，WebP q88；深浅区域人工检查通过 | 2026-07-26 |
| `G-CHAR-NXZ-GUIDE-01` | built-in `image_gen`，概念图仅作身份参考，#FF00FF 色键 | `tmp/imagegen/nongxiaozhi-guide-v001-source.png` | `transparent-visual-assets` 初清理；去溢色、蒙版收缩 1px、羽化 0.5px；`docs/assets/reports/G-CHAR-NXZ-GUIDE-01-v001.json`；透明/黑底检查通过 | 2026-07-26 |
| `U01-PROP-THRESHER-01` | built-in `image_gen`，概念图仅作风格参考，#FF00FF 色键 | `tmp/imagegen/thresher-body-v001-source.png` | `transparent-visual-assets` 初清理；去溢色、蒙版收缩 1px、羽化 0.5px；`docs/assets/reports/U01-PROP-THRESHER-01-v001.json`；透明/黑底检查通过 | 2026-07-26 |
| `U01-SCN-ENTRY-HALL-01` | built-in `image_gen`，概念图仅作风格参考 | `tmp/imagegen/entry-hall-v001-source.png` | 1920x1080 WebP q88；中央操作区和三时代入口检查通过 | 2026-07-26 |
| `U01-PROP-OX-PLOW-01` | built-in `image_gen`，#FF00FF 色键 | `tmp/imagegen/ox-plow-v001-source.png` | `transparent-visual-assets` 清理并去溢色、收缩 1px；`docs/assets/reports/U01-PROP-OX-PLOW-01-v001.json`；深底检查通过 | 2026-07-26 |
| `U01-PROP-RAIN-GEAR-01` | built-in `image_gen`，#00FFFF 色键 | `tmp/imagegen/rain-gear-v001-source.png` | `transparent-visual-assets` 清理并去溢色、收缩 1px；`docs/assets/reports/U01-PROP-RAIN-GEAR-01-v001.json`；细草丝和深底检查通过 | 2026-07-26 |

## 8. M0.2-B 至 M0.3 生成记录

| 素材编号 | 用途与成品 | 生成方式 | 源文件 | QA | 日期 |
|---|---|---|---|---|---|
| `U01-SCN-MODERN-HALL-01` | 现代农业馆；`public/assets/unit-01/scenes/modern-hall-v001.webp` | built-in `image_gen` | `tmp/imagegen/modern-hall-v001-source.png` | 1920x1080 WebP q88；三操作区与中央叠加区检查通过 | 2026-07-26 |
| `U01-SCN-SMART-HALL-01` | 智慧农业馆；`public/assets/unit-01/scenes/smart-hall-v001.webp` | built-in `image_gen` | `tmp/imagegen/smart-hall-v001-source.png` | 1920x1080 WebP q88；航线、传感与扫描叠加区检查通过 | 2026-07-26 |
| `U01-SCN-CAREER-HUB-01` | 五岗位体验中心；`public/assets/unit-01/scenes/career-hub-v001.webp` | built-in `image_gen` | `tmp/imagegen/career-hub-v001-source.png` | 1920x1080 WebP q88；五舱差异和工作台空间检查通过 | 2026-07-26 |
| `U01-SCN-STORY-HALL-01` | 新农人故事馆；`public/assets/unit-01/scenes/story-hall-v001.webp` | built-in `image_gen` | `tmp/imagegen/story-hall-v001-source.png` | 1920x1080 WebP q88；十展柜与媒体叠加区检查通过 | 2026-07-26 |

现代/智慧馆的设备主体使用已登记的全局透明素材；运动、无人机路径、传感数据、扫描线、岗位控件、测评图表、角色卡文字和便签仍由前端代码生成。

## 9. 2026-07-26 审计补齐记录

- 全局补齐素材的逐文件源图、尺寸、提示词和 QA 报告见 `docs/assets/GLOBAL_ASSET_MANIFEST.md` 与 `docs/assets/GLOBAL_ASSET_PROMPTS.md`。
- `U01-UI-BADGE-ERA-01` 为代码原生 SVG，成品 `public/assets/unit-01/ui/badge-era-v001.svg`，viewBox 200x220，v001；XML、中央 64% 安全区、深浅底叠加检查通过。
- 十位新农人授权封面和视频保持 `blocked-external`，未用生成素材伪造；交付条件见 `ASSET_PROMPTS.md`。
- 页面引用勾稽通过 `npm run asset:audit` 执行，当前所有实际文件、代码引用和文档登记一一对应。
