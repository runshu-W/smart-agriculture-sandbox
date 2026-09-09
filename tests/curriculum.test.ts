import { describe, expect, it } from "vitest";
import { countsTowardUnitProgress, deriveUnitStatus, findNextM2ARoute, findNextUnitFiveRoute, findNextUnitFourRoute, findNextUnitThreeRoute, findNextUnitTwoRoute, M2A_INTERACTIONS, shouldEmitUnitCompletion, shouldEmitUnitOneCompletion, UNIT_FIVE_INTERACTIONS, UNIT_FIVE_MAIN_INTERACTIONS, UNIT_FOUR_INTERACTIONS, UNIT_FOUR_MAIN_INTERACTIONS, UNIT_ONE_MAIN_INTERACTIONS, UNIT_THREE_INTERACTIONS, UNIT_THREE_MAIN_INTERACTIONS, UNIT_TWO_MAIN_INTERACTIONS } from "@/lib/curriculum";
import { UNIT_THREE_ISOLATION_PERSPECTIVES, UNIT_THREE_QUESTIONS } from "@/lib/unit-three-content";
import { UNIT_FOUR_QUESTION_SETS } from "@/lib/unit-four-content";
import { UNIT_FIVE_QUESTION_SETS } from "@/lib/unit-five-content";
import { getAuthoredQuestions } from "@/lib/question-bank";

