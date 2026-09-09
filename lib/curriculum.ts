export type UnitStatus = "LOCKED" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export const PROGRAM_UNITS = [
  { id: "unit-01", number: "01", title: "时代导航 生涯筑梦", description: "穿越农业三个时代，体验五类岗位并建立初始职业定位。", route: "/student/unit-01", totalInteractions: 18, published: true },
  { id: "unit-02", number: "02", title: "认识自我 健康成长", description: "认识兴趣、性格和能力，在挫折与情绪任务中发展心理韧性。", route: "/student/unit-02", totalInteractions: 15, published: true },
  { id: "unit-03", number: "03", title: "和谐交往 快乐生活", description: "在沟通、协作与矛盾调解中建立健康的职场关系。", route: "/student/unit-03", totalInteractions: 14, published: true },
  { id: "unit-04", number: "04", title: "学会学习 终身受益", description: "掌握学习方法与数字工具，形成持续成长的学习力。", route: "/student/unit-04", totalInteractions: 20, published: true },
  { id: "unit-05", number: "05", title: "规划生涯 放飞梦想", description: "回顾成长证据，完成岗位匹配与个人生涯规划。", route: "/student/unit-05", totalInteractions: 21, published: true },
] as const;

export type UnitOneInteraction = {
  id: string;
  taskId: string;
  title: string;
  type: string;
  order: number;
  route: string;
  section: "入口" | "传统农业馆" | "现代农业馆" | "智慧农业馆" | "五岗位试岗" | "职业测评" | "新农人故事馆" | "职业初印象墙";
  main: boolean;
};

export type UnitTwoInteraction = {
  id: string;
  taskId: string;
  title: string;
  type: string;
  order: number;
  route: string;
  section: "自我认知镜像屋" | "挫折模拟田野" | "情绪管理实验室" | "青春花园" | "成长之树" | "心灵树洞" | "情绪能量站";
  main: boolean;
};

export type UnitThreeInteraction = {
  id: string;
  taskId: string;
  title: string;
  type: string;
  order: number;
  route: string;
  section: "职场沟通大厅" | "丰收节协作广场" | "矛盾调解室" | "感恩之墙" | "和谐之门" | "关系图谱花园" | "同理心剧场";
  main: boolean;
};

export type UnitFourInteraction = {
  id: string;
  taskId: string;
  title: string;
  type: string;
  order: number;
  route: string;
  section: "限时技能学习" | "AI 技能大比拼" | "行业大咖分享会" | "学习计划制定" | "结业仪式" | "学习方法工具箱" | "数字技能竞技场";
  main: boolean;
};

export type UnitFiveInteraction = {
  id: string;
  taskId: string;
  title: string;
  type: string;
  order: number;
  route: string;
  section: "职业发展路径探索" | "成长档案回顾" | "岗位匹配度分析" | "职业生涯规划书" | "梦想发布仪式" | "未来之境" | "未来职场预言书" | "时光邮局";
  main: boolean;
};

