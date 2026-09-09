# 第二单元素材生成提示词

## 1. 统一约束

- 美术：明亮、可信、适合中职学生的高质量 2.5D/3D 卡通写实；自然农业与克制科技感并存。
- 场景：无人物、无文字、无标志、无假 UI，预留前景交互区与界面留白。
- 透明物：每次只生成一个独立主体，完整轮廓，纯色键背景，清理后做白/深/棋盘格 QA。
- 表情图：用于识别训练而非心理测量；人物为虚构职业学生，表情自然可辨，不夸张丑化。

## 2. 场景提示词

### U02-SCN-MIRROR-01

```text
Use case: stylized-concept. Asset type: 16:9 environment background for a Chinese vocational smart-agriculture simulation. Primary request: an elegant self-reflection mirror house inside a contemporary agricultural learning center, with a large empty oval mirror platform at center, subtle wheat-ear metal ornament and restrained circuit patterns in the architecture. Scene: blue and violet glass surfaces, soft reflected floor, deep-blue star-like depth beyond the central platform, quiet side alcoves for a scroll and a compass. Style: polished bright 3D cartoon realism, premium educational game environment, grounded and welcoming rather than fantasy. Composition: wide eye-level view, clear central stage and generous negative space on both sides for code-rendered controls, layered foreground and background. Lighting: soft blue-violet glow with warm wheat-gold accents. Constraints: environment only, no people, no character, no readable text, no fake UI, no watermark, no excessive neon, no dark horror mood.
```

### U02-SCN-FRUSTRATION-01

```text
Use case: stylized-concept. Asset type: 16:9 environment background for a vocational simulation. Primary request: a Chinese smart-agriculture field designed for weather and workplace challenge simulations, with golden rice plots, one transparent glass live-stream pavilion, a greenhouse service area and a distant modest operations shed. Style: polished bright 3D cartoon realism with believable crops and equipment, premium educational game. Composition: wide view with a large clear central interactive field, pavilion on one side and greenhouse controls on the other, open sky occupying the upper third for code-rendered weather. Lighting: neutral late-afternoon sunlight that can accept dark code overlays. Constraints: no people, no screens with content, no text, no logos, no fake UI, no storm already present, no watermark.
```

### U02-SCN-LAB-01

```text
Use case: stylized-concept. Asset type: 16:9 emotion-learning laboratory background inside a smart-agriculture vocational center. Primary request: a clean white laboratory with three clearly separated functional bays defined by restrained red, orange and green architectural light strips; a six-screen semicircular decoder station area, an empty typewriter desk area and a transparent regulation-cabin platform. Style: polished bright 3D cartoon realism, approachable educational technology, curved glass and pale wood details. Composition: wide symmetrical room, open foreground for interaction, readable depth and generous interface-safe space. Lighting: soft daylight plus gentle colored strips, never clinical or threatening. Constraints: no people, no faces on screens, no readable text, no fake UI, no logos, no watermark, no excessive science-fiction machinery.
```

### U02-SCN-GARDEN-01

```text
Use case: stylized-concept. Asset type: 16:9 outdoor collaborative learning garden background. Primary request: a spring garden at a Chinese smart-agriculture campus, with flower meadows, a clear shallow stream, young orchard trees, a modest circular teamwork platform and one open patch where a data-driven growth tree can be overlaid. Style: polished bright 3D cartoon realism with believable plants, optimistic premium vocational game. Composition: wide eye-level panorama, teamwork platform in the midground, unobstructed open ground near center-right, layered flowers and stream leading into the distance. Lighting: fresh spring morning, balanced natural green, flower colors and warm sunlight. Constraints: no people, no existing giant tree in the overlay patch, no text, no signs, no fake UI, no watermark, no bokeh blobs.
```

### U02-SCN-TREEHOLE-01

```text
Use case: stylized-concept. Asset type: 16:9 supportive reflection-space background for a youth vocational simulation. Primary request: a warm hollow-tree interior with natural wood grain, soft candle-like lanterns protected behind glass, gentle green vines, small paper shelves and an opening toward a calm garden. The space should feel private, safe and hopeful, never secretive or ominous. Style: polished bright 3D cartoon realism, tactile wood and leaves, premium educational game. Composition: wide interior with a clear central writing area and open flight path toward the tree hollow, generous negative space for code-rendered notes. Lighting: warm amber balanced by fresh green daylight from the opening. Constraints: no people, no written notes, no text, no faces, no fake UI, no watermark, no dark cave or horror mood.
```

### U02-SCN-ENERGY-01

