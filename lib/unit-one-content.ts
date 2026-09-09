export type ActivityChoice = { id: string; label: string };
export type ActivityContent = {
  eyebrow: string;
  description: string;
  instruction: string;
  narration?: string;
  question?: string;
  choices?: ActivityChoice[];
  correctFeedback?: string;
  retryFeedback?: string;
  background: string;
};

const choices = (items: string[]): ActivityChoice[] => items.map((label, index) => ({ id: String.fromCharCode(65 + index), label }));

export const ACTIVITY_CONTENT: Record<string, ActivityContent> = {
  "u01-mod-01-harvester": { eyebrow: "现代农业馆 · 01", description: "启动联合收割机，观察收割、脱粒和秸秆粉碎同步完成。", instruction: "启动设备并完整观察 10 亩作业演示。", narration: "联合收割机把多道工序合并在一条连续作业线上，显著减少重复劳动和等待时间。", question: "与传统手工作业相比，联合收割机最直接改变了什么？", choices: choices(["只改变作物品种", "只减少运输距离", "把多道工序机械化并显著提高效率", "让农田不再需要管理"]), correctFeedback: "判断准确。机械化的关键是工序整合与效率提升。", retryFeedback: "留意收割、脱粒和粉碎是同步发生的。", background: "/assets/unit-01/scenes/modern-hall-v001.webp" },
  "u01-mod-02-greenhouse": { eyebrow: "现代农业馆 · 02", description: "连续调节温度和通风，观察作物颜色与叶片舒展程度。", instruction: "将温度调到 20-30℃，并让通风量保持在 40%-80%。", narration: "设施农业通过可测量、可调节的环境参数，降低天气波动对生产的影响。", question: "温室控制系统的核心突破是什么？", choices: choices(["把生长环境从被动承受变为主动调控", "让所有作物使用同一参数", "完全替代种植人员", "只改变温室外观"]), correctFeedback: "很好，你抓住了环境可控这一核心。", retryFeedback: "回想滑杆如何连续改变作物状态。", background: "/assets/unit-01/scenes/modern-hall-v001.webp" },
  "u01-mod-03-irrigation": { eyebrow: "现代农业馆 · 03", description: "旋转阀门，让水肥沿管线精准抵达作物根部。", instruction: "开启阀门，观察 500 吨与 100 吨用水对比。", narration: "水肥一体化按需把水和养分送到根区，既节水，也减少无效流失。", question: "水肥一体化最重要的优势是什么？", choices: choices(["精准供给并提高水肥利用率", "让土地不再需要养分", "只适合观赏植物", "用水越多效果越好"]), correctFeedback: "正确。精准供给是节水和稳产的共同基础。", retryFeedback: "观察流动终点和用水量对比。", background: "/assets/unit-01/scenes/modern-hall-v001.webp" },
  "u01-smart-01-drone": { eyebrow: "智慧农业馆 · 01", description: "规划植保无人机起飞并沿预设航线完成精准喷洒。", instruction: "启动航线，完整飞行后查看作业参数。", narration: "无人机按航线稳定作业，并用位置和流量控制提升覆盖效率与药液利用率。", question: "智慧植保最关键的价值是什么？", choices: choices(["精准、快速并减少人员暴露", "飞得越高越好", "完全不需要作业规划", "只用于拍摄风景"]), correctFeedback: "判断准确。效率、安全和精准需要同时成立。", retryFeedback: "结合 100 亩/小时和 90% 利用率思考。", background: "/assets/unit-01/scenes/smart-hall-v001.webp" },
  "u01-smart-02-sensor": { eyebrow: "智慧农业馆 · 02", description: "连接土壤传感器，在中央屏切换温湿度、养分和 pH 数据。", instruction: "连接设备并至少查看两类数据。", narration: "传感器把不可见的土壤状态转成连续数据，帮助管理者在异常扩大前做出判断。", question: "土壤传感数据最直接支持哪项工作？", choices: choices(["按真实状态调整灌溉和施肥", "替代所有田间观察", "自动改变土壤类型", "只用于展示图表"]), correctFeedback: "正确。数据的价值在于支持及时、适量的管理。", retryFeedback: "想一想湿度、氮磷钾和 pH 会影响哪些操作。", background: "/assets/unit-01/scenes/smart-hall-v001.webp" },
  "u01-smart-03-ai-scan": { eyebrow: "智慧农业馆 · 03", description: "从预设病害图像中选择样本，完成 3 秒扫描并查看防治方案。", instruction: "选择一张作物图像并启动识别。", narration: "预设图像识别能够快速给出病害线索、程度和处置建议，但最终决策仍需结合田间情况。", question: "AI 病虫害识别的最大价值是什么？", choices: choices(["快速辅助发现问题并给出处置线索", "保证任何情况下都百分百正确", "替代全部农业专家", "只生成好看的图片"]), correctFeedback: "很好。它是提高诊断效率的辅助工具，不是无条件替代判断。", retryFeedback: "注意结果页同时给出了病害、程度和方案。", background: "/assets/unit-01/scenes/smart-hall-v001.webp" },
  "u01-job-01-streamer": { eyebrow: "岗位体验舱 · 01", description: "为一份当季番茄完成结构清楚、真实可信的助农推介。", instruction: "选择文字或语音模式，完成产品特点、产地和行动引导。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-job-02-operator": { eyebrow: "岗位体验舱 · 02", description: "根据作物状态调节温室光照和温度。", instruction: "把光照调到 8000-12000 lux，温度调到 22-26℃。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-job-03-brand": { eyebrow: "岗位体验舱 · 03", description: "为高山番茄设计一句简洁、真实的产品广告语。", instruction: "输入不超过 15 个汉字的广告语，至少包含产品或产地特点。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-job-04-commerce": { eyebrow: "岗位体验舱 · 04", description: "核对订单关键信息并完成规范发货。", instruction: "依次核对姓名、地址、电话，再填写指定物流单号。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-job-05-founder": { eyebrow: "岗位体验舱 · 05", description: "从真实农业方向中选择创业项目并说明理由。", instruction: "选择一个项目，写下 1-2 句与需求、资源或能力有关的理由。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-assess-01-quiz": { eyebrow: "职业测评 · 01", description: "从兴趣、性格和能力三个维度完成 12 题自我探索。", instruction: "按真实感受作答，可返回修改；结果不用于给你贴标签。", background: "/assets/global/scenes/project-home-v001.webp" },
  "u01-assess-02-report": { eyebrow: "职业测评 · 02", description: "根据上一环节的真实答案生成三维画像与五岗位匹配。", instruction: "查看每个维度与岗位的计算结果，选择一个岗位展开。", background: "/assets/global/scenes/project-home-v001.webp" },
  "u01-assess-03-role-card": { eyebrow: "职业测评 · 03", description: "结合报告选择主岗位、头像和昵称，生成第一张职业角色卡。", instruction: "匹配度最高项会被标注，但最终选择权属于你。", background: "/assets/global/scenes/project-home-v001.webp" },
  "u01-story-01-select": { eyebrow: "支线 · 新农人故事馆", description: "从十位不同方向的新农人案例中选择三位。", instruction: "至少选择三位你想进一步了解的实践者。", background: "/assets/unit-01/scenes/story-hall-v001.webp" },
  "u01-story-02-media": { eyebrow: "支线 · 纪实短片", description: "沿知识时间轴了解返乡动机、困难、行动和成果。", instruction: "正式授权视频待接入；当前使用明确标识的教学分镜预览，不伪装为纪实原片。", background: "/assets/unit-01/scenes/story-hall-v001.webp" },
  "u01-story-03-reflection": { eyebrow: "支线 · 感悟卡", description: "记录新农人面对的困难，以及对你最有启发的行动。", instruction: "完成两段具体反思，生成“乡土情怀”感悟卡。", background: "/assets/unit-01/scenes/story-hall-v001.webp" },
  "u01-impression-01-original": { eyebrow: "支线 · 职业初印象墙", description: "在体验前记录你对涉农职业的三个原有认识。", instruction: "每条写一个具体印象，可选择匿名展示。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-impression-02-wall": { eyebrow: "支线 · 匿名便签墙", description: "浏览同学公开的匿名便签，发现彼此不同的起点。", instruction: "至少打开三张便签，可为有启发的内容点赞。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
  "u01-impression-03-compare": { eyebrow: "支线 · 认知升级", description: "填写三个新认识，与体验前内容形成前后对比。", instruction: "把抽象评价改写成可观察的岗位、技术或能力证据。", background: "/assets/unit-01/scenes/career-hub-v001.webp" },
};