export const UNIT_ONE_INTERACTIONS = [
  { id: "u01-entry-invitation", taskId: "u01-task-entry", title: "智慧农业元宇宙邀请函", type: "animated-entry", order: 1, route: "/student/unit-01/entry", section: "入口", main: true },
  { id: "u01-trad-01-plow", taskId: "u01-task-traditional-hall", title: "木犁与牛耕", type: "timed-animation", order: 1, route: "/student/unit-01/traditional/plow", section: "传统农业馆", main: true },
  { id: "u01-trad-02-thresher", taskId: "u01-task-traditional-hall", title: "手摇脱粒机", type: "drag-rotation", order: 2, route: "/student/unit-01/thresher", section: "传统农业馆", main: true },
  { id: "u01-trad-03-seasons", taskId: "u01-task-traditional-hall", title: "蓑衣斗笠与节气牌", type: "explore-flip", order: 3, route: "/student/unit-01/traditional/seasons", section: "传统农业馆", main: true },
  { id: "u01-mod-01-harvester", taskId: "u01-task-modern-hall", title: "联合收割机", type: "harvester-simulation", order: 1, route: "/student/unit-01/activity/u01-mod-01-harvester", section: "现代农业馆", main: true },
  { id: "u01-mod-02-greenhouse", taskId: "u01-task-modern-hall", title: "温室控制系统", type: "greenhouse-control", order: 2, route: "/student/unit-01/activity/u01-mod-02-greenhouse", section: "现代农业馆", main: true },
  { id: "u01-mod-03-irrigation", taskId: "u01-task-modern-hall", title: "水肥一体化", type: "irrigation-control", order: 3, route: "/student/unit-01/activity/u01-mod-03-irrigation", section: "现代农业馆", main: true },
  { id: "u01-smart-01-drone", taskId: "u01-task-smart-hall", title: "植保无人机", type: "drone-flight", order: 1, route: "/student/unit-01/activity/u01-smart-01-drone", section: "智慧农业馆", main: true },
  { id: "u01-smart-02-sensor", taskId: "u01-task-smart-hall", title: "土壤传感器", type: "sensor-console", order: 2, route: "/student/unit-01/activity/u01-smart-02-sensor", section: "智慧农业馆", main: true },
  { id: "u01-smart-03-ai-scan", taskId: "u01-task-smart-hall", title: "AI 病虫害识别", type: "ai-scan", order: 3, route: "/student/unit-01/activity/u01-smart-03-ai-scan", section: "智慧农业馆", main: true },
  { id: "u01-job-01-streamer", taskId: "u01-task-jobs", title: "助农电商主播", type: "live-pitch", order: 1, route: "/student/unit-01/activity/u01-job-01-streamer", section: "五岗位试岗", main: true },
  { id: "u01-job-02-operator", taskId: "u01-task-jobs", title: "智慧农场运营师", type: "farm-operator", order: 2, route: "/student/unit-01/activity/u01-job-02-operator", section: "五岗位试岗", main: true },
  { id: "u01-job-03-brand", taskId: "u01-task-jobs", title: "品牌策划师", type: "brand-slogan", order: 3, route: "/student/unit-01/activity/u01-job-03-brand", section: "五岗位试岗", main: true },
  { id: "u01-job-04-commerce", taskId: "u01-task-jobs", title: "乡村电商运营官", type: "order-fulfillment", order: 4, route: "/student/unit-01/activity/u01-job-04-commerce", section: "五岗位试岗", main: true },
  { id: "u01-job-05-founder", taskId: "u01-task-jobs", title: "新农人创业家", type: "venture-choice", order: 5, route: "/student/unit-01/activity/u01-job-05-founder", section: "五岗位试岗", main: true },
  { id: "u01-assess-01-quiz", taskId: "u01-task-assessment", title: "涉农职业倾向测评", type: "career-assessment", order: 1, route: "/student/unit-01/activity/u01-assess-01-quiz", section: "职业测评", main: true },
  { id: "u01-assess-02-report", taskId: "u01-task-assessment", title: "个性化职业报告", type: "career-report", order: 2, route: "/student/unit-01/activity/u01-assess-02-report", section: "职业测评", main: true },
  { id: "u01-assess-03-role-card", taskId: "u01-task-assessment", title: "主岗位与角色卡", type: "role-card", order: 3, route: "/student/unit-01/activity/u01-assess-03-role-card", section: "职业测评", main: true },
  { id: "u01-story-01-select", taskId: "u01-task-story", title: "选择新农人故事", type: "story-selection", order: 1, route: "/student/unit-01/activity/u01-story-01-select", section: "新农人故事馆", main: false },
  { id: "u01-story-02-media", taskId: "u01-task-story", title: "纪实短片与知识节点", type: "story-media", order: 2, route: "/student/unit-01/activity/u01-story-02-media", section: "新农人故事馆", main: false },
  { id: "u01-story-03-reflection", taskId: "u01-task-story", title: "回答与感悟卡", type: "reflection-card", order: 3, route: "/student/unit-01/activity/u01-story-03-reflection", section: "新农人故事馆", main: false },
  { id: "u01-impression-01-original", taskId: "u01-task-impression", title: "记录原有认知", type: "original-notes", order: 1, route: "/student/unit-01/activity/u01-impression-01-original", section: "职业初印象墙", main: false },
  { id: "u01-impression-02-wall", taskId: "u01-task-impression", title: "浏览匿名便签", type: "impression-wall", order: 2, route: "/student/unit-01/activity/u01-impression-02-wall", section: "职业初印象墙", main: false },
  { id: "u01-impression-03-compare", taskId: "u01-task-impression", title: "新认知与前后对比", type: "impression-compare", order: 3, route: "/student/unit-01/activity/u01-impression-03-compare", section: "职业初印象墙", main: false },
] as const satisfies readonly UnitOneInteraction[];

export const UNIT_ONE_MAIN_INTERACTIONS = UNIT_ONE_INTERACTIONS.filter((item) => item.main);
export const UNIT_ONE_SIDE_INTERACTIONS = UNIT_ONE_INTERACTIONS.filter((item) => !item.main);
export const M2A_INTERACTIONS = UNIT_ONE_INTERACTIONS.slice(0, 4);

const u02 = (id: string, taskId: string, title: string, type: string, order: number, section: UnitTwoInteraction["section"], main = true): UnitTwoInteraction => ({
  id, taskId, title, type, order, section, main, route: `/student/unit-02/activity/${id}`,
});

