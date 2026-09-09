# 全局素材生成提示词

## G-CHAR-NXZ-GUIDE-01

```text
Use case: stylized-concept
Asset type: reusable game character render for a web simulation
Input images: docs/references/home-page-concept.png and docs/references/unit1.png are visual identity references only
Primary request: create the same friendly agricultural robot guide, Nong Xiaozhi, in a welcoming full-body guide pose with one hand raised toward an interface
Subject: white round robot face, large green eyes, green baseball cap with a simple leaf emblem, green circuit-detail jacket, smart headphones, short friendly proportions
Style/medium: polished 3D cartoon character render matching the supplied concept art
Composition/framing: single centered full body, three-quarter view, complete hands and feet, generous padding
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background for later removal
Lighting/mood: bright soft studio light, optimistic and professional
Constraints: one character only; consistent identity; crisp silhouette; no text; no speech bubble; no shadow; no floor; no reflection; no particles; no watermark; do not use magenta or pink in the subject
```

## 五岗位角色基础模板

```text
Use case: stylized-concept
Asset type: reusable career character render for a web simulation
Primary request: a Chinese vocational student portraying <JOB>, wearing <OUTFIT> and holding <PROP>
Subject: youthful, capable, approachable, age appearance 17-22
Style/medium: polished 3D cartoon realism consistent with the Nong Xiaozhi concept art
Composition/framing: single full-body character, three-quarter view, complete silhouette, generous padding
Scene/backdrop: perfectly flat chroma-key background selected to avoid the outfit colors
Constraints: no text; no logos; no shadow; no floor; no scenery; no particles; no watermark
```

## G-SCN-PROJECT-HOME-01

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

岗位参数来自 `STYLE_GUIDE.md`。每次生成时替换性别、服装、道具和背景键色，并将最终完整提示词写入生成记录。

## 2026-07-26 第一单元素材审计冻结提示词

以下条目生成前均完成 `prompt-ready` 登记，现已生成并通过 QA。十个角色使用同一固定正文，并代入表格中的唯一 `SUBJECT`；固定正文与参数共同构成实际完整提示词。

### G-ROLE-* 五职业标准角色

```text
Use case: stylized-concept. Asset type: reusable full-body career character for a Chinese vocational smart-agriculture web simulation. Primary request: {SUBJECT}. Style/medium: polished bright 3D cartoon realism, believable fabric and props, consistent with a premium vocational training game and the Nong Xiaozhi project art direction. Composition: one centered full-body character in a confident three-quarter view, complete hands and shoes, generous clear padding, crisp readable silhouette. Background: perfectly flat solid #FF00FF chroma-key color touching every edge. Lighting: soft neutral studio light. Constraints: one person only, age appearance 17-22, capable and approachable, non-sexualized, no text, no logo, no brand, no shadow, no floor, no scenery, no glow, no particles, no watermark, and no magenta or pink on the subject.
```

| 素材编号 | `SUBJECT` 最终值 |
|---|---|
| `G-ROLE-ANCHOR-F-01` | a young Chinese woman portraying an agricultural e-commerce host, wearing a practical green apron over a light outdoor vest and holding a smartphone stabilizer beside a small plain produce basket |
| `G-ROLE-ANCHOR-M-01` | a young Chinese man portraying an agricultural e-commerce host, wearing a practical green apron over a light outdoor vest and holding a smartphone stabilizer beside a small plain produce basket |
| `G-ROLE-FARM-F-01` | a young Chinese woman portraying a smart-farm operations technician, wearing a blue-gray functional jacket and holding a rugged tablet with a compact sensor terminal |
| `G-ROLE-FARM-M-01` | a young Chinese man portraying a smart-farm operations technician, wearing a blue-gray functional jacket and holding a rugged tablet with a compact sensor terminal |
| `G-ROLE-BRAND-F-01` | a young Chinese woman portraying an agricultural product brand planner, wearing a white shirt and warm orange work vest and holding a blank design board with one unbranded packaging sample |
| `G-ROLE-BRAND-M-01` | a young Chinese man portraying an agricultural product brand planner, wearing a white shirt and warm orange work vest and holding a blank design board with one unbranded packaging sample |
| `G-ROLE-OPS-F-01` | a young Chinese woman portraying a rural e-commerce operations specialist, wearing deep navy and muted violet-gray business-casual clothing and holding an open order terminal laptop |
| `G-ROLE-OPS-M-01` | a young Chinese man portraying a rural e-commerce operations specialist, wearing deep navy and muted violet-gray business-casual clothing and holding an open order terminal laptop |
| `G-ROLE-FOUNDER-F-01` | a young Chinese woman portraying a new-generation rural entrepreneur, wearing a clean dark-green field jacket and holding a data tablet with a plain project folder |
| `G-ROLE-FOUNDER-M-01` | a young Chinese man portraying a new-generation rural entrepreneur, wearing a clean dark-green field jacket and holding a data tablet with a plain project folder |

