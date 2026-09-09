export const CAREER_DIMENSIONS = ["interest", "personality", "ability"] as const;
export type CareerDimension = typeof CAREER_DIMENSIONS[number];

export const CAREER_QUESTIONS = [
  ["看到优质农产品时，我愿意主动向别人介绍它。", "interest"],
  ["我喜欢观察作物状态和环境数据的变化。", "interest"],
  ["我愿意尝试为农产品构思名称和故事。", "interest"],
  ["面对新项目，我会先了解真实用户和市场。", "interest"],
  ["在多人协作中，我通常愿意清楚表达并倾听。", "personality"],
  ["设备或流程出错时，我能先排查再行动。", "personality"],
  ["面对不确定结果，我愿意小步试验和调整。", "personality"],
  ["我重视承诺，会核对信息后再提交结果。", "personality"],
  ["我能从多项数据中发现异常或趋势。", "ability"],
  ["我能把复杂内容整理成易懂的表达。", "ability"],
  ["我能按步骤完成订单、记录或设备操作。", "ability"],
  ["我能把一个目标拆成近期可执行的行动。", "ability"],
] as const satisfies readonly (readonly [string, CareerDimension])[];

export type CareerProfile = {
  dimensions: Record<CareerDimension, number>;
  matches: { id: string; title: string; score: number }[];
};

export function calculateCareerProfile(answers: number[]): CareerProfile {
  const totals: Record<CareerDimension, number[]> = { interest: [], personality: [], ability: [] };
  CAREER_QUESTIONS.forEach(([, dimension], index) => totals[dimension].push(answers[index] ?? 3));
  const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 20);
  const dimensions = {
    interest: average(totals.interest),
    personality: average(totals.personality),
    ability: average(totals.ability),
  };
  const raw = [
    ["streamer", "助农电商主播", dimensions.interest * .45 + dimensions.personality * .25 + dimensions.ability * .30],
    ["operator", "智慧农场运营师", dimensions.interest * .20 + dimensions.personality * .30 + dimensions.ability * .50],
    ["brand", "品牌策划师", dimensions.interest * .45 + dimensions.personality * .20 + dimensions.ability * .35],
    ["commerce", "乡村电商运营官", dimensions.interest * .20 + dimensions.personality * .40 + dimensions.ability * .40],
    ["founder", "新农人创业家", dimensions.interest * .30 + dimensions.personality * .40 + dimensions.ability * .30],
  ] as const;
  return {
    dimensions,
    matches: raw.map(([id, title, score]) => ({ id, title, score: Math.round(score) })).sort((a, b) => b.score - a.score),
  };
}