export const UNIT_TWO_INTERACTIONS = [
  u02("u02-mirror-01-activate", "u02-task-mirror", "岗位镜像启动", "mirror-activation", 1, "自我认知镜像屋"),
  u02("u02-mirror-02-growth-scroll", "u02-task-mirror", "我的闪光点与成长空间", "growth-scroll", 2, "自我认知镜像屋"),
  u02("u02-mirror-03-swot", "u02-task-mirror", "SWOT 四维罗盘", "swot-compass", 3, "自我认知镜像屋"),
  u02("u02-frustration-01-live-crisis", "u02-task-frustration", "直播翻车情境", "live-crisis", 1, "挫折模拟田野"),
  u02("u02-frustration-02-emotion-dial", "u02-task-frustration", "情绪识别仪表", "emotion-dial", 2, "挫折模拟田野"),
  u02("u02-frustration-03-coping-toolbox", "u02-task-frustration", "应对策略工具箱", "coping-toolbox", 3, "挫折模拟田野"),
  u02("u02-frustration-04-farm-crisis", "u02-task-frustration", "农场设备故障", "priority-crisis", 4, "挫折模拟田野"),
  u02("u02-frustration-05-brand-rejection", "u02-task-frustration", "品牌方案被否定", "rejection-branch", 5, "挫折模拟田野"),
  u02("u02-lab-01-expression-decoder", "u02-task-lab", "表情解码器", "expression-decoder", 1, "情绪管理实验室"),
  u02("u02-lab-02-emotion-translator", "u02-task-lab", "情绪翻译机", "emotion-translator", 2, "情绪管理实验室"),
  u02("u02-lab-03-regulation-cabin", "u02-task-lab", "情绪调节舱", "regulation-cabin", 3, "情绪管理实验室"),
  u02("u02-team-01-role-claim", "u02-task-team", "团队角色认领", "team-role-claim", 1, "青春花园"),
  u02("u02-team-02-communication", "u02-task-team", "沟通温度挑战", "team-communication", 2, "青春花园"),
  u02("u02-team-03-showcase", "u02-task-team", "团队成果展评", "team-showcase", 3, "青春花园"),
  u02("u02-completion-growth-tree", "u02-task-completion", "成长之树", "growth-tree", 1, "成长之树"),
  u02("u02-treehole-01-write", "u02-task-treehole", "写下心事", "treehole-write", 1, "心灵树洞", false),
  u02("u02-treehole-02-respond", "u02-task-treehole", "送出温暖", "treehole-respond", 2, "心灵树洞", false),
  u02("u02-treehole-03-receive", "u02-task-treehole", "收到温暖", "treehole-receive", 3, "心灵树洞", false),
  u02("u02-energy-01-collect", "u02-task-energy", "收集 12 种能量工具", "energy-collect", 1, "情绪能量站", false),
  u02("u02-energy-02-card", "u02-task-energy", "制作情绪急救卡", "emergency-card", 2, "情绪能量站", false),
  u02("u02-energy-03-practice", "u02-task-energy", "策略模拟演练", "strategy-practice", 3, "情绪能量站", false),
] as const satisfies readonly UnitTwoInteraction[];

export const UNIT_TWO_MAIN_INTERACTIONS = UNIT_TWO_INTERACTIONS.filter((item) => item.main);
export const UNIT_TWO_SIDE_INTERACTIONS = UNIT_TWO_INTERACTIONS.filter((item) => !item.main);

const u03 = (id: string, taskId: string, title: string, type: string, order: number, section: UnitThreeInteraction["section"], main = true): UnitThreeInteraction => ({
  id, taskId, title, type, order, section, main, route: `/student/unit-03/activity/${id}`,
});

