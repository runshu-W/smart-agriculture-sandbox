# 第四单元素材生成提示词

统一风格：参考 `docs/references/unit4.png` 的明亮高质量 2.5D 智慧农业学习空间、清晰纵深、柔和日光、农业绿+科技蓝+少量金色；不复制概念图文字和 UI。场景 16:9、无人、无文字、无 logo、无水印、屏幕完全空白，前景和中央留前端交互安全区。

## 场景

### U04-SCN-LEARN-01
宽阔现代智慧农业数字教室，中央圆形平台有三个递进高度的发光球基座，后方大型空白全息投影屏，侧面虚拟实验台和农业植物样本，窗外可见智慧温室；蓝绿主色、少量金色进阶提示，2.5D 写实卡通，高视角轻透视，无人物、文字、图标、假界面。

### U04-SCN-LIVE-01
专业但亲切的乡村农产品直播训练间，环形补光灯、手机支架、空白竖向弹幕屏、木质产品展架和农场窗景，中央主播站位与右侧交互安全区明确；绿色、暖木色和红色开播点缀，2.5D，无人物、文字、品牌、屏幕内容。

### U04-SCN-AI-01
蓝色科技感 AI 创新实验室，中央圆形工作台，上方空置全息投影位，左中右三台造型不同但屏幕空白的虚拟终端，墙上多块空白智能屏，农业叶片与数据线装饰，2.5D，高质量清晰空间，无人物、文字、假 UI。

### U04-SCN-CINEMA-01
半圆形沉浸式成长影院，星空穹顶与缓慢银河光带意象，柔和暖光弧形座椅，扶手小屏保持空白，正前方巨幕和下方三张无字故事卡底座；2.5D，无人物、文字、播放图标或假画面。

### U04-SCN-PLAN-01
安静温暖的个人梦想规划工作室，木质书桌、台灯、笔筒、空白平板、墙面大型空白学习地图和时光信箱，宽窗外呈现可由前端叠加四季的农田基础景观，角落预留水晶球位置；2.5D，无人物、文字、屏幕内容。

### U04-SCN-METHOD-01
农业科技图书馆的学习方法专区，巨型弧形木书架环绕温馨角落，书脊完全无字但有番茄、脑形、教授帽三种造型轮廓，中央圆形练习桌、空白纸张和计时器底座，暖阅读灯与绿色植物；2.5D，无人物、文字、UI。

### U04-SCN-ARENA-01
AI 实验室后方的数字技能竞技场，未来感闯关通道依次有绿、蓝、紫、橙、金五扇完整门，门面与上方铭牌全部空白，入口侧有空白匿名排行榜屏，路径清晰有纵深；农业科技纹样克制，2.5D，无人物、文字、数字、UI。

## 透明角色

### U04-NPC-AI-01
可爱但专业的蓝白色智慧农业 AI 机器人全身悬浮姿态，圆润头部、绿色叶片徽记但无文字品牌，双手展开像协作助手，腿部轻收，蓝色柔光只贴近主体边缘；高质量 2.5D 写实卡通，主体完整居中。纯色 `#ff00ff` 背景，无地面、投影、环境、文字、界面、运动线、裁切，主体不得包含背景色。

## 三镜头教学故事板

### U04-STORY-ZHAO-01
同一位年轻中国乡村青年小赵身份一致的横向三联画：外出打工后在简陋宿舍看直播学习；第一次农产品直播面对稀少观众紧张练习；后来在明亮直播间自信介绍家乡产品并与观众互动。2.5D，镜头间明确留白，无文字、数字、气泡、logo、水印。

### U04-STORY-HUA-01
同一位中国返乡女大学生阿花姐身份一致的横向三联画：带平板回到传统家庭温室观察问题；夜晚查资料并在平板上设计智慧改造；现代温室中查看传感数据、与家人一起收获。2.5D，连续成长、无文字、屏幕内容、logo、水印。

### U04-STORY-ZHOU-01
同一位约 60 岁中国农民老周身份一致的横向三联画：戴老花镜笨拙学习电脑电商；第一次直播只有少量观众仍认真记录并请年轻家人复盘；熟练面对手机直播家乡农产，表情坚定温暖。2.5D，无文字、数字、气泡、logo、水印。

## 生成记录模板

生成后记录 built-in `imagegen` 的源文件到 `artifacts/imagegen/unit-04/`，成品到 `public/assets/unit-04/`。透明素材使用 `transparent-visual-assets` 清理并记录参数、实际尺寸和 JSON QA；场景/故事板生成 WebP 并制作 contact sheet。每项更新 `ASSET_MANIFEST.md` 的版本、日期、状态、路径、QA 和复用范围。

## v001 生成记录

| 素材 | 源文件 | 成品 | 状态 / QA |
|---|---|---|---|
| `U04-SCN-LEARN-01` | `artifacts/imagegen/unit-04/learning-space-source.png` | `public/assets/unit-04/scenes/learning-space-v001.webp` | approved；1920x1080 |
| `U04-SCN-LIVE-01` | `artifacts/imagegen/unit-04/live-studio-source.png` | `public/assets/unit-04/scenes/live-studio-v001.webp` | approved；1920x1080 |
| `U04-SCN-AI-01` | `artifacts/imagegen/unit-04/ai-lab-source.png` | `public/assets/unit-04/scenes/ai-lab-v001.webp` | approved；1920x1080 |
| `U04-SCN-CINEMA-01` | `artifacts/imagegen/unit-04/growth-cinema-source.png` | `public/assets/unit-04/scenes/growth-cinema-v001.webp` | approved；1920x1080 |
| `U04-SCN-PLAN-01` | `artifacts/imagegen/unit-04/planning-studio-source.png` | `public/assets/unit-04/scenes/planning-studio-v001.webp` | approved；1920x1080 |
| `U04-SCN-METHOD-01` | `artifacts/imagegen/unit-04/method-library-source.png` | `public/assets/unit-04/scenes/method-library-v001.webp` | approved；1920x1080 |
| `U04-SCN-ARENA-01` | `artifacts/imagegen/unit-04/digital-arena-source.png` | `public/assets/unit-04/scenes/digital-arena-v001.webp` | approved；1920x1080 |
| `U04-NPC-AI-01` | `artifacts/imagegen/unit-04/ai-assistant-source.png` | `public/assets/unit-04/characters/ai-assistant-v001.png` | approved；974x1222；alpha QA |
| `U04-STORY-ZHAO-01` | `artifacts/imagegen/unit-04/xiaozhao-source.png` | `public/assets/unit-04/storyboards/xiaozhao-v001.webp` | approved；1536x768 |
| `U04-STORY-HUA-01` | `artifacts/imagegen/unit-04/ahuajie-source.png` | `public/assets/unit-04/storyboards/ahuajie-v001.webp` | approved；1536x768 |
| `U04-STORY-ZHOU-01` | `artifacts/imagegen/unit-04/laozhou-source.png` | `public/assets/unit-04/storyboards/laozhou-v001.webp` | approved；1536x768 |
