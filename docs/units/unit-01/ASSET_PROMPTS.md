# 第一单元素材生成提示词

## U01-SCN-TRAD-HALL-01

```text
Use case: historical-scene
Asset type: 16:9 interactive web simulation scene background
Primary request: a polished 1980s Chinese rural agricultural exhibition scene centered on a manual rice threshing work area
Scene/backdrop: warm open-sided rural work shed beside golden rice fields; mud-brick farmhouse and simple agricultural tool wall in the distance; bundles of harvested rice arranged naturally
Subject: the environment only, with a clear empty operating area in the lower center for an interactive threshing machine overlay
Style/medium: high-quality stylized 3D environment with believable materials, matching the bright 3D cartoon realism and spatial depth of docs/references/unit1.png
Composition/framing: wide eye-level 16:9 view; strong foreground, midground and background separation; uncluttered lower-center interaction zone; safe margins for web UI
Lighting/mood: clear warm morning light, hardworking but hopeful, not nostalgic gloom
Color palette: straw gold, earth brown, natural green, pale sky blue
Constraints: background environment only; no people; no robot; no standalone threshing machine in the operating zone; no text; no signs; no labels; no interface panels; no watermark
Avoid: modern machinery, futuristic lighting, heavy blur, dark cinematic grading, embedded UI
```

## U01-PROP-THRESHER-01

```text
Use case: stylized-concept
Asset type: interactive game prop for a web simulation
Primary request: a complete 1980s Chinese manual rice threshing machine, designed as a clean reusable 2.5D web asset
Subject: sturdy wooden-and-metal hand-cranked rice thresher with visible drum housing, rice intake, grain outlet and central axle where a separate animated handle can attach
Style/medium: polished stylized 3D prop with believable worn wood and dark metal, matching the bright concept-art realism of the project
Composition/framing: single object, three-quarter front view, fully inside canvas, generous padding, unobstructed axle and grain outlet
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background for later removal
Lighting/mood: soft neutral studio lighting
Constraints: no attached hand or person; no cast shadow; no contact shadow; no floor; no scenery; no text; no label; no logo; no glow; no blur; no particles; no watermark; subject must not contain magenta, pink, or colors near #FF00FF
```

## G-CHAR-NXZ-GUIDE-01

使用 `docs/assets/GLOBAL_ASSET_PROMPTS.md` 中的完整提示词。生成时将首页和第一单元概念图作为身份与风格参考，最终成品进入全局素材库，不在第一单元目录重复保存。

## 后续第一单元提示模板

### 场景背景

```text
Use case: stylized-concept
Asset type: 16:9 interactive web simulation scene background
Primary request: <SCENE>
Subject: environment only; reserve clear operating zones for <INTERACTIVE_OBJECTS>
Style/medium: polished stylized 3D environment consistent with the supplied project concept art
Composition/framing: wide eye-level view, clear depth layers, safe margins for UI
Lighting/mood: <LIGHTING>
Constraints: no text; no labels; no people unless explicitly required; no fake UI; no watermark
```

### 透明设备/道具

```text
Use case: stylized-concept
Asset type: reusable interactive game prop
Primary request: <OBJECT>
Subject: single complete object with interactive parts clearly visible
Style/medium: polished stylized 3D prop consistent with the project
Composition/framing: centered three-quarter view, complete silhouette, generous padding
Scene/backdrop: perfectly flat solid <KEY_COLOR> chroma-key background
Constraints: no shadow; no floor; no scenery; no text; no logo; no glow; no blur; no particles; no watermark; do not use <KEY_COLOR> in the subject
```

每次实际生成前必须把占位符替换为具体场景/对象，并把最终提示词回写至对应素材记录。

## M2-A 最终提示词

### G-SCN-PROJECT-HOME-01

```text
Use case: stylized-concept
Asset type: 16:9 system home background for a vocational smart-agriculture simulation
Primary request: an integrated contemporary Chinese smart-agriculture learning landscape that represents the full five-unit career-development journey, not one historical task
Scene/backdrop: productive fields, greenhouse structures, a modest agricultural learning center, distant orchard, autonomous field equipment and one small drone as environmental details
Subject: environment only; balance real agriculture, digital technology and vocational learning; reserve broad quiet negative space for interface copy
Style/medium: polished bright 3D cartoon realism consistent with the supplied project concept art, grounded and inspectable rather than science-fiction fantasy
Composition/framing: wide eye-level panorama with foreground crops, midground learning campus and fields, distant landscape; clear depth; no single machine dominates
Lighting/mood: clear optimistic morning, capable and future-facing
Color palette: natural green, pale sky blue, warm crop gold, restrained white technology accents
Constraints: no people, no robot, no text, no signs, no fake UI, no watermark, no dark grading, no oversized futuristic city
```