export const UNIT_THREE_INTERACTIONS = [
  u03("u03-comm-01-manager", "u03-task-communication", "与上级沟通", "manager-briefing", 1, "职场沟通大厅"),
  u03("u03-comm-02-team", "u03-task-communication", "与同事沟通", "team-coordination", 2, "职场沟通大厅"),
  u03("u03-comm-03-customer", "u03-task-communication", "与客户沟通", "customer-complaint", 3, "职场沟通大厅"),
  u03("u03-festival-01-role", "u03-task-festival", "队长选举与任务分配", "festival-role-allocation", 1, "丰收节协作广场"),
  u03("u03-festival-02-dependencies", "u03-task-festival", "协作执行与进度关联", "festival-dependencies", 2, "丰收节协作广场"),
  u03("u03-festival-03-conflict", "u03-task-festival", "意见分歧处理", "festival-conflict", 3, "丰收节协作广场"),
  u03("u03-festival-04-showcase", "u03-task-festival", "丰收节成果展示", "festival-showcase", 4, "丰收节协作广场"),
  u03("u03-mediation-01-isolation", "u03-task-mediation", "被孤立的同事", "case-isolation", 1, "矛盾调解室"),
  u03("u03-mediation-02-temptation", "u03-task-mediation", "走捷径的代价", "case-temptation", 2, "矛盾调解室"),
  u03("u03-mediation-03-misunderstanding", "u03-task-mediation", "被误解的委屈", "case-misunderstanding", 3, "矛盾调解室"),
  u03("u03-gratitude-01-write", "u03-task-gratitude", "选择感恩对象", "gratitude-write", 1, "感恩之墙"),
  u03("u03-gratitude-02-card", "u03-task-gratitude", "感恩卡片生成与赠送", "gratitude-card", 2, "感恩之墙"),
  u03("u03-gratitude-03-resonate", "u03-task-gratitude", "欣赏他人的感恩", "gratitude-resonate", 3, "感恩之墙"),
  u03("u03-completion-harmony-gate", "u03-task-completion", "和谐之门", "harmony-gate", 1, "和谐之门"),
  u03("u03-relation-01-network", "u03-task-relation", "绘制关系网络", "relationship-network", 1, "关系图谱花园", false),
  u03("u03-relation-02-style", "u03-task-relation", "沟通风格分析", "communication-style", 2, "关系图谱花园", false),
  u03("u03-relation-03-plan", "u03-task-relation", "关系改善计划", "relationship-plan", 3, "关系图谱花园", false),
  u03("u03-empathy-01-role", "u03-task-empathy", "角色选择与准备", "empathy-role", 1, "同理心剧场", false),
  u03("u03-empathy-02-dialogue", "u03-task-empathy", "情境演绎", "empathy-dialogue", 2, "同理心剧场", false),
  u03("u03-empathy-03-review", "u03-task-empathy", "复盘与感悟", "empathy-review", 3, "同理心剧场", false),
] as const satisfies readonly UnitThreeInteraction[];

export const UNIT_THREE_MAIN_INTERACTIONS = UNIT_THREE_INTERACTIONS.filter((item) => item.main);
export const UNIT_THREE_SIDE_INTERACTIONS = UNIT_THREE_INTERACTIONS.filter((item) => !item.main);

const u04 = (id: string, taskId: string, title: string, type: string, order: number, section: UnitFourInteraction["section"], main = true): UnitFourInteraction => ({
  id, taskId, title, type, order, section, main, route: `/student/unit-04/activity/${id}`,
});

export const UNIT_FOUR_INTERACTIONS = [
  u04("u04-learn-01-material", "u04-task-learning", "任务 A 学习材料领取", "drone-material", 1, "限时技能学习"),
  u04("u04-learn-02-match", "u04-task-learning", "无人机界面识别练习", "icon-drag-match", 2, "限时技能学习"),
  u04("u04-learn-03-quiz", "u04-task-learning", "任务 A 限时知识检测", "timed-quiz", 3, "限时技能学习"),
  u04("u04-learn-04-dashboard", "u04-task-learning", "任务 B 数据看板学习", "dashboard-explore", 4, "限时技能学习"),
  u04("u04-learn-05-apply", "u04-task-learning", "数据解读应用练习", "data-card-apply", 5, "限时技能学习"),
  u04("u04-learn-06-reflect", "u04-task-learning", "学习方法反思", "method-reflection", 6, "限时技能学习"),
  u04("u04-learn-07-live-material", "u04-task-learning", "任务 C 直播话术学习", "live-material", 7, "限时技能学习"),
  u04("u04-learn-08-live", "u04-task-learning", "模拟直播实战", "live-practice", 8, "限时技能学习"),
  u04("u04-learn-09-report", "u04-task-learning", "学习能力自评与总结", "learning-report", 9, "限时技能学习"),
  u04("u04-ai-01-explore", "u04-task-ai", "AI 工具初体验", "ai-terminal-explore", 1, "AI 技能大比拼"),
  u04("u04-ai-02-collaborate", "u04-task-ai", "人机协作挑战", "human-ai-collaboration", 2, "AI 技能大比拼"),
  u04("u04-ai-03-debate", "u04-task-ai", "AI 会取代我们吗", "ai-debate", 3, "AI 技能大比拼"),
  u04("u04-ai-04-confidence", "u04-task-ai", "数字化学习信心评估", "confidence-charger", 4, "AI 技能大比拼"),
  u04("u04-story-01-watch", "u04-task-story", "选择观看新农人故事", "story-player", 1, "行业大咖分享会"),
  u04("u04-story-02-quiz", "u04-task-story", "故事理解检测", "story-quiz", 2, "行业大咖分享会"),
  u04("u04-story-03-insight", "u04-task-story", "个人感悟与行动计划", "insight-star", 3, "行业大咖分享会"),
  u04("u04-plan-01-review", "u04-task-plan", "回顾学习数据", "evidence-review", 1, "学习计划制定"),
  u04("u04-plan-02-create", "u04-task-plan", "制定学习计划", "learning-map", 2, "学习计划制定"),
  u04("u04-plan-03-seal", "u04-task-plan", "计划分享与承诺", "plan-seal", 3, "学习计划制定"),
  u04("u04-completion", "u04-task-completion", "终身学习者结业仪式", "learning-crystal", 1, "结业仪式"),
  u04("u04-method-01-pomodoro", "u04-task-method", "番茄工作法体验", "pomodoro", 1, "学习方法工具箱", false),
  u04("u04-method-02-mindmap", "u04-task-method", "思维导图练习", "mindmap", 2, "学习方法工具箱", false),
  u04("u04-method-03-feynman", "u04-task-method", "费曼学习法挑战", "feynman-class", 3, "学习方法工具箱", false),
  u04("u04-digital-01-search", "u04-task-digital", "农业信息检索·初级", "source-search", 1, "数字技能竞技场", false),
  u04("u04-digital-02-data", "u04-task-digital", "数据分析入门·中级", "chart-lab", 2, "数字技能竞技场", false),
  u04("u04-digital-03-ai", "u04-task-digital", "AI 工具协作·高级", "ai-audit", 3, "数字技能竞技场", false),
] as const satisfies readonly UnitFourInteraction[];

