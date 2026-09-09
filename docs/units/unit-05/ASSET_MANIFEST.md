# 第五单元素材清单与覆盖台账

状态：`planned` → `prompt-ready` → `generated` → `approved`；代码项使用 `planned-code/implemented-code`；外部项使用 `blocked-external`。

## 1. 新增位图素材

| 编号 | 用途 | 规格与目标路径 | 版本 | 状态 | 复用 | QA |
|---|---|---|---|---|---|---|
| `U05-SCN-PATH-01` | 50 米全息职业发展长廊 | 1920x1080 WebP；`public/assets/unit-05/scenes/career-corridor-v001.webp` | v001 | approved | U05 | 通过；长廊纵深、空屏和叠加区清晰，无人无字 |
| `U05-SCN-MEMORY-01` | 圆形成长记忆馆与中央成长树 | 1920x1080 WebP；`public/assets/unit-05/scenes/memory-gallery-v001.webp` | v001 | approved | U05/档案可评估 | 通过；四弧屏、成长树和环形空间可辨 |
| `U05-SCN-MATCH-01` | 蜂巢岗位匹配分析室 | 1920x1080 WebP；`public/assets/unit-05/scenes/match-lab-v001.webp` | v001 | approved | U05/档案可评估 | 通过；中央台与五岗位叠加区完整 |
| `U05-SCN-PLAN-01` | 生涯规划工坊 | 1920x1080 WebP；`public/assets/unit-05/scenes/planning-workshop-v001.webp` | v001 | approved | U05 | 通过；工作台、终端和窗景层次清晰 |
| `U05-SCN-DREAM-01` | 星空梦想发布大厅 | 1920x1080 WebP；`public/assets/unit-05/scenes/dream-hall-v001.webp` | v001 | approved | U05/结业 | 通过；梦想墙、讲台与光之门独立可辨 |
| `U05-SCN-PROPHECY-01` | 预言水晶球室 | 1920x1080 WebP；`public/assets/unit-05/scenes/prophecy-room-v001.webp` | v001 | approved | U05 | 通过；水晶球、书台与时间节点留白完整 |
| `U05-SCN-POST-01` | 时光邮局 | 1920x1080 WebP；`public/assets/unit-05/scenes/time-post-office-v001.webp` | v001 | approved | U05 | 通过；柜台、三信封和铜信箱清楚，无字 |
| `U05-END-STAR-01` | 星光大道结局 | 1920x1080 WebP；`public/assets/unit-05/endings/starlight-road-v001.webp` | v001 | approved | U05 | 通过；道路与企业/农场远景明确，可叠加纸飞机 |
| `U05-END-DAWN-01` | 晨光之路结局 | 1920x1080 WebP；`public/assets/unit-05/endings/dawn-road-v001.webp` | v001 | approved | U05 | 通过；乡路、服务站与目标灯光明确 |
| `U05-END-SEED-01` | 种子发芽结局 | 1920x1080 WebP；`public/assets/unit-05/endings/seedling-field-v001.webp` | v001 | approved | U05 | 通过；嫩芽、雨景与远光明确，可叠加雨丝 |

## 2. 全局复用

| 全局编号/范围 | 本单元用途 | 规则 |
|---|---|---|
| `G-NXZ-GUIDE-01`、`G-NXZ-ENCOURAGE-01` | 生涯导师、讲台寄语、结局陪伴 | 复用现有标准形象，不重复生成不一致版本；“正装/未来同事/园丁”首版用场景语义和姿态状态表达，不虚构新服装素材 |
| `G-ROLE-*-F/M-01` 共 10 件 | 五岗位全息投影、岗位匹配分析 | 每个岗位支持男女形象切换；全息发光由 CSS 实现 |
| 第一至第四单元素材 | 关键转折回放、总结照片墙 | 只复用已批准场景/角色；镜头动画由代码实现 |
| `G-BADGE-BASE-01` | 筑梦远航/未来结局徽章底 | 颜色、文字和等级由代码叠加 |

## 3. 代码实现视觉覆盖

| 范围 | 位图 | 代码动态 | 状态 |
|---|---|---|---|
| `u05-path-01..05` | 长廊、五职业全局角色 | 全息、五级阶梯、阶段面板、三组岔路、指南针、塌方与光带 | implemented-code |
| `u05-memory-01..03` | 记忆馆、前序场景 | 成长树粒子、三层雷达、回放播放器、对比镜拖动 | implemented-code |
| `u05-match-01..02` | 匹配室、五职业角色 | 证据分数、环形图、五维条、挑战翻面 | implemented-code |
| `u05-plan-01..07` | 规划工坊 | 系统启动、结构化编辑、SMART、甘特、循环仪表、合书/翻页/签名 | implemented-code |
| `u05-dream-01..03` | 梦想大厅、NXZ、前序场景 | 砖块编辑、公开范围、粒子、点赞/加油/留言、照片墙 | implemented-code |
| `u05-ending-01` | 三结局背景、NXZ | 规则证据、未来门、纸飞机/晨光/雨丝、结局徽章 | implemented-code |
| `u05-prophecy-01..02` | 预言室 | 翻页、五节点时间轴、轨迹 SVG、缺题状态 | implemented-code |
| `u05-letter-01..02` | 时光邮局 | 信封选择、编辑、火漆、折叠和飞行 | implemented-code |