### U01-SCN-ENTRY-HALL-01

```text
Use case: stylized-concept
Asset type: 16:9 interactive game environment background
Primary request: the welcoming entrance hall of a Chinese smart-agriculture era exhibition, connecting historical farming, modern mechanization and digital agriculture
Scene/backdrop: spacious timber-and-glass exhibition hall with three distinct distant portals suggested by materials: warm rural wood, modern steel blue, smart green technology
Subject: environment only; clear central floor for an invitation overlay and character; no detailed exhibits that compete with interaction
Style/medium: polished bright 3D cartoon realism consistent with docs/references/unit1.png
Composition/framing: wide eye-level, symmetrical but natural, strong foreground-to-background depth, safe UI margins
Lighting/mood: welcoming daylight with warm gold and restrained green-blue accents
Constraints: no people, no robot, no readable text, no signs, no fake UI panels, no watermark
```

### U01-PROP-OX-PLOW-01

```text
Use case: historical-scene
Asset type: transparent animated-scene foreground subject
Primary request: a complete 1980s Chinese rural ox-plowing group for a 2.5D educational simulation
Subject: one sturdy yellow-brown ox pulling a traditional wooden plow, with one Chinese adult farmer in plain period-appropriate work clothes holding the plow handles and leaning forward naturally
Style/medium: polished stylized 3D cartoon realism, believable proportions and materials, matching the project's bright concept-art style
Composition/framing: single side-facing group moving toward the right, complete hooves, plow, handles and person, generous padding, crisp silhouette
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background touching every edge
Lighting/mood: soft neutral studio light
Constraints: no shadow, no floor, no soil, no scenery, no text, no labels, no particles, no watermark; no magenta or pink in the subject
```

### U01-PROP-RAIN-GEAR-01

```text
Use case: historical-scene
Asset type: reusable educational prop cutout
Primary request: a traditional Chinese straw rain cape and woven bamboo conical hat displayed together as one complete museum-style object group
Subject: detailed golden-brown straw cape hanging naturally with the conical bamboo hat slightly overlapping above it, no person
Style/medium: polished stylized 3D prop with believable woven straw texture, consistent with the project's bright 3D realism
Composition/framing: centered front three-quarter view, complete silhouette, generous padding
Scene/backdrop: perfectly flat solid #00FFFF chroma-key background touching every edge
Lighting/mood: soft neutral studio light
Constraints: no shadow, no floor, no wall hook, no scenery, no text, no labels, no glow, no particles, no watermark; no cyan or turquoise in the subject
```

## M0.2-B 至 M0.3 最终场景提示词

四项均使用 built-in `image_gen`，无参考图直接生成；成品统一转为 1920x1080 WebP q88。

### U01-SCN-MODERN-HALL-01

```text
Use case: stylized-concept
Asset type: 16:9 interactive web simulation background
Primary request: a contemporary Chinese modern-agriculture exhibition hall that demonstrates mechanized harvesting, greenhouse climate control, and water-fertilizer integration
Scene/backdrop: a bright semi-open hall beside wheat fields and glass greenhouses, with a distant combine harvester bay, greenhouse work zone, irrigation pipes and a central clear demonstration floor
Subject: environment only, with three distinct but harmonious operating zones and broad clear foreground space for code-driven interactive overlays
Style/medium: polished bright stylized 3D cartoon realism, grounded educational simulation quality, consistent with a premium vocational training game
Composition/framing: wide eye-level 16:9, strong foreground-midground-background depth, safe margins, no single machine dominating
Lighting/mood: crisp optimistic daylight, practical and capable
Color palette: wheat gold, greenhouse green, steel blue, warm white
Constraints: no people, no robot, no readable text, no labels, no fake interface panels, no watermark, no dark cinematic grading
```

### U01-SCN-SMART-HALL-01

```text
Use case: stylized-concept
Asset type: 16:9 interactive web simulation background
Primary request: a Chinese smart-agriculture exhibition hall for drone crop protection, soil sensor monitoring, and preset AI crop-disease recognition
Scene/backdrop: a glass-and-timber pavilion opening to precise crop plots, with a clear aerial-flight zone, several small soil probes, and a distant clean analysis workstation area
Subject: environment only; broad uncluttered central foreground for code-driven drone, sensor data and scanning overlays
Style/medium: polished bright stylized 3D cartoon realism, premium vocational simulation, technology grounded in actual farming rather than science fiction
Composition/framing: wide eye-level 16:9, layered field and pavilion depth, safe margins for HUD
Lighting/mood: fresh late-morning light, calm, precise and future-facing
Color palette: crop green, pale sky blue, warm timber, restrained cyan-white technology accents
Constraints: no people, no robot, no readable text, no fake UI, no holographic city, no watermark, no dark grading
```