export const UNIT_FOUR_MAIN_INTERACTIONS = UNIT_FOUR_INTERACTIONS.filter((item) => item.main);
export const UNIT_FOUR_SIDE_INTERACTIONS = UNIT_FOUR_INTERACTIONS.filter((item) => !item.main);

const u05 = (id: string, taskId: string, title: string, type: string, order: number, section: UnitFiveInteraction["section"], main = true): UnitFiveInteraction => ({
  id, taskId, title, type, order, section, main, route: `/student/unit-05/activity/${id}`,
});

export const UNIT_FIVE_INTERACTIONS = [
  u05("u05-path-01-role", "u05-task-path", "选择岗位，查看发展路径", "career-staircase", 1, "职业发展路径探索"),
  u05("u05-path-02-stage", "u05-task-path", "发展阶段深入探索", "stage-explorer", 2, "职业发展路径探索"),
  u05("u05-path-03-tech-manage", "u05-task-path", "技术路线还是管理路线", "fork-compass", 3, "职业发展路径探索"),
  u05("u05-path-04-startup", "u05-task-path", "创业还是就业", "risk-road", 4, "职业发展路径探索"),
  u05("u05-path-05-change", "u05-task-path", "面对行业变化", "change-road", 5, "职业发展路径探索"),
  u05("u05-memory-01-radar", "u05-task-memory", "四维度雷达图回顾", "growth-radar", 1, "成长档案回顾"),
  u05("u05-memory-02-replay", "u05-task-memory", "关键转折点回放", "memory-replay", 2, "成长档案回顾"),
  u05("u05-memory-03-mirror", "u05-task-memory", "入学初期与现在对比", "time-mirror", 3, "成长档案回顾"),
  u05("u05-match-01-report", "u05-task-match", "查看五岗位匹配度报告", "career-match", 1, "岗位匹配度分析"),
  u05("u05-match-02-challenge", "u05-task-match", "匹配度深度解读", "challenge-analysis", 2, "岗位匹配度分析"),
  u05("u05-plan-01-open", "u05-task-plan", "打开规划系统", "planning-boot", 1, "职业生涯规划书"),
  u05("u05-plan-02-self", "u05-task-plan", "自我认知模块填写", "self-planning", 2, "职业生涯规划书"),
  u05("u05-plan-03-environment", "u05-task-plan", "环境分析模块", "environment-planning", 3, "职业生涯规划书"),
  u05("u05-plan-04-goal", "u05-task-plan", "职业目标模块", "goal-staircase", 4, "职业生涯规划书"),
  u05("u05-plan-05-action", "u05-task-plan", "实施计划模块", "action-gantt", 5, "职业生涯规划书"),
  u05("u05-plan-06-adjust", "u05-task-plan", "评估调整模块", "review-cycle", 6, "职业生涯规划书"),
  u05("u05-plan-07-save", "u05-task-plan", "规划书完成与保存", "planning-book", 7, "职业生涯规划书"),
  u05("u05-dream-01-publish", "u05-task-dream", "发布梦想", "dream-publish", 1, "梦想发布仪式"),
  u05("u05-dream-02-peer", "u05-task-dream", "同伴互动", "peer-support", 2, "梦想发布仪式"),
  u05("u05-dream-03-message", "u05-task-dream", "农小智总结寄语", "mentor-message", 3, "梦想发布仪式"),
  u05("u05-ending-01-future", "u05-task-ending", "进入未来之境", "future-ending", 1, "未来之境"),
  u05("u05-prophecy-01-book", "u05-task-prophecy", "打开未来职场预言书", "prophecy-book", 1, "未来职场预言书", false),
  u05("u05-prophecy-02-sim", "u05-task-prophecy", "情景推演", "future-simulation", 2, "未来职场预言书", false),
  u05("u05-letter-01-time", "u05-task-letter", "选择写信时间", "letter-time", 1, "时光邮局", false),
  u05("u05-letter-02-seal", "u05-task-letter", "写信与密封", "letter-seal", 2, "时光邮局", false),
] as const satisfies readonly UnitFiveInteraction[];