```text
Use case: stylized-concept. Asset type: 16:9 emotion-regulation activity station background for a vocational learning game. Primary request: an airy circular room with three suspended orbital rails, twelve empty docking points, a central open practice platform and restrained rainbow-spectrum glass accents connected to a sunlit smart-agriculture campus. Style: polished bright 3D cartoon realism, playful but professional, premium educational game. Composition: wide view with clear center, visible three-layer orbital structure and open lower foreground for a suitcase overlay. Lighting: bright diffuse daylight with balanced multi-color accents, white and natural green still dominant. Constraints: no people, no floating icons or gems already present, no text, no fake UI, no logos, no watermark, no overwhelming gradient fog.
```

## 3. 透明装置提示词

所有条目先生成到纯色背景，再使用 `transparent-visual-assets` 清理。

### U02-PROP-MIRROR-FRAME-01

```text
Use case: stylized-concept. Asset type: reusable transparent interactive prop. A tall ornate oval mirror FRAME ONLY, combining brushed wheat-gold metal wheat ears with subtle dark-blue circuit inlays, polished premium vocational game 3D cartoon realism. The center must be a completely empty flat solid #FF00FF opening with no glass, reflection or object, so a live code-rendered mirror surface can be placed behind it. Single centered front-facing frame, complete silhouette, generous padding. Entire outer background also perfectly flat solid #FF00FF touching all edges. No person, text, logo, shadow, floor, scenery, particles or watermark; no magenta or pink on the frame.
```

### U02-PROP-GROWTH-SCROLL-01

```text
Use case: stylized-concept. Asset type: reusable transparent interactive prop. One fully opened horizontal bamboo growth scroll with warm pale writing surface, bamboo rollers at both ends and restrained wheat-gold corner ornaments, polished bright 3D cartoon realism. The central surface must be blank and wide enough for two code-rendered columns. Centered front three-quarter view, complete object, generous padding. Perfectly flat solid #FF00FF background. No writing, symbols, icons, hands, shadow, floor, scenery, particles or watermark; no magenta or pink on the object.
```

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

## 4. 表情教学图提示词

固定模板：

```text
Use case: educational expression-recognition sample. Asset type: square fictional character portrait for a Chinese vocational smart-agriculture simulation. Primary request: a fictional Chinese vocational student working in a rural e-commerce context, showing a clear natural expression of {EMOTION}; facial muscles, gaze and posture should make the emotion readable without caricature. Scene: softly blurred agricultural product worktable and greenhouse daylight behind the person. Style: polished bright 3D cartoon realism consistent with a premium educational game, respectful and age-appropriate. Composition: head and upper torso, face unobstructed, centered with a little breathing room. Lighting: soft natural frontal light. Constraints: one fictional person only, no text, no emoji, no labels, no tears exaggerated into melodrama, no diagnosis cues, no watermark.
```

| 素材编号 | `{EMOTION}` 最终值 |
|---|---|
| `U02-EDU-EXPR-ANGER-01` | restrained anger: brows drawn inward, lips pressed, steady direct gaze and slightly tense shoulders |
| `U02-EDU-EXPR-ANXIETY-01` | anxiety: raised inner brows, slightly parted lips, uncertain side gaze and hands held close to the body |
| `U02-EDU-EXPR-JOY-01` | genuine joy: relaxed brows, bright eyes, natural open smile and relaxed shoulders |
| `U02-EDU-EXPR-SADNESS-01` | sadness: raised inner brows, lowered gaze, gently downturned lips and softened posture |
| `U02-EDU-EXPR-FEAR-01` | fear: widened eyes, raised brows, slightly open mouth and body leaning subtly back |
| `U02-EDU-EXPR-SURPRISE-01` | surprise: raised curved brows, widened eyes, small rounded open mouth and attentive upright posture |

## 5. 生成记录字段

生成完成后，在本文件附录记录调用日期、原始输出、清理命令、成品路径、实际尺寸、透明/构图 QA 和版本。若生成结果与提示词不符，保留编号、递增版本，不覆盖已批准文件。

## 6. v001 生成记录（2026-07-26）

- 六张场景原图：`artifacts/imagegen/unit-02/*-source.png`；居中裁切为 1920x1080、WebP q88；联系表 `docs/assets/reports/unit-02/scene-contact-sheet.jpg`，无人物、文字、假 UI，构图通过。
- 五件透明装置原图：同目录 `*-source.png`；使用 `prepare_transparent_asset.py --threshold 52 --feather-threshold 108 --trim --padding 12` 清理；JSON 在 `docs/assets/reports/unit-02/`，三底色联系表为 `transparent-contact-sheet.png`。
- 六张表情原图：同目录 `anger/anxiety/joy/sadness/fear/surprise-source.png`；居中裁切为 768x768 WebP q90；联系表 `expression-contact-sheet.jpg`，表情可辨且无文字。
- 版本：以上均为 v001，状态 `approved`；镜框 933x1484、卷轴 1454x738、工具箱 1015x947、打字机 1536x993、策略箱 1009x977。
