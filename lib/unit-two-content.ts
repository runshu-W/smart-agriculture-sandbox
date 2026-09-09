import type { ActivityContent } from "@/lib/unit-one-content";

const scene = {
  mirror: "/assets/unit-02/scenes/mirror-house-v001.webp",
  field: "/assets/unit-02/scenes/frustration-field-v001.webp",
  lab: "/assets/unit-02/scenes/emotion-lab-v001.webp",
  garden: "/assets/unit-02/scenes/youth-garden-v001.webp",
  treehole: "/assets/unit-02/scenes/tree-hole-v001.webp",
  energy: "/assets/unit-02/scenes/energy-station-v001.webp",
} as const;

const content = (eyebrow: string, description: string, instruction: string, background: string): ActivityContent => ({ eyebrow, description, instruction, background });

export const UNIT_TWO_CONTENT: Record<string, ActivityContent> = {
  "u02-mirror-01-activate": content("镜像屋 · 01", "让第一单元的职业角色走进心灵之镜，观察五项岗位能力。", "启动镜像，再选择你认为岗位最需要的能力。", scene.mirror),
  "u02-mirror-02-growth-scroll": content("镜像屋 · 02", "把已有行为证据整理为闪光点，并选择两个值得继续练习的成长空间。", "拖动或点击标签完成两项成长计划，可使用农小智推荐。", scene.mirror),
  "u02-mirror-03-swot": content("镜像屋 · 03", "从内在优势、成长空间和外部机会、挑战四个方向认识自己。", "转动罗盘并完成四个象限，生成个人策略地图。", scene.mirror),
  "u02-frustration-01-live-crisis": content("挫折田野 · 01", "田间直播遭遇评论风暴，在线人数和场景状态会实时变化。", "完整观看危机演绎，再选择你的第一反应。", scene.field),
  "u02-frustration-02-emotion-dial": content("挫折田野 · 02", "先给感受命名，再观察对应的身体信号与行动影响。", "拖动仪表指针选择感受；着陆练习可自愿体验。", scene.field),
  "u02-frustration-03-coping-toolbox": content("挫折田野 · 03", "从四种应对工具中选择一种，观察直播后续如何改变。", "打开工具箱并体验一个完整策略分支。", scene.field),
  "u02-frustration-04-farm-crisis": content("挫折田野 · 04", "温控故障、作物风险与农场主催问同时出现。", "调整处置优先级并提交你的方案。", scene.field),
  "u02-frustration-05-brand-rejection": content("挫折田野 · 05", "两周完成的品牌方案在会议中被公开否定。", "选择回应方式，观察当场与会后的不同结果。", scene.field),
  "u02-lab-01-expression-decoder": content("情绪实验室 · 识别区", "六块教学屏呈现农业电商场景中的不同表情。", "把六个情绪标签逐一匹配到对应人物。", scene.lab),
  "u02-lab-02-emotion-translator": content("情绪实验室 · 表达区", "把指责式表达翻译为具体、可沟通的 I-message。", "切换表达模式并补全一条“我感到…因为…我希望…”。", scene.lab),
  "u02-lab-03-regulation-cabin": content("情绪实验室 · 调节区", "依次练习呼吸、重评、暗示、运动和书写五种方法。", "每种方法完成 10 秒可视化体验，最后选择偏好。", scene.lab),
  "u02-team-01-role-claim": content("青春花园 · 01", "在共享设备上查看五类团队角色并协商认领。", "旋转查看徽章，认领角色并处理一次角色冲突。", scene.garden),
  "u02-team-02-communication": content("青春花园 · 02", "用沟通温度计观察团队讨论状态，形成共享纪要。", "标记温度、填写纪要并选择推进方式。", scene.garden),
  "u02-team-03-showcase": content("青春花园 · 03", "组合产品卖点、视觉主题与展示话术，生成团队成果海报。", "完成三项内容，由组长在共享设备上提交。", scene.garden),
  "u02-completion-growth-tree": content("成长之树", "树根、枝叶与果实由你的真实完成数据和策略覆盖生长。", "查看完整成长过程并领取心灵成长徽章。", scene.garden),
  "u02-treehole-01-write": content("支线 · 心灵树洞", "这里允许写下、选词，也允许暂时不说。", "选择一个安全方式把此刻的困扰送入树洞。", scene.treehole),
  "u02-treehole-02-respond": content("支线 · 心灵树洞", "阅读经过审核的匿名示例，用陪伴、肯定或资源回应。", "选择一种温暖回应，也可以安静陪伴。", scene.treehole),
  "u02-treehole-03-receive": content("支线 · 心灵树洞", "打开确定性安全回信，让信封逐渐组成花束。", "至少打开一封回信；全部打开可组成完整花束。", scene.treehole),
  "u02-energy-01-collect": content("支线 · 情绪能量站", "三层轨道上有 12 种可迁移的情绪调节工具。", "至少完成三种 15 秒体验，并把 TOP3 放入策略箱。", scene.energy),
  "u02-energy-02-card": content("支线 · 情绪能量站", "把早期信号和有效策略整理成只属于你的情绪急救卡。", "完成三部分内容并生成可打印卡片。", scene.energy),
  "u02-energy-03-practice": content("支线 · 情绪能量站", "在农业职场短情境中练习识别、选择和执行三步。", "依次完成三个步骤，让场景能量恢复。", scene.energy),
};