export const UNIT_FIVE_MAIN_INTERACTIONS = UNIT_FIVE_INTERACTIONS.filter((item) => item.main);
export const UNIT_FIVE_SIDE_INTERACTIONS = UNIT_FIVE_INTERACTIONS.filter((item) => !item.main);

export const SIMPLE_INTERACTION_RULES: Record<string, { acceptedAnswers: readonly string[]; requiresNarration: boolean; actionKey: string }> = {
  "u01-entry-invitation": { acceptedAnswers: [], requiresNarration: false, actionKey: "invitationOpened" },
  "u01-trad-01-plow": { acceptedAnswers: ["A", "B", "C", "D"], requiresNarration: true, actionKey: "animationCompleted" },
  "u01-trad-03-seasons": { acceptedAnswers: ["A"], requiresNarration: true, actionKey: "proverbViewed" },
  "u01-mod-01-harvester": { acceptedAnswers: ["C"], requiresNarration: true, actionKey: "animationCompleted" },
  "u01-mod-02-greenhouse": { acceptedAnswers: ["A"], requiresNarration: true, actionKey: "adjusted" },
  "u01-mod-03-irrigation": { acceptedAnswers: ["A"], requiresNarration: true, actionKey: "valveOpened" },
  "u01-smart-01-drone": { acceptedAnswers: ["A"], requiresNarration: true, actionKey: "flightCompleted" },
  "u01-smart-02-sensor": { acceptedAnswers: ["A"], requiresNarration: true, actionKey: "datasetsViewed" },
  "u01-smart-03-ai-scan": { acceptedAnswers: ["A"], requiresNarration: true, actionKey: "scanCompleted" },
  "u01-job-01-streamer": { acceptedAnswers: [], requiresNarration: false, actionKey: "contentSubmitted" },
  "u01-job-02-operator": { acceptedAnswers: [], requiresNarration: false, actionKey: "parametersInRange" },
  "u01-job-03-brand": { acceptedAnswers: [], requiresNarration: false, actionKey: "contentSubmitted" },
  "u01-job-04-commerce": { acceptedAnswers: [], requiresNarration: false, actionKey: "orderShipped" },
  "u01-job-05-founder": { acceptedAnswers: [], requiresNarration: false, actionKey: "projectSelected" },
  "u01-assess-01-quiz": { acceptedAnswers: [], requiresNarration: false, actionKey: "assessmentCompleted" },
  "u01-assess-02-report": { acceptedAnswers: [], requiresNarration: false, actionKey: "reportViewed" },
  "u01-assess-03-role-card": { acceptedAnswers: [], requiresNarration: false, actionKey: "roleCardCreated" },
  "u01-story-01-select": { acceptedAnswers: [], requiresNarration: false, actionKey: "storiesSelected" },
  "u01-story-02-media": { acceptedAnswers: [], requiresNarration: false, actionKey: "mediaReviewed" },
  "u01-story-03-reflection": { acceptedAnswers: [], requiresNarration: false, actionKey: "contentSubmitted" },
  "u01-impression-01-original": { acceptedAnswers: [], requiresNarration: false, actionKey: "notesSubmitted" },
  "u01-impression-02-wall": { acceptedAnswers: [], requiresNarration: false, actionKey: "notesViewed" },
  "u01-impression-03-compare": { acceptedAnswers: [], requiresNarration: false, actionKey: "comparisonCreated" },
  "u02-mirror-01-activate": { acceptedAnswers: [], requiresNarration: false, actionKey: "mirrorActivated" },
  "u02-mirror-02-growth-scroll": { acceptedAnswers: [], requiresNarration: false, actionKey: "growthPlanCreated" },
  "u02-mirror-03-swot": { acceptedAnswers: [], requiresNarration: false, actionKey: "swotCompleted" },
  "u02-frustration-01-live-crisis": { acceptedAnswers: [], requiresNarration: false, actionKey: "crisisViewed" },
  "u02-frustration-02-emotion-dial": { acceptedAnswers: [], requiresNarration: false, actionKey: "emotionLabeled" },
  "u02-frustration-03-coping-toolbox": { acceptedAnswers: [], requiresNarration: false, actionKey: "strategyApplied" },
  "u02-frustration-04-farm-crisis": { acceptedAnswers: [], requiresNarration: false, actionKey: "prioritySubmitted" },
  "u02-frustration-05-brand-rejection": { acceptedAnswers: [], requiresNarration: false, actionKey: "rejectionHandled" },
  "u02-lab-01-expression-decoder": { acceptedAnswers: [], requiresNarration: false, actionKey: "expressionsDecoded" },
  "u02-lab-02-emotion-translator": { acceptedAnswers: [], requiresNarration: false, actionKey: "messageTranslated" },
  "u02-lab-03-regulation-cabin": { acceptedAnswers: [], requiresNarration: false, actionKey: "methodsCompleted" },
  "u02-team-01-role-claim": { acceptedAnswers: [], requiresNarration: false, actionKey: "roleClaimed" },
  "u02-team-02-communication": { acceptedAnswers: [], requiresNarration: false, actionKey: "communicationPlanSubmitted" },
  "u02-team-03-showcase": { acceptedAnswers: [], requiresNarration: false, actionKey: "showcaseSubmitted" },
  "u02-completion-growth-tree": { acceptedAnswers: [], requiresNarration: false, actionKey: "growthTreeViewed" },
  "u02-treehole-01-write": { acceptedAnswers: [], requiresNarration: false, actionKey: "concernProcessed" },
  "u02-treehole-02-respond": { acceptedAnswers: [], requiresNarration: false, actionKey: "warmthSent" },
  "u02-treehole-03-receive": { acceptedAnswers: [], requiresNarration: false, actionKey: "warmthReceived" },
  "u02-energy-01-collect": { acceptedAnswers: [], requiresNarration: false, actionKey: "topStrategiesSelected" },
  "u02-energy-02-card": { acceptedAnswers: [], requiresNarration: false, actionKey: "emergencyCardCreated" },
  "u02-energy-03-practice": { acceptedAnswers: [], requiresNarration: false, actionKey: "practiceCompleted" },
  "u03-comm-01-manager": { acceptedAnswers: [], requiresNarration: false, actionKey: "briefingCompleted" },
  "u03-comm-02-team": { acceptedAnswers: [], requiresNarration: false, actionKey: "coordinationCompleted" },
  "u03-comm-03-customer": { acceptedAnswers: [], requiresNarration: false, actionKey: "complaintHandled" },
  "u03-festival-01-role": { acceptedAnswers: [], requiresNarration: false, actionKey: "rolesAllocated" },
  "u03-festival-02-dependencies": { acceptedAnswers: [], requiresNarration: false, actionKey: "delayResolved" },
  "u03-festival-03-conflict": { acceptedAnswers: [], requiresNarration: false, actionKey: "conflictResolved" },
  "u03-festival-04-showcase": { acceptedAnswers: [], requiresNarration: false, actionKey: "showcaseCompleted" },
  "u03-mediation-01-isolation": { acceptedAnswers: [], requiresNarration: false, actionKey: "caseResolved" },
  "u03-mediation-02-temptation": { acceptedAnswers: [], requiresNarration: false, actionKey: "caseResolved" },
  "u03-mediation-03-misunderstanding": { acceptedAnswers: [], requiresNarration: false, actionKey: "caseResolved" },
  "u03-gratitude-01-write": { acceptedAnswers: [], requiresNarration: false, actionKey: "gratitudeWritten" },
  "u03-gratitude-02-card": { acceptedAnswers: [], requiresNarration: false, actionKey: "cardGenerated" },
  "u03-gratitude-03-resonate": { acceptedAnswers: [], requiresNarration: false, actionKey: "resonanceCompleted" },
  "u03-completion-harmony-gate": { acceptedAnswers: [], requiresNarration: false, actionKey: "gateOpened" },
  "u03-relation-01-network": { acceptedAnswers: [], requiresNarration: false, actionKey: "networkCreated" },
  "u03-relation-02-style": { acceptedAnswers: [], requiresNarration: false, actionKey: "styleAnalyzed" },
  "u03-relation-03-plan": { acceptedAnswers: [], requiresNarration: false, actionKey: "planCreated" },
  "u03-empathy-01-role": { acceptedAnswers: [], requiresNarration: false, actionKey: "roleSelected" },
  "u03-empathy-02-dialogue": { acceptedAnswers: [], requiresNarration: false, actionKey: "dialogueCompleted" },
  "u03-empathy-03-review": { acceptedAnswers: [], requiresNarration: false, actionKey: "reviewCompleted" },
  ...Object.fromEntries(UNIT_FOUR_INTERACTIONS.map((item) => [item.id, { acceptedAnswers: [], requiresNarration: false, actionKey: "unitFourCompleted" }])),
  ...Object.fromEntries(UNIT_FIVE_INTERACTIONS.map((item) => [item.id, { acceptedAnswers: [], requiresNarration: false, actionKey: "unitFiveCompleted" }])),
};

