import { ACTIVITY_CONTENT } from "@/lib/unit-one-content";
import { UNIT_FIVE_QUESTION_SETS } from "@/lib/unit-five-content";
import { UNIT_FOUR_QUESTION_SETS } from "@/lib/unit-four-content";
import { UNIT_THREE_ISOLATION_PERSPECTIVES, UNIT_THREE_QUESTIONS } from "@/lib/unit-three-content";

export type AuthoredQuestion = {
  interactionId: string;
  key: string;
  prompt: string;
  options: readonly string[];
  correct: readonly string[];
  feedback: readonly string[];
};

const choiceIds = ["A", "B", "C", "D", "E"];
const authored: AuthoredQuestion[] = [];

for (const [interactionId, content] of Object.entries(ACTIVITY_CONTENT)) {
  if (!content.question || !content.choices?.length) continue;
  authored.push({
    interactionId,
    key: "primary",
    prompt: content.question,
    options: content.choices.map((item) => item.label),
    correct: [content.choices[0].id],
    feedback: [content.correctFeedback ?? "已记录", ...content.choices.slice(1).map(() => content.retryFeedback ?? "请结合场景再思考")],
  });
}

authored.push(
  { interactionId: "u01-trad-01-plow", key: "primary", prompt: "传统生产方式的局限体现在哪些方面？", options: ["生产效率极低", "劳动强度极大", "完全依赖天气", "产量不稳定"], correct: ["A", "B", "C", "D"], feedback: ["四项均是传统生产方式的真实局限。"] },
  { interactionId: "u01-trad-02-thresher", key: "primary", prompt: "5 亩稻田需要多少小时完成脱粒？", options: ["4 小时", "40 小时", "400 小时", "4000 小时"], correct: ["B"], feedback: ["先计算总产量，再除以每小时产能。"] },
  { interactionId: "u01-trad-03-seasons", key: "primary", prompt: "依靠经验安排农事，最大的风险是什么？", options: ["无法应对极端天气", "节气与实际气候不符", "不同地区经验不通用", "年轻人不会传承"], correct: ["A"], feedback: ["突发极端天气可能直接影响整年收成。"] },
);

const unitTwoQuestions: Array<[string, string, string[], number]> = [
  ["u02-mirror-01-activate", "你觉得这个岗位最需要什么能力？", ["沟通表达能力", "数据分析能力", "创意思维能力", "统筹管理能力"], 0],
  ["u02-frustration-01-live-crisis", "你的第一反应是？", ["先离开直播间", "稳住呼吸，回应一条具体问题", "立刻反驳所有质疑", "僵住，不知道说什么"], 1],
  ["u02-frustration-04-farm-crisis", "你的整体处置方式是什么？", ["先安抚农场主，再排查", "排查设备并同步进度", "停下来等明确指令", "全部交给外部人员"], 1],
  ["u02-frustration-05-brand-rejection", "品牌方案被否定后，你会怎么做？", ["当场据理力争", "会后了解否定的具体原因", "以后不再主动提想法", "情绪上来后直接离场"], 1],
  ["u02-team-01-role-claim", "两位同学都想担任同一角色，你会怎么做？", ["谁声音大听谁的", "各自说明优势并协商分工", "干脆都不担任", "让组长直接指定且不解释"], 1],
  ["u02-team-02-communication", "团队如何推进分歧？", ["立即投票，少数服从多数", "组长直接决定", "先邀请不同观点，再确定标准", "限定时间讨论后按共同标准决策"], 3],
  ["u02-treehole-02-respond", "面对同伴的困扰，哪种回应更安全？", ["立即给出判断", "陪伴并允许对方慢慢说", "比较谁更辛苦", "要求对方振作"], 1],
  ["u02-energy-03-practice", "设备连续报警、负责人催问时，你最接近哪种感受？", ["焦虑", "开心", "无聊"], 0],
];
for (const [interactionId, prompt, options, best] of unitTwoQuestions) authored.push({ interactionId, key: "primary", prompt, options, correct: [choiceIds[best]], feedback: ["依据场景反馈形成下一步行动。"] });

for (const [key, item] of Object.entries(UNIT_THREE_QUESTIONS)) {
  const interactionId = key.startsWith("u03-comm-02-team-") ? "u03-comm-02-team" : key;
  authored.push({ interactionId, key: key === interactionId ? "primary" : key.replace(`${interactionId}-`, ""), prompt: item.question, options: item.options, correct: [choiceIds[item.best]], feedback: item.feedback });
}
for (const [perspective, item] of Object.entries(UNIT_THREE_ISOLATION_PERSPECTIVES)) {
  if (perspective === "小赵") continue;
  authored.push({ interactionId: "u03-mediation-01-isolation", key: `perspective-${perspective}`, prompt: item.question, options: item.options, correct: [choiceIds[item.best]], feedback: item.feedback });
}

for (const [interactionId, items] of Object.entries(UNIT_FOUR_QUESTION_SETS)) items.forEach((item, index) => authored.push({ interactionId, key: `question-${index + 1}`, prompt: item.question, options: item.options, correct: [choiceIds[item.best]], feedback: item.feedback }));
for (const [interactionId, items] of Object.entries(UNIT_FIVE_QUESTION_SETS)) items.forEach((item, index) => authored.push({ interactionId, key: `question-${index + 1}`, prompt: item.question, options: item.options, correct: [choiceIds[item.best]], feedback: item.feedback }));

export const AUTHORED_QUESTIONS = authored;

export function getAuthoredQuestions(interactionId: string) {
  return AUTHORED_QUESTIONS.filter((item) => item.interactionId === interactionId);
}
