# 第五单元素材生成提示词

## 1. 统一约束

- 工具：built-in `imagegen`；用例 `stylized-concept`；输出源文件归档 `artifacts/imagegen/unit-05/`，成品转为 1920x1080 WebP。
- 风格：高品质 2.5D 写实动画电影感，智慧农业教育仿真，清晰空间层次，玻璃/木材/金属/植物材质可信。
- 构图：16:9 广角，中心或中右保留互动主体区，左侧保留标题安全区；可供前端叠加中文 UI。
- 统一避免：任何可读文字、数字、logo、水印、品牌、人物、吉祥物、内嵌 UI、过度蓝紫单色、暗到无法辨认、廉价卡通、失真透视。

## 2. 场景提示词

### `U05-SCN-PATH-01` → `career-corridor-source.png`

沉浸式 50 米职业发展全息长廊，明亮智慧农业园区建筑内景，两侧各有大型空白竖向全息屏，共能容纳五个职业展示位；地面一条从近景通往远方的发光时间轴，远端有向上延伸的阶梯轮廓，玻璃外可见温室和果园。广角低机位，近景入口留空，层次深，无人物、无文字。

### `U05-SCN-MEMORY-01` → `memory-gallery-source.png`

圆形穹顶成长记忆馆，顶部柔和星空投影，四面巨大弧形空白屏围绕空间，中央一棵半透明全息成长树，树冠由细小数据光粒组成但保持稀疏以便代码叠加，地面环形时间纹路。温暖金绿与少量科技蓝，无人无字。

### `U05-SCN-MATCH-01` → `match-lab-source.png`

深色但清晰的智慧农业岗位匹配分析室，墙面由六边形空白数据面板组成蜂巢，中央圆形全息台上方留出五个悬浮角色/图标位置，地面五条细光轨连接证据区。绿色、金色、青色平衡，专业数据实验室，无人物无字无图表。

### `U05-SCN-PLAN-01` → `planning-workshop-source.png`

安静明亮的个人生涯规划工坊，宽大工作台、关闭但可点亮的薄型智能终端、一杯热饮、空白笔记本，墙上空白“未来蓝图”画框，落地窗外智慧温室与日出天空，窗侧预留可变天光，温暖木材搭配白色科技设备。无人无字，编辑区空间充足。

### `U05-SCN-DREAM-01` → `dream-hall-source.png`

宏伟而温暖的梦想发布大厅，中央是一面由大量空白发光方砖组成的三米高梦想墙，前方有简洁讲台，穹顶星空投影，远端一扇关闭的巨大光之门，地面反射柔和金绿星光。大厅开阔、仪式感强、无人无字，砖块不可带符号。

### `U05-SCN-PROPHECY-01` → `prophecy-room-source.png`

职业长廊尽头的未来预言水晶球室，暗色但细节清晰，中央巨大透明全息水晶球悬浮在环形装置上，球内只有抽象时间光轨，前方悬浮一本关闭的古籍造型电子书，周围有 2026–2036 时间节点的空白光位但无数字文字。神秘而理性，不做魔法恐怖感，无人无字。

### `U05-SCN-POST-01` → `time-post-office-source.png`

温馨复古的时光邮局，木质柜台、铜质大信箱、暖黄灯光，柜台上并列绿色蓝色金色三封无字信封、钢笔和三枚火漆印章，墙上钟表指针朝向未来但无数字，窗外可见智慧农场暮色。宽景，无人物无可读文字。

## 3. 三种结局提示词

### `U05-END-STAR-01` → `starlight-road-source.png`

金色星光铺成的宽阔未来大道，两侧繁茂果园和现代智慧农场，远处现代农业科技企业建筑在晨光中闪耀，天空留出纸飞机代码特效区。第一人称可进入的道路构图，光明但不过曝，无人物、公司名、文字或 logo。

### `U05-END-DAWN-01` → `dawn-road-source.png`

蜿蜒乡间小路通向清晨远光，路旁农田和小型现代电商服务站，路不宽但方向清晰，远处一盏温暖灯光作为目标。充满希望、真实朴素、可进入的道路视角，无人物、文字或 logo。

### `U05-END-SEED-01` → `seedling-field-source.png`

细雨中的新播种田地，近景大量刚破土的健康嫩芽，远方云层裂开一道温暖光线，泥土湿润有真实纹理，雨是滋养而非悲伤。中央留出手持种子/园丁代码叠加区，无人物无文字，安全积极。

## 4. 生成记录