export function deriveUnitStatus(input: { published: boolean; started: boolean; completedCount: number; totalInteractions: number }): UnitStatus {
  if (!input.published) return "LOCKED";
  if (input.completedCount >= input.totalInteractions) return "COMPLETED";
  return input.started ? "IN_PROGRESS" : "NOT_STARTED";
}

export function findNextUnitOneRoute(completedInteractionIds: Iterable<string>) {
  const completed = new Set(completedInteractionIds);
  return UNIT_ONE_MAIN_INTERACTIONS.find((interaction) => !completed.has(interaction.id))?.route ?? "/student/unit-01";
}

export const findNextM2ARoute = findNextUnitOneRoute;

export function getUnitOneInteraction(id: string) {
  return UNIT_ONE_INTERACTIONS.find((item) => item.id === id);
}

export function getUnitTwoInteraction(id: string) {
  return UNIT_TWO_INTERACTIONS.find((item) => item.id === id);
}

export function getUnitThreeInteraction(id: string) {
  return UNIT_THREE_INTERACTIONS.find((item) => item.id === id);
}

export function getUnitFourInteraction(id: string) {
  return UNIT_FOUR_INTERACTIONS.find((item) => item.id === id);
}

export function getUnitFiveInteraction(id: string) {
  return UNIT_FIVE_INTERACTIONS.find((item) => item.id === id);
}

