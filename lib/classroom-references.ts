export const PATH_REFERENCES = [
  { id: "transform", title: "转型", subtitle: "学习新技能，转向新领域", direction: "换一条路，寻找新的发展空间", opportunity: "把已有的农业与运营经验带到新岗位，探索新的需求。", risk: "需要投入学习时间，适应新岗位；新方向的需求仍需验证。", question: "我能迁移哪些能力？新领域真的需要这些能力吗？", example: "从直播运营转向农产品数字营销，先通过小项目检验新技能。" },
  { id: "stay", title: "坚守", subtitle: "在当前领域深耕", direction: "守住优势，持续观察变化", opportunity: "积累产地知识、客户信任和真人沟通优势，把现有工作做深。", risk: "市场变化可能持续；如果只等待而不改进，原有优势也会减弱。", question: "什么优势值得守住？出现什么信号时需要重新判断？", example: "继续真人助农直播，同时改善内容和服务，跟踪客户反馈。" },
  { id: "upgrade", title: "升级", subtitle: "叠加农业 + AI 新能力", direction: "在原有基础上增加新能力", opportunity: "把农业经验、人的温度与工具效率结合，拓展现有岗位价值。", risk: "需要持续学习与投入，工具结果仍要审核；效果需要实践检验。", question: "AI 可以辅助哪一步？哪些判断与信任仍需要由人承担？", example: "用 AI 辅助脚本和数据整理，由真人负责产地讲解与客户沟通。" },
] as const;
export type ReferenceId = typeof PATH_REFERENCES[number]["id"];