describe("program progression", () => {
  it("derives all four unit states", () => {
    expect(deriveUnitStatus({ published: false, started: false, completedCount: 0, totalInteractions: 5 })).toBe("LOCKED");
    expect(deriveUnitStatus({ published: true, started: false, completedCount: 0, totalInteractions: 5 })).toBe("NOT_STARTED");
    expect(deriveUnitStatus({ published: true, started: true, completedCount: 2, totalInteractions: 5 })).toBe("IN_PROGRESS");
    expect(deriveUnitStatus({ published: true, started: true, completedCount: 5, totalInteractions: 5 })).toBe("COMPLETED");
  });

  it("continues at the first unfinished Unit 1 main interaction", () => {
    expect(findNextM2ARoute([])).toBe("/student/unit-01/entry");
    expect(findNextM2ARoute(M2A_INTERACTIONS.slice(0, 2).map((item) => item.id))).toBe("/student/unit-01/thresher");
    expect(findNextM2ARoute(M2A_INTERACTIONS.map((item) => item.id))).toBe("/student/unit-01/activity/u01-mod-01-harvester");
    expect(findNextM2ARoute(UNIT_ONE_MAIN_INTERACTIONS.map((item) => item.id))).toBe("/student/unit-01");
  });

  it("emits unit completion only from the final main interaction", () => {
    expect(shouldEmitUnitOneCompletion("u01-assess-03-role-card", true, UNIT_ONE_MAIN_INTERACTIONS.length)).toBe(true);
    expect(shouldEmitUnitOneCompletion("u01-story-01-select", true, UNIT_ONE_MAIN_INTERACTIONS.length)).toBe(false);
    expect(shouldEmitUnitOneCompletion("u01-assess-03-role-card", false, UNIT_ONE_MAIN_INTERACTIONS.length)).toBe(false);
  });

  it("continues and completes Unit 2 from its 15 authored main interactions", () => {
    expect(UNIT_TWO_MAIN_INTERACTIONS).toHaveLength(15);
    expect(findNextUnitTwoRoute([])).toBe("/student/unit-02/activity/u02-mirror-01-activate");
    expect(findNextUnitTwoRoute(UNIT_TWO_MAIN_INTERACTIONS.map((item) => item.id))).toBe("/student/unit-02");
    expect(shouldEmitUnitCompletion("unit-02", "u02-completion-growth-tree", true, 15)).toBe(true);
    expect(countsTowardUnitProgress("unit-02", "u02-treehole-01-write")).toBe(false);
  });

  it("registers all Unit 3 interactions while counting only the 14-item main line", () => {
    expect(UNIT_THREE_INTERACTIONS).toHaveLength(20);
    expect(UNIT_THREE_MAIN_INTERACTIONS).toHaveLength(14);
    expect(findNextUnitThreeRoute([])).toBe("/student/unit-03/activity/u03-comm-01-manager");
    expect(findNextUnitThreeRoute(UNIT_THREE_MAIN_INTERACTIONS.map((item) => item.id))).toBe("/student/unit-03");
    expect(shouldEmitUnitCompletion("unit-03", "u03-completion-harmony-gate", true, 14)).toBe(true);
    expect(countsTowardUnitProgress("unit-03", "u03-empathy-01-role")).toBe(false);
  });

  it("keeps Unit 3 interaction questions aligned with the requirement source", () => {
    expect(UNIT_THREE_QUESTIONS["u03-comm-01-manager"].question).toBe("你的直播电商项目进展顺利，但物流成本比预算超了 15%。向王总汇报时，你会怎么说？");
    expect(UNIT_THREE_QUESTIONS["u03-festival-02-dependencies"].question).toBe("活动策划组因为方案意见不统一，进度卡在了 60%。作为团队，你会怎么处理？");
    expect(UNIT_THREE_QUESTIONS["u03-mediation-03-misunderstanding"].options[3]).toBe("先私下找到操作失误的那位成员，让他自己去澄清");
    expect(UNIT_THREE_QUESTIONS["u03-empathy-02-dialogue"].options[1]).toBe("爸，我知道你是为我好。但你愿意花 10 分钟听我说说我的计划吗？");
  });

  it("keeps each Case #001 role on its own perspective question", () => {
    expect(UNIT_THREE_ISOLATION_PERSPECTIVES["小赵"].question).toBe("面对被孤立的情况，你会怎么做？");
    expect(UNIT_THREE_ISOLATION_PERSPECTIVES["小赵"].options).toEqual([
      "默默忍受，觉得过段时间就好了",
      "主动找一位看起来比较友善的同事，真诚地请教工作问题",
      "在朋友圈发“含沙射影”的文字，暗示有人在排挤自己",
      "直接找领导反映情况，要求处理",
    ]);
    expect(UNIT_THREE_ISOLATION_PERSPECTIVES["同事"].question).toContain("忽视、议论新同事小赵");
    expect(UNIT_THREE_ISOLATION_PERSPECTIVES["调解人"].question).toContain("作为调解人");
  });

  it("maps multi-step and multi-perspective questions to stable managed keys", () => {
    expect(getAuthoredQuestions("u03-comm-02-team").map((item) => item.key)).toEqual(["first", "second"]);
    expect(getAuthoredQuestions("u03-mediation-01-isolation").map((item) => item.key)).toEqual(["primary", "perspective-同事", "perspective-调解人"]);
    expect(getAuthoredQuestions("u01-trad-01-plow")[0].key).toBe("primary");
    expect(getAuthoredQuestions("u01-trad-02-thresher")[0].correct).toEqual(["B"]);
  });

  it("registers 20 main and 6 side interactions for Unit 4", () => {
    expect(UNIT_FOUR_INTERACTIONS).toHaveLength(26);
    expect(UNIT_FOUR_MAIN_INTERACTIONS).toHaveLength(20);
    expect(findNextUnitFourRoute([])).toBe("/student/unit-04/activity/u04-learn-01-material");
    expect(findNextUnitFourRoute(UNIT_FOUR_MAIN_INTERACTIONS.map((item) => item.id))).toBe("/student/unit-04");
    expect(shouldEmitUnitCompletion("unit-04", "u04-completion", true, 20)).toBe(true);
    expect(countsTowardUnitProgress("unit-04", "u04-method-01-pomodoro")).toBe(false);
  });

  it("keeps Unit 4 questions and incomplete authoring boundaries aligned with source", () => {
    expect(UNIT_FOUR_QUESTION_SETS["u04-learn-03-quiz"][0].question).toBe("无人机巡田界面中，航线规划区的主要功能是什么？");
    expect(UNIT_FOUR_QUESTION_SETS["u04-learn-05-apply"]).toHaveLength(2);
    expect(UNIT_FOUR_QUESTION_SETS["u04-story-02-quiz"][1].options[1]).toBe("让孙子帮他看哪里做得不好，下次改进");
    expect(UNIT_FOUR_QUESTION_SETS["u04-digital-03-ai"][0].question).toBe("当你发现 AI 生成的推广文案有事实错误时，最佳做法是？");
  });

  it("registers every authored Unit 4 question for teacher publishing", () => {
    for (const [interactionId, questions] of Object.entries(UNIT_FOUR_QUESTION_SETS)) {
      expect(getAuthoredQuestions(interactionId)).toHaveLength(questions.length);
    }
  });

  it("registers 21 main and 4 side interactions for Unit 5", () => {
    expect(UNIT_FIVE_INTERACTIONS).toHaveLength(25);
    expect(UNIT_FIVE_MAIN_INTERACTIONS).toHaveLength(21);
    expect(findNextUnitFiveRoute([])).toBe("/student/unit-05/activity/u05-path-01-role");
    expect(findNextUnitFiveRoute(UNIT_FIVE_MAIN_INTERACTIONS.map((item) => item.id))).toBe("/student/unit-05");
    expect(shouldEmitUnitCompletion("unit-05", "u05-ending-01-future", true, 21)).toBe(true);
    expect(countsTowardUnitProgress("unit-05", "u05-letter-01-time")).toBe(false);
  });

  it("keeps Unit 5 source questions and missing future nodes explicit", () => {
    expect(UNIT_FIVE_QUESTION_SETS["u05-path-01-role"][0].question).toBe("在查看职业发展路径后，你认为决定职业晋升最重要的因素是？");
    expect(UNIT_FIVE_QUESTION_SETS["u05-path-04-startup"][0].options[3]).toBe("等到万事俱备、零风险了再开始");
    expect(UNIT_FIVE_QUESTION_SETS["u05-plan-05-action"][0].question).toBe("在制定实施计划时，以下哪项行动最不应该出现在计划中？");
    expect(UNIT_FIVE_QUESTION_SETS["u05-prophecy-02-sim"]).toHaveLength(1);
    expect(UNIT_FIVE_QUESTION_SETS["u05-prophecy-02-sim"][0].question).toBe("2028 年：公司引入了AI 直播系统，可以 24 小时自动直播。你作为电商主播，会？");
  });

  it("registers every authored Unit 5 question for teacher publishing", () => {
    for (const [interactionId, questions] of Object.entries(UNIT_FIVE_QUESTION_SETS)) {
      expect(getAuthoredQuestions(interactionId)).toHaveLength(questions.length);
    }
  });
});