| 素材编号 | 工具与最终提示词 | 源文件 | 成品 | 版本/日期 | 状态与 QA | 复用范围 |
|---|---|---|---|---|---|---|
| `U05-SCN-PATH-01` | built-in `imagegen`；采用第 2 节对应提示词和第 1 节统一约束 | `artifacts/imagegen/unit-05/career-corridor-source.png` | `public/assets/unit-05/scenes/career-corridor-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；无字、无人、长廊与空屏可叠加 | U05 |
| `U05-SCN-MEMORY-01` | 同上；成长记忆馆提示词 | `artifacts/imagegen/unit-05/memory-gallery-source.png` | `public/assets/unit-05/scenes/memory-gallery-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；弧屏、树与环形空间通过 | U05/档案可评估 |
| `U05-SCN-MATCH-01` | 同上；岗位匹配室提示词 | `artifacts/imagegen/unit-05/match-lab-source.png` | `public/assets/unit-05/scenes/match-lab-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；蜂巢与五岗位区通过 | U05/档案可评估 |
| `U05-SCN-PLAN-01` | 同上；生涯规划工坊提示词 | `artifacts/imagegen/unit-05/planning-workshop-source.png` | `public/assets/unit-05/scenes/planning-workshop-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；编辑叠加区通过 | U05 |
| `U05-SCN-DREAM-01` | 同上；梦想发布大厅提示词 | `artifacts/imagegen/unit-05/dream-hall-source.png` | `public/assets/unit-05/scenes/dream-hall-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；梦想墙与光之门通过 | U05/结业 |
| `U05-SCN-PROPHECY-01` | 同上；预言水晶球室提示词 | `artifacts/imagegen/unit-05/prophecy-room-source.png` | `public/assets/unit-05/scenes/prophecy-room-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；书台与时间节点通过 | U05 |
| `U05-SCN-POST-01` | 同上；时光邮局提示词 | `artifacts/imagegen/unit-05/time-post-office-source.png` | `public/assets/unit-05/scenes/time-post-office-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；三信封与铜信箱通过 | U05 |
| `U05-END-STAR-01` | built-in `imagegen`；采用第 3 节星光大道提示词和统一约束 | `artifacts/imagegen/unit-05/starlight-road-source.png` | `public/assets/unit-05/endings/starlight-road-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；道路叠加区通过 | U05 |
| `U05-END-DAWN-01` | 同上；晨光之路提示词 | `artifacts/imagegen/unit-05/dawn-road-source.png` | `public/assets/unit-05/endings/dawn-road-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；乡路与目标灯光通过 | U05 |
| `U05-END-SEED-01` | 同上；种子发芽提示词 | `artifacts/imagegen/unit-05/seedling-field-source.png` | `public/assets/unit-05/endings/seedling-field-v001.webp`，1920x1080 | v001 / 2026-07-27 | approved；嫩芽与雨丝叠加区通过 | U05 |

所有成品均由源图转为 1920x1080 WebP；逐件 QA 与页面截图见 `ASSET_MANIFEST.md` 第 5 节。


## 课堂框架第一步
没有生成新素材。农小智使用用户原图，场景复用现有生涯长廊；无新增图片生成提示词。

## 行业冲击第二步
无新位图提示词。配音台词：“你们直播怎么没人看了？我这批瓜等着卖呢，再没人买就烂地里了！”目标为中文中年男性、焦急自然，约 8 秒；使用可获得中文男声离线成品资源，具体音色生成后记录。不克隆真人声音。
生成记录：2026-09-09，edge-tts 7.x，zh-CN-YunjianNeural 中文男声，默认语速，手册原句。成品 public/assets/unit-05/audio/farmer-impact-v001.mp3，43,344 字节。Yunxi 请求未返回音频，改用 Yunjian 成功；本地固定 MP3，课堂播放无需调用 TTS。男声普通话，不声称具备方言口音。
补充生成环境版本：edge-tts 7.2.8。MP3 浏览器加载和播放验证通过，元数据时长 5–9 秒；无真人录音或声音克隆。

## 课堂第三步
无新增图片或配音提示词。沿用已有农小智、职业长廊；统计图表与路径信息使用程序排版。

## 课堂第四步配音
使用与冲击来电一致的 zh-CN-YunjianNeural 合成男声，普通话，不克隆真人。手册原句：“我花钱托付你们运营直播，流量被AI分走，几十亩西瓜销路你们要给个说法！”产物 public/assets/unit-05/audio/farmer-decision-v001.mp3。字幕始终保留，主动开启声音后播放；生成验证后更新记录。

生成完成：2026-09-09，edge-tts 7.2.8，zh-CN-YunjianNeural，默认语速，以上完整原句。保存为 public/assets/unit-05/audio/farmer-decision-v001.mp3（43,632 字节），已通过浏览器加载/播放/暂停检查，课堂无需在线生成语音。

## 课堂第五步
无新增位图或配音生成。沿用用户提供的农小智形象；三层圈与动态反馈使用矢量绘制，层名与内容保留技术手册原文。

## 剩余步骤六至八
无需新图或配音。复用用户农小智形象；地图/投票/归档均实时排版。提示音程序合成并可静音，不模拟真人声音。

第六至八步未生成新的图片，无新增图像提示词。合成音参数：倒计时900Hz正弦短音70ms、每秒一次；正确660→880Hz持续0.5秒；错误220→160Hz持续0.3秒，音量包络平滑渐入渐出。头像复用用户提供形象，不重绘。

最终状态：所有新增视觉由真实课堂状态驱动的HTML/CSS呈现，无新增位图或虚构数据素材；可静音合成反馈音和统一角色形象已浏览器验证。

## 2026-09-10 直播间重设计
模式：内置 image_gen；先 ui-mockup 完整情境区域概念，随后 photorealistic-natural 场景和 product-mockup 产品图。
概念约束：保留用户截图信息架构与六阶段课堂，重设计仅直播情境区。深松绿控制条，左侧约2/3清晰摄影现场，右侧约1/3深色运营消息栏；暖自然光、成年中国女主播穿绿色围裙在木桌后展示西瓜，筐箱补光灯与农田形成纵深。原事件文本和人数200、原农小智引导保留；不增加订单、价格或未经依据的业务指标。所有文字/交互用代码实现，摄影图独立导出。完整生成提示词将在资产产出后补录。

2026-09-10完整生成提示词、内置工具模式及三份正式素材名见 [IMPACT_IMAGE_PROMPTS.md](./IMPACT_IMAGE_PROMPTS.md)。设计标尺与组件布局见 [IMPACT_DESIGN.md](./IMPACT_DESIGN.md)。
