export const FRAMEWORK_LAYERS = [
  { id: "macro", name: "宏观环境变化", position: "最外层", color: "#2475B8", examples: "政策红利 · 技术迭代 · 消费升级", direction: "向外读懂时代" },
  { id: "micro", name: "微观环境变化", position: "中间层", color: "#348664", examples: "行业洗牌 · 岗位重塑 · 供应链升级", direction: "中间看清行业" },
  { id: "self", name: "自身条件变化", position: "最内层", color: "#D17A31", examples: "能力短板 · 认知偏差 · 心理韧性不足", direction: "向内认清自我" },
] as const;
export const FRAMEWORK_EVENTS = [
  { id: "ai", title: "AI数字主播上线", description: "新的直播技术进入助农电商，原有运营方式受到冲击。" },
  { id: "farmer", title: "张大叔维权诉求", description: "合作农户要求运营团队给出销路方案，服务关系和责任需要重新审视。" },
  { id: "hesitation", title: "决策时的纠结焦虑", description: "面对四条决策路径，角色发现自己需要调整情绪、补足认知。" },
] as const;
export type FrameworkLayer = typeof FRAMEWORK_LAYERS[number]["id"];
export type FrameworkEvent = typeof FRAMEWORK_EVENTS[number]["id"];
export type FrameworkAnswer = { attempts: number; firstCorrect: boolean; solved: boolean; lastLayer: FrameworkLayer };
export type FrameworkProgress = Partial<Record<FrameworkEvent, FrameworkAnswer>>;
export function summarizeFramework(people: FrameworkProgress[]) {
  const attempted = people.filter(person => FRAMEWORK_EVENTS.some(event => !!person[event.id])).length;
  const completed = people.filter(person => FRAMEWORK_EVENTS.every(event => person[event.id]?.solved)).length;
  const rate = (value: number, count: number) => count ? Math.round(value / count * 1000) / 10 : null;
  return { total: people.length, attempted, completed, untouched: people.length - attempted,
    events: FRAMEWORK_EVENTS.map(event => {
      const answers = people.flatMap(person => person[event.id] ? [person[event.id]!] : []);
      const solved = answers.filter(answer => answer.solved).length;
      const firstCorrect = answers.filter(answer => answer.firstCorrect).length;
      return { id: event.id, attempted: answers.length, solved, firstCorrect, pending: people.length - answers.length, masteryRate: rate(solved, answers.length), firstCorrectRate: rate(firstCorrect, answers.length) };
    }) };
}
export type FrameworkStats = ReturnType<typeof summarizeFramework>;