export function getCurriculumInteraction(id: string) {
  return getUnitOneInteraction(id) ?? getUnitTwoInteraction(id) ?? getUnitThreeInteraction(id) ?? getUnitFourInteraction(id) ?? getUnitFiveInteraction(id);
}

export function getMainInteractionsForUnit(unitId: string) {
  if (unitId === "unit-02") return UNIT_TWO_MAIN_INTERACTIONS;
  if (unitId === "unit-03") return UNIT_THREE_MAIN_INTERACTIONS;
  if (unitId === "unit-04") return UNIT_FOUR_MAIN_INTERACTIONS;
  if (unitId === "unit-05") return UNIT_FIVE_MAIN_INTERACTIONS;
  return UNIT_ONE_MAIN_INTERACTIONS;
}

export function findNextUnitTwoRoute(completedInteractionIds: Iterable<string>) {
  const completed = new Set(completedInteractionIds);
  return UNIT_TWO_MAIN_INTERACTIONS.find((interaction) => !completed.has(interaction.id))?.route ?? "/student/unit-02";
}

export function findNextUnitThreeRoute(completedInteractionIds: Iterable<string>) {
  const completed = new Set(completedInteractionIds);
  return UNIT_THREE_MAIN_INTERACTIONS.find((interaction) => !completed.has(interaction.id))?.route ?? "/student/unit-03";
}

export function findNextUnitFourRoute(completedInteractionIds: Iterable<string>) {
  const completed = new Set(completedInteractionIds);
  return UNIT_FOUR_MAIN_INTERACTIONS.find((interaction) => !completed.has(interaction.id))?.route ?? "/student/unit-04";
}

export function findNextUnitFiveRoute(completedInteractionIds: Iterable<string>) {
  const completed = new Set(completedInteractionIds);
  return UNIT_FIVE_MAIN_INTERACTIONS.find((interaction) => !completed.has(interaction.id))?.route ?? "/student/unit-05";
}

export function countsTowardUnitProgress(unitId: string, interactionId: string) {
  return getMainInteractionsForUnit(unitId).some((item) => item.id === interactionId);
}

export function shouldEmitUnitCompletion(unitId: string, interactionId: string, firstCompletion: boolean, completedMainCount: number) {
  const main = getMainInteractionsForUnit(unitId);
  return firstCompletion && main.some((item) => item.id === interactionId) && completedMainCount >= main.length;
}

export function getUnitBadge(unitId: string) {
  if (unitId === "unit-02") return "u02-mind-growth";
  if (unitId === "unit-03") return "u03-harmony-ambassador";
  if (unitId === "unit-04") return "u04-lifelong-learner";
  if (unitId === "unit-05") return "u05-dream-voyage";
  return "u01-era-awareness";
}

export function getAbilityIncrement(unitId: string, interactionId: string) {
  if (unitId === "unit-02") {
    return interactionId.startsWith("u02-team-")
      ? { psychological: 1, teamwork: 2 }
      : { psychological: 2, teamwork: 0 };
  }
  if (unitId === "unit-03") {
    return interactionId.startsWith("u03-festival-")
      ? { psychological: 1, teamwork: 2 }
      : { psychological: 1, teamwork: 1 };
  }
  if (unitId === "unit-04") return { psychological: 1, learningAbility: 2 };
  if (unitId === "unit-05") return { careerAbility: 2, psychological: 1, learningAbility: 1, teamwork: 1 };
  return { careerAbility: 2, learningAbility: 2 };
}

export function shouldEmitUnitOneCompletion(interactionId: string, firstCompletion: boolean, completedMainCount: number) {
  return firstCompletion
    && UNIT_ONE_MAIN_INTERACTIONS.some((item) => item.id === interactionId)
    && completedMainCount >= UNIT_ONE_MAIN_INTERACTIONS.length;
}