## 4. 不生成项

- 雷达图、岗位分数、阶梯文字、甘特图、计划表、梦想卡、时间轴、粒子、纸飞机、雨丝和徽章文字均为实时数据/状态，不生成图片。
- 不生成重复职业角色或农小智；不从概念图裁切合成元素。
- 语音和正式全体合影素材未提供，状态为 `blocked-external`；首版使用同步字幕和动态场景照片墙，并在界面明确标注。

## 5. 生成与 QA 记录

- 生成日期：2026-07-27；工具：built-in `imagegen`；源文件：`artifacts/imagegen/unit-05/*-source.png`；成品：1920x1080 WebP，v001。
- 10 件新增位图逐件通过无可读文字、无人物、构图、色彩、叠加安全区和路径反查检查；合成复核图为 `docs/assets/reports/unit-05/scene-contact-sheet.jpg`。
- 页面 QA：`unit-map-desktop.png`、`unit-map-mobile.png`、`career-path-desktop.png`、`career-path-authored-question.png`、`teacher-dashboard-desktop.png` 已归档至 `docs/assets/reports/unit-05/`；桌面、390px 移动端和教师长页均无重叠或文字溢出。
- 素材勾稽脚本通过：85 个实际文件、84 个代码引用均可反查；未引用的 1 件为全局预留素材，不属于漏用。


## 课堂框架第一步素材复用
复用 public/assets/global/characters/nongxiaozhi/portrait-v002.png 与 public/assets/unit-05/scenes/career-corridor-v001.webp。图标、状态灯、计时器、阶段进度由页面绘制；本步骤无需新图片或音频。

## 行业冲击第二步素材规划
复用 public/assets/unit-04/scenes/live-studio-v001.webp（助农直播场景）、public/assets/global/roles/anchor-f-v001.png（主播）、public/assets/global/characters/nongxiaozhi/portrait-v002.png（农小智）。张大叔及团队联系人用首字头像；教学方未提供西瓜产品原图，使用明确的示意插画（内联 SVG），后续可替换实物产品图。无需生成重复场景或职业人物。
拟新增 public/assets/unit-05/audio/farmer-impact-v001.mp3（TTS 男声，手册原句）；新闻和电话提示用 Web Audio 合成可静音短音。TTS 生成后记录声音及资源验证；无法生成不得伪称已配音。
已生成：public/assets/unit-05/audio/farmer-impact-v001.mp3，中文合成男声（Yunjian），课堂前预加载；字幕保留手册完整原文。普通话音色，方言口音不是本次已验证效果。

## 课堂第三步
复用 public/assets/global/characters/nongxiaozhi/portrait-v002.png 与 public/assets/unit-05/scenes/career-corridor-v001.webp；环形进度、TOP3、阅读进度和路径箭头用 CSS/SVG 与图标绘制，数值动态绑定。无新增位图或音频资源。

## 课堂第四步素材
复用 public/assets/global/characters/nongxiaozhi/portrait-v002.png；前一阶段直播背景仍沿用全局已有素材，决策面板使用可读字幕与动态选项。已生成 public/assets/unit-05/audio/farmer-decision-v001.mp3（张大叔升级诉求，中文合成男声，完整字幕）。四选项、热力统计、直方图与迷你曲线由代码绘制；不生成重复角色图片。

第四步素材 QA：2026-09-09，MP3 43,632 字节；浏览器验证时长超过 5 秒、实际播放、课堂暂停同步停止。教室大屏 1920×1080 显示完整分布与讨论提示，手机 390×844 无横向溢出。图标/直方图/模拟曲线均为动态数据绘制，99 件素材与 93 个引用审计通过。

## 课堂第五步素材
复用 public/assets/global/characters/nongxiaozhi/portrait-v002.png。三层同心圆、光晕、勾选、错误提示和班级汇总图通过 SVG/CSS 绘制，以真实映射记录驱动；无需新图片或音频。蓝/绿/橙层级同时具备文字和位置标识，避免只依赖颜色辨识。

第五步 QA：复用的农小智正常显示，三层圈保持蓝/绿/橙底色与文字区分，正确时增加绿色轮廓和勾选。无新增素材；素材审计为99个文件、93个代码引用。截图在工作区 outputs/第五步-教师大屏.png、第五步-三层框架完成.png、第五步-三层框架手机.png、第五步-映射重试.png（不写入源码仓库）。

## 剩余步骤六至八
复用 public/assets/global/characters/nongxiaozhi/portrait-v002.png。地图、标签、进度、投票、三信号表和导出图形均使用CSS/SVG，保留可读文字。不新增重复角色或场景；框架正确/错误反馈及倒计时可选声音用Web Audio生成，默认关闭，文字反馈始终存在。

完成实现：未新增位图，继续使用统一农小智 portrait-v002.png。新增倒计时900Hz短音与映射正误音通过 Web Audio 按需合成，无外部音频请求；原张大叔两段TTS音频保留。档案HTML自包含样式与文字地图，离线保存/打印无需加载外部资源。

最终素材QA：99文件/93引用审计通过。地图、投票、档案截图位于工作区outputs及Chrome/Tablet子目录；未将测试学生截图混入正式教学素材。