### G-CHAR-NXZ-ENCOURAGE-01

```text
Use case: stylized-concept. Asset type: reusable transparent game character. Use the supplied G-CHAR-NXZ-GUIDE-01 image only as the identity reference. Create the same Nong Xiaozhi robot in a cheerful full-body completion pose: one hand giving a restrained thumbs-up and the other open palm presenting an empty space where a code-rendered badge will be overlaid. Preserve the white round face, large green eyes, green leaf-emblem baseball cap, headphones, green circuit-detail jacket and short friendly proportions. Polished bright 3D cartoon render. Centered three-quarter view, complete hands and feet, generous padding. Perfectly flat solid #FF00FF background. No badge, text, speech bubble, shadow, floor, scenery, particles or watermark; no magenta or pink in the robot.
```

### G-PROP-HARVESTER-01

```text
Use case: stylized-concept. Asset type: reusable interactive agricultural machine cutout. A complete modern Chinese combine harvester with clearly recognizable front cutting header, reel, cab, grain tank, unloading auger and large field tires, painted practical wheat-gold, white and restrained green. Polished bright stylized 3D realism with believable mechanical detail. Single object, side three-quarter view facing right, fully inside frame with generous padding and clean silhouette. Perfectly flat solid #FF00FF background. No driver, crop, dust, motion blur, shadow, floor, text, logo, scenery, particles or watermark; no magenta or pink on the machine.
```

### G-PROP-DRONE-01

```text
Use case: stylized-concept. Asset type: reusable interactive agricultural machine cutout. A complete professional crop-protection multirotor drone, clearly showing four robust arms and rotors, central liquid tank, pump, spray booms and landing gear, in white, dark graphite and agricultural green. Polished bright stylized 3D realism with credible engineering. Single object, elevated three-quarter view, fully inside frame with generous padding and crisp silhouette. Perfectly flat solid #FF00FF background. Rotors static; no pilot, spray, crop, motion blur, shadow, floor, text, logo, scenery, glow, particles or watermark; no magenta or pink on the drone.
```

### G-PROP-SOIL-SENSOR-01

```text
Use case: stylized-concept. Asset type: reusable smart-agriculture device cutout. A complete weatherproof white field soil-monitoring probe with a narrow vertical housing, small green cap, compact solar panel, status-light window, antenna, and two visible metal soil prongs. Polished bright stylized 3D realism with believable plastic and metal. Single upright device in three-quarter view, complete silhouette and prongs, generous padding. Perfectly flat solid #FF00FF background. Indicator unlit; no soil, shadow, floor, cable, data graphics, text, logo, scenery, glow, particles or watermark; no magenta or pink on the device.
```

### G-PROP-TOMATO-DISPLAY-01