### U01-SCN-CAREER-HUB-01

```text
Use case: stylized-concept
Asset type: 16:9 interactive web simulation background
Primary request: a circular smart-agriculture vocational experience center containing five distinct career pods
Scene/backdrop: spacious contemporary timber-and-glass rotunda with five open work bays suggesting live commerce, farm operations, brand design, order fulfillment, and rural entrepreneurship; central floor kept clear
Subject: environment only; five bays visually distinct through practical props and restrained lighting, no people
Style/medium: polished bright stylized 3D cartoon realism, premium vocational training game, believable workspace materials
Composition/framing: wide eye-level 16:9, gentle circular perspective, clear foreground for code-driven controls and character overlays, safe margins
Lighting/mood: welcoming, energetic, work-focused rather than futuristic spectacle
Color palette: natural green, warm timber, white, small accents of yellow, red and cyan across different bays
Constraints: no readable text, no signs, no people, no robot, no fake UI, no logos, no watermark, no dark grading
```

### U01-SCN-STORY-HALL-01

```text
Use case: stylized-concept
Asset type: 16:9 interactive web simulation background
Primary request: a respectful circular exhibition gallery about contemporary Chinese new farmers and rural innovators
Scene/backdrop: bright timber gallery with ten empty illuminated display niches around a curved wall, a central viewing area, subtle agricultural materials and windows toward fields
Subject: environment only; display niches intentionally empty so code-driven story portraits and labels can be overlaid; generous foreground for a media player and reflection card
Style/medium: polished bright stylized 3D cartoon realism, museum-quality educational environment, grounded and warm
Composition/framing: wide eye-level 16:9, curved spatial depth, evenly distributed cabinets, safe UI margins
Lighting/mood: reflective, hopeful and dignified
Color palette: warm timber, natural green, soft white, restrained harvest gold
Constraints: no people, no portraits, no readable text, no fake screens or UI, no logos, no watermark, no dark cinematic grading
```

## 2026-07-26 素材审计补齐提示词索引

本轮新增的五职业男女角色、农小智鼓励姿态、联合收割机、植保无人机、土壤传感探杆、番茄展示组、三张病害样本和全局徽章底板均属于全局复用素材。完整最终提示词、规格和键色见 `docs/assets/GLOBAL_ASSET_PROMPTS.md`，不得在第一单元另生成外观不同的副本。

| 第一单元交互 | 使用素材 | 代码叠加内容 |
|---|---|---|
| `U01-ERA-MOD-01` | `G-PROP-HARVESTER-01` | 前进、收割进度、作物遮罩、尘粒 |
| `U01-ERA-SMART-01` | `G-PROP-DRONE-01` | 航线、移动、喷洒、覆盖率 |
| `U01-ERA-SMART-02` | `G-PROP-SOIL-SENSOR-01` | 指示灯、连线、数据卡 |
| `U01-ERA-SMART-03` | `G-CROP-DISEASE-01..03` | 扫描线、加载、置信度、结果文字 |
| `U01-JOB-01..05` | `G-ROLE-*-F/M-01`、`G-PROP-TOMATO-DISPLAY-01` | 工作台、表单、波形、品牌文字和反馈 |
| `U01-ASSESS-02..03` | `G-ROLE-*-F/M-01` | 雷达图、排名、角色卡文字与选择状态 |
| 单元结业 | `G-CHAR-NXZ-ENCOURAGE-01`、`G-UI-BADGE-BASE-01`、`U01-UI-BADGE-ERA-01` | 勋章动画、光效和结果文字 |

### U01-UI-BADGE-ERA-01

代码原生 SVG，不调用图片生成。规格：在全局六边形徽章底板中央绘制由木犁纹路、麦穗和数字电路三段组成的时代演进图案；使用深林绿、科技蓝和丰收金；不含文字，图案不得越过底板 64% 安全区。

### U01-MEDIA-STORY-POSTER-01..10

状态统一为 `blocked-external`。要求校方或权利人提供真实人物授权封面、姓名、职业、来源和替代文本；不得用图片生成模型虚构纪实人物。建议原始尺寸不低于 1200x1500，交付 WebP 600x750，并保留授权记录。对应视频建议 1080p H.264 MP4，提供中文字幕文件。
