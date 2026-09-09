import type { DataSource } from "@/generated/prisma/client";

export const LITERACY_DIMENSIONS = [
  { key: "literacy.political_identity", label: "政治认同" },
  { key: "literacy.professionalism", label: "职业精神" },
  { key: "literacy.rule_of_law", label: "法治观念" },
  { key: "literacy.sound_personality", label: "健全人格" },
  { key: "literacy.public_participation", label: "公共参与" },
] as const;

export const METRIC_REGISTRY = {
  "literacy.political_identity": { label: "政治认同", unit: "分", sources: ["SIMULATION", "XUEXITONG", "TEACHER_UPLOAD"] },
  "literacy.professionalism": { label: "职业精神", unit: "分", sources: ["SIMULATION", "XUEXITONG", "TEACHER_UPLOAD"] },
  "literacy.rule_of_law": { label: "法治观念", unit: "分", sources: ["SIMULATION", "XUEXITONG", "TEACHER_UPLOAD"] },
  "literacy.sound_personality": { label: "健全人格", unit: "分", sources: ["SIMULATION", "XUEXITONG", "TEACHER_UPLOAD"] },
  "literacy.public_participation": { label: "公共参与", unit: "分", sources: ["SIMULATION", "XUEXITONG", "TEACHER_UPLOAD"] },
  "psych.resilience": { label: "心理韧性", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "psych.frustration_completion": { label: "挫折任务完成率", unit: "%", sources: ["SIMULATION"] },
  "psych.strategy_count": { label: "情绪调节策略数", unit: "种", sources: ["SIMULATION", "XUEXITONG"] },
  "psych.anxiety": { label: "焦虑自评", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "psych.coping_active": { label: "主动求助", unit: "%", sources: ["SIMULATION"] },
  "psych.coping_adjust": { label: "自我调适", unit: "%", sources: ["SIMULATION"] },
  "psych.coping_avoid": { label: "放弃或逃避", unit: "%", sources: ["SIMULATION"] },
  "career.professional_identity": { label: "专业认同", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "career.job_cognition": { label: "岗位认知", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "career.craftsmanship": { label: "工匠精神", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "career.compliance_awareness": { label: "合规意识", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "career.action": { label: "行动力", unit: "分", sources: ["SIMULATION", "XUEXITONG"] },
  "career.plan_quality": { label: "规划书质量", unit: "分", sources: ["TEACHER_UPLOAD"] },
  "career.compliance_accuracy": { label: "合规识别正确率", unit: "%", sources: ["SIMULATION"] },
  "career.decision_quality": { label: "决策质量", unit: "分", sources: ["SIMULATION"] },
  "career.decision_latency": { label: "决策响应时间", unit: "秒", sources: ["SIMULATION"] },
  "career.preview_completion": { label: "预习完成率", unit: "%", sources: ["NATIONAL_PLATFORM", "XUEXITONG"] },
  "values.rural_identity": { label: "乡村振兴价值认同", unit: "%", sources: ["SIMULATION", "XUEXITONG"] },
  "values.youth_learning": { label: "青年大学习参与率", unit: "%", sources: ["TEACHER_UPLOAD"] },
  "values.team_active": { label: "主动担当", unit: "%", sources: ["SIMULATION"] },
  "values.team_passive": { label: "被动参与", unit: "%", sources: ["SIMULATION"] },
  "values.team_none": { label: "未参与", unit: "%", sources: ["SIMULATION"] },
  "values.service_hours": { label: "实践服务时长", unit: "小时", sources: ["TEACHER_UPLOAD"] },
  "values.ideology_completion": { label: "思政资源学习完成度", unit: "%", sources: ["NATIONAL_PLATFORM"] },
} as const satisfies Record<string, { label: string; unit: string; sources: readonly DataSource[] }>;

export type MetricKey = keyof typeof METRIC_REGISTRY | (typeof LITERACY_DIMENSIONS)[number]["key"];

export const SOURCE_META: Record<DataSource, { label: string; color: string }> = {
  SIMULATION: { label: "沙盘", color: "#2f9a68" },
  XUEXITONG: { label: "学习通", color: "#3578d4" },
  NATIONAL_PLATFORM: { label: "国家职业教育智慧教育平台", color: "#d2a323" },
  TEACHER_UPLOAD: { label: "教师上传", color: "#df7a38" },
};