```text
Use case: stylized-concept. Asset type: reusable agricultural product display cutout. A tidy premium display group of fresh red highland tomatoes with green stems in a small natural-wood crate, beside two blank recyclable kraft packaging boxes with a simple die-cut tomato window and no printed graphics. Polished bright stylized 3D realism with believable produce and packaging. Single compact group in front three-quarter view, complete silhouette and generous padding. Perfectly flat solid #00FFFF background. No person, table, shadow, floor, text, logo, label, scenery, glow, particles or watermark; no cyan or turquoise on the subject.
```

### G-CROP-DISEASE-01..03

三张样本不使用透明背景，成品统一裁切为 768x768 WebP。

```text
G-CROP-DISEASE-01: Use case: educational close-up. A scientifically plausible close-up of a tomato leaf affected by early blight, showing multiple brown concentric target-like lesions with yellowing margins on an otherwise recognizable tomato leaf. Bright natural diffuse light, crisp observable texture, one dominant leaf filling the square frame, softly blurred real crop foliage behind it. Premium realistic educational photography style. No hands, tools, text, labels, arrows, interface, logo or watermark; not grotesque, not an illustration.

G-CROP-DISEASE-02: Use case: educational close-up. A scientifically plausible close-up of a cucumber leaf affected by powdery mildew, showing distinct irregular white powdery colonies across the broad green leaf while the leaf shape remains recognizable. Bright natural diffuse light, crisp observable texture, one dominant leaf filling the square frame, softly blurred real crop foliage behind it. Premium realistic educational photography style. No hands, tools, text, labels, arrows, interface, logo or watermark; not grotesque, not an illustration.

G-CROP-DISEASE-03: Use case: educational close-up. A scientifically plausible close-up of a wheat leaf affected by leaf rust, showing many small orange-brown elongated pustules distributed along a narrow green wheat blade. Bright natural diffuse light, crisp observable texture, the infected blade filling the square frame with softly blurred wheat plants behind it. Premium realistic educational photography style. No hands, tools, text, labels, arrows, interface, logo or watermark; not grotesque, not an illustration.
```

### G-UI-BADGE-BASE-01

代码原生 SVG，不调用图片生成。规格：六边形丰收金金属底板、双层描边、中央留出 64% 安全区、不含文字和单元图案，支持五单元叠加不同 SVG 图案。

## 2026-07-26 第二单元新增全局道具

以下三项已使用纯色键背景生成并完成透明素材清理与三底色 QA，状态为 `approved`。

### G-PROP-STRATEGY-TOOLBOX-01

```text
Use case: stylized-concept. Asset type: reusable transparent interactive prop. One open practical wooden coping-strategy toolbox with a hinged lid, four clearly separated empty compartments and small restrained green metal fittings, polished bright 3D cartoon realism with believable wood. Front three-quarter view, complete silhouette, generous padding, compartments visible and empty for code-rendered tools. Perfectly flat solid #FF00FF background. No tools, text, logos, hands, shadow, floor, scenery, glow, particles or watermark; no magenta or pink on the object.
```

### G-PROP-TYPEWRITER-01

```text
Use case: stylized-concept. Asset type: reusable transparent interactive prop. One friendly vintage mechanical typewriter adapted for an educational emotion translator, muted forest-green body, cream keys, visible paper roller and one completely blank cream sheet inserted, polished bright 3D cartoon realism. Front three-quarter view, complete silhouette and keys, generous padding. Perfectly flat solid #FF00FF background. No writing on paper or keys, no hands, no desk, no shadow, no floor, no scenery, glow, particles or watermark; no magenta or pink on the object.
```

### G-PROP-STRATEGY-CASE-01

```text
Use case: stylized-concept. Asset type: reusable transparent interactive prop. One open compact strategy suitcase with a warm tan exterior, deep green lining and exactly three clearly visible empty cushioned slots for code-rendered gems, polished bright 3D cartoon realism. Front three-quarter view, complete handle, lid and base, generous padding. Perfectly flat solid #00FFFF background touching all edges. No gems, tools, text, logo, hands, shadow, floor, scenery, glow, particles or watermark; no cyan or turquoise on the object.
```
