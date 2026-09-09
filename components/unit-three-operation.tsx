"use client";

import Image from "next/image";
import { ArrowRight, CalendarDays, Check, ChevronRight, CirclePause, CirclePlay, Eye, FileText, Gamepad2, Heart, Lightbulb, LockKeyhole, Megaphone, RotateCcw, Send, Sparkles, Sprout, TentTree, UserRound, Users, Volume2, WandSparkles } from "lucide-react";
import { useState } from "react";
import type { UnitThreeInteraction } from "@/lib/curriculum";
import { UNIT_THREE_ISOLATION_PERSPECTIVES, UNIT_THREE_QUESTIONS, type UnitThreeQuestion } from "@/lib/unit-three-content";
import type { UnitThreeCompletion, UnitThreeEvidence } from "@/components/unit-three-activity";
import { useManagedQuestion } from "@/components/managed-questions-provider";

type Props = { interaction: UnitThreeInteraction; evidence: UnitThreeEvidence; onComplete: (result: UnitThreeCompletion) => void; pending: boolean };
const managerStateAssets = {
  neutral: "/assets/unit-03/characters/manager/neutral-v001.png",
  approve: "/assets/unit-03/characters/manager/approve-v001.png",
  frown: "/assets/unit-03/characters/manager/frown-v001.png",
  phone: "/assets/unit-03/characters/manager/phone-v001.png",
} as const;

function ChoicePanel({ data, value, onChange, managedIndex = 0, managedKey }: { data: UnitThreeQuestion; value: number | null; onChange: (index: number) => void; managedIndex?: number; managedKey?: string }) {
  const { question, check } = useManagedQuestion(managedIndex, managedKey); const [managedResult, setManagedResult] = useState<{ correct: boolean; feedback: string } | null>(null); const options = question?.options ?? data.options;
  const choose = async (index: number) => { if (question && check) setManagedResult(await check(question, String.fromCharCode(65 + index))); onChange(index); };
  return <div className="u03-question"><h2>{question?.prompt ?? data.question}</h2><div className="u03-options">{options.map((option, index) => <button className={value === index ? "active" : ""} key={`${index}-${option}`} onClick={() => void choose(index)}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></button>)}</div>{value !== null && <div className={`u03-feedback ${(managedResult?.correct ?? value === data.best) ? "best" : "reflect"}`}><Lightbulb /><p>{managedResult?.feedback ?? data.feedback[value]}</p></div>}</div>;
}

function ManagerBriefing({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-comm-01-manager"];
  const [outline, setOutline] = useState(false); const [started, setStarted] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  const state: keyof typeof managerStateAssets = choice === 3 ? "frown" : choice === 1 ? "frown" : choice === 0 ? "approve" : choice === 2 ? "approve" : "neutral";
  const trust = choice === null ? 50 : [48, 52, 60, 38][choice];
  return <div className="u03-console manager-console"><div className="manager-scene"><div className="manager-window"><Image alt={`王总${state}状态`} fill sizes="360px" src={managerStateAssets[state]} /></div><div className="trust-meter"><span>王总信任值</span><i><b style={{ width: `${trust}%` }} /></i><strong>{trust}</strong></div>{choice === 0 && <small className="future-warning">两周后——物流成本问题爆发，王总震怒</small>}</div>{!started ? <section className="prep-panel"><div className="prep-timer"><b>30</b><span>秒沟通准备</span></div><button className="secondary-button" onClick={() => setOutline(!outline)}><FileText />{outline ? "收起汇报提纲" : "查看汇报提纲"}</button>{outline && <ol><li>进展：销售额达到目标 120%</li><li>问题：物流成本超预算 15%</li><li>方案：供应商或包装规格优化</li></ol>}<button className="primary-button" onClick={() => setStarted(true)}>直接开始汇报<ArrowRight /></button></section> : <section><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { briefingCompleted: true, strategy: ["good-news-only", "problem-only", "progress-problem-solution", "blame"][choice], outlineViewed: outline, trustDelta: trust - 50, preparationSeconds: 30 } })}>确认汇报结果<Check /></button>}</section>}</div>;
}

function TeamCoordination({ onComplete }: Pick<Props, "onComplete">) {
  const [phase, setPhase] = useState(0); const [first, setFirst] = useState<number | null>(null); const [second, setSecond] = useState<number | null>(null);
  const temp = 42 + (first === null ? 0 : [-2, 18, 5, -12][first]) + (second === null ? 0 : [2, 6, 16, -2][second]);
  const data = phase === 0 ? UNIT_THREE_QUESTIONS["u03-comm-02-team-first"] : UNIT_THREE_QUESTIONS["u03-comm-02-team-second"];
  const value = phase === 0 ? first : second;
  return <div className="u03-console team-coordinate"><div className="colleague-stage"><Image alt="运营小李、设计小张和技术小王" fill sizes="620px" src="/assets/unit-03/characters/colleague-team-v001.png" /><div className="team-temperature"><b>{temp}</b><span>团队氛围 / 100</span><i><em style={{ width: `${temp}%` }} /></i></div>{phase === 1 && <div className="participation-rings"><i /><i /><i /></div>}</div><section><div className="stage-dots"><b className={phase === 0 ? "active" : "done"}>1 倾听</b><b className={phase === 1 ? "active" : ""}>2 协商</b></div><ChoicePanel data={data} managedIndex={phase} onChange={phase === 0 ? setFirst : setSecond} value={value} />{phase === 0 && first !== null && <button className="primary-button" onClick={() => setPhase(1)}>听完大家的情况<ChevronRight /></button>}{phase === 1 && second !== null && <button className="primary-button" onClick={() => onComplete({ summary: { coordinationCompleted: true, openingStyle: ["command", "listen", "notify", "threat"][first ?? 0], allocationStyle: ["equal", "ability", "willingness-ability", "lottery"][second], atmosphere: temp, allMembersHeard: first === 1 } })}>保存协调结果<Check /></button>}</section></div>;
}

function CustomerComplaint({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-comm-03-customer"];
  const [played, setPlayed] = useState(false); const [order, setOrder] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  const emotion = choice === null ? 15 : [35, 70, 5, 45][choice];
  return <div className="u03-console customer-console"><div className="customer-chat"><header><span>乡村美食家</span><b className="anger-tag">差评威胁</b><i>主管在线</i></header><div className="voice-message"><button aria-label={played ? "暂停客户语音" : "播放客户语音"} onClick={() => setPlayed(!played)}>{played ? <CirclePause /> : <CirclePlay />}</button><div className={played ? "playing" : ""}>{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div><b>60″</b></div>{played && <p>“你们发的苹果一半都烂了！这已经是第二次了！我要退货+赔偿！我要在网上曝光你们！”</p>}<button className="order-history" onClick={() => setOrder(!order)}><Eye />客户历史订单</button>{order && <aside><b>回头客</b><strong>累计消费 3000+ 元</strong><span>近期 8 笔订单</span></aside>}<div className="customer-emotion"><span>客户情绪值</span><i><b style={{ width: `${emotion}%` }} /></i><strong>{emotion}</strong></div></div><section><div className="learn-law"><b>L</b><b>E</b><b>A</b><b>R</b><b>N</b><span>倾听 → 共情 → 道歉 → 回应 → 引导</span></div><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { complaintHandled: true, strategy: ["investigate", "empathy", "rules", "rational"][choice], customerEmotionStart: 15, customerEmotionEnd: emotion, historyViewed: order, learnComplete: choice === 1, voicePlayed: played } })}>发送回复<Send /></button>}</section></div>;
}

const festivalFlags = [{ name: "活动策划", color: "#e5a82e", Icon: CalendarDays }, { name: "宣传推广", color: "#2377b7", Icon: Megaphone }, { name: "现场布置", color: "#168a58", Icon: TentTree }, { name: "互动环节", color: "#e77b32", Icon: Gamepad2 }, { name: "总协调", color: "#d94c45", Icon: WandSparkles }];
const members = ["小禾", "小李", "小张", "小王", "小陈"];

function FestivalRoles({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-festival-01-role"];
  const [leader, setLeader] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [assignments, setAssignments] = useState<number[]>([-1, -1, -1, -1, -1]); const [choice, setChoice] = useState<number | null>(null);
  const assign = (member: number, flagIndex = selected) => { if (flagIndex === null || flagIndex < 0) return; setAssignments((items) => items.map((value, index) => index === flagIndex ? member : value)); setSelected(null); };
  const complete = assignments.every((item) => item >= 0) && assignments.filter((item) => item === leader).length <= 1;
  return <div className="u03-console festival-role-console"><section className="vote-strip"><span>共享设备队长投票</span>{members.map((member, index) => <button className={leader === index ? "active" : ""} key={member} onClick={() => setLeader(index)}><Users />{member}<small>{leader === index ? "当前队长" : "投一票"}</small></button>)}</section><div className="flag-workspace"><p className="drag-instruction">拖动任务旗到成员席位完成授旗；点击旗帜后再点击成员也可操作。</p><div className="festival-flags">{festivalFlags.map((flag, index) => { const Icon = flag.Icon; return <button className={selected === index ? "selected" : assignments[index] >= 0 ? "assigned" : ""} draggable key={flag.name} onClick={() => setSelected(index)} onDragStart={(event) => { setSelected(index); event.dataTransfer.setData("text/plain", String(index)); }} style={{ "--flag": flag.color } as React.CSSProperties}><Icon aria-hidden="true" /><b>{flag.name}</b><small>{assignments[index] >= 0 ? `→ ${members[assignments[index]]}` : "拖动授旗"}</small></button>; })}</div><div className="festival-members">{members.map((member, index) => <button className={leader === index ? "leader" : ""} key={member} onClick={() => assign(index)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => assign(index, Number(event.dataTransfer.getData("text/plain")))}><UserRound aria-hidden="true" /><span>{member}</span><b>{assignments.filter((item) => item === index).length} 面旗</b></button>)}</div>{!complete && assignments.every((item) => item >= 0) && <p className="u03-warning">队长需要专注总协调：请把队长兼任的其他任务旗授予伙伴。</p>}</div>{complete && <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { rolesAllocated: true, leader: members[leader], allocation: assignments.join("|"), silentMemberApproach: ["independent", "invite", "ignore", "call-out"][choice], sharedDevice: true } })}>确认团队分工<Check /></button>}</>}</div>;
}

function FestivalDependencies({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-festival-02-dependencies"];
  const [stalled, setStalled] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  const base = stalled ? [60, 0, 0, 0] : [20, 0, 0, 0]; const resolved = choice === null ? base : choice === 2 ? [100, 78, 45, 10] : choice === 1 ? [82, 42, 0, 0] : choice === 3 ? [60, 25, 20, 0] : [65, 15, 0, 0];
  return <div className="u03-console dependency-console"><div className="dependency-board">{["活动策划", "宣传推广", "现场布置", "互动环节"].map((name, index) => <div className={index > 0 && resolved[index - 1] < 75 ? "locked" : ""} key={name}><span>{index + 1}</span><b>{name}</b><i><em style={{ width: `${resolved[index]}%` }} /></i><strong>{resolved[index]}%</strong>{index > 0 && resolved[index - 1] < 75 && <small><LockKeyhole />等待{name === "宣传推广" ? "策划定主题" : name === "现场布置" ? "宣传确认人数" : "布置完成"}</small>}</div>)}<svg aria-label="团队效率趋势" viewBox="0 0 320 70"><polyline points={resolved.map((value, index) => `${20 + index * 90},${62 - value * .5}`).join(" ")} /></svg></div>{!stalled ? <button className="primary-button" onClick={() => setStalled(true)}>推进到延迟事件<ArrowRight /></button> : <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { delayResolved: true, approach: ["wait", "deadline", "cross-help", "skip"][choice], crossTeamHelp: choice === 2 ? 3 : 0, efficiency: choice === 2 ? 88 : choice === 1 ? 76 : 52, progressChain: resolved.join("|") } })}>保存协作处置<Check /></button>}</>}</div>;
}

function FestivalConflict({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-festival-03-conflict"];
  const [heard, setHeard] = useState(0); const [choice, setChoice] = useState<number | null>(null);
  return <div className="u03-console conflict-console"><div className="conflict-alarm"><i /><b>紧急冲突</b><span>宣传组与现场布置组对活动场地产生严重分歧</span></div><div className="statement-stage"><article className={heard === 1 ? "speaking" : heard === 2 ? "muted" : ""}><div className="venue-image"><Image alt="稻田中央露天舞台方案" fill sizes="380px" src="/assets/unit-03/scenes/festival-outdoor-stage-v001.webp" /></div><span>宣传组 · 30 秒陈述</span><h3>稻田中央露天舞台</h3><p>视野开阔、展示效果好，但无顶棚，受天气影响。</p></article><article className={heard === 2 ? "speaking" : heard === 1 ? "muted" : ""}><div className="venue-image"><Image alt="室内仓库改造方案" fill sizes="380px" src="/assets/unit-03/scenes/festival-indoor-warehouse-v001.webp" /></div><span>布置组 · 30 秒陈述</span><h3>室内仓库改造</h3><p>有屋顶、不受天气影响，但立柱和纵深限制容纳空间。</p></article></div>{heard < 2 ? <button className="primary-button" onClick={() => setHeard((value) => value + 1)}><Volume2 />{heard === 0 ? "听宣传组完整陈述" : "听布置组完整陈述"}</button> : <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { conflictResolved: true, approach: ["vote", "backup", "leader", "integrate"][choice], bothSidesHeard: true, venueImagesViewed: 2, atmosphereDelta: choice === 3 ? 18 : choice === 1 ? 12 : choice === 0 ? 2 : -4 } })}>形成团队决议<Check /></button>}</>}</div>;
}

function FestivalShowcase({ onComplete }: Pick<Props, "onComplete">) {
  const items = ["策划方案 PPT", "宣传海报视频", "现场布置 3D 效果图", "互动环节 Demo"]; const [step, setStep] = useState(0);
  return <div className="u03-console showcase-console"><div className="festival-stage"><Image alt="丰收节农产品成果" height={220} src="/assets/global/props/tomato-display-v001.png" width={380} /><div className="stage-screen"><Sparkles /><b>{step < 4 ? items[step] : "团队协作评估报告"}</b><small>{step < 4 ? `${step + 1} / 4 正在展示` : "虚拟观众：鼓掌 · 拍照 · 互动"}</small></div>{step < 4 && <div className="audience-reactions"><span>👏</span><span>📷</span><span>🙋</span></div>}</div>{step < 4 ? <button className="primary-button" onClick={() => setStep((value) => value + 1)}>播放{step === 3 ? "最后一项" : "下一项"}<CirclePlay /></button> : <div className="showcase-report"><div className="u03-radar">{[88, 92, 82, 90, 86].map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}</div><div><b>沟通桥梁</b><b>创意引擎</b><b>执行担当</b><b>氛围调节器</b><b>全局视野者</b></div><button className="primary-button" onClick={() => onComplete({ summary: { showcaseCompleted: true, sectionsShown: 4, communication: 88, completion: 92, conflict: 82, participation: 90, innovation: 86, roleTag: "沟通桥梁" } })}>保存协作报告<Check /></button></div>}</div>;
}

const caseConfig: Record<string, { frames: readonly string[]; question: string; code: string; caseLabel: string; captions: readonly string[] }> = {
  "case-isolation": {
    frames: ["/assets/unit-03/storyboards/case-isolation-frame-01-v001.webp", "/assets/unit-03/storyboards/case-isolation-frame-02-v001.webp", "/assets/unit-03/storyboards/case-isolation-frame-03-v001.webp"], question: "u03-mediation-01-isolation", code: "isolation", caseLabel: "Case #001",
    captions: ["午休时，同事结伴离开，没有人邀请刚入职的小赵。", "工作讨论中，小赵举起建议，却始终没有得到回应。", "茶水间里，两位同事背后议论，小赵在一旁听见。"],
  },
  "case-temptation": {
    frames: ["/assets/unit-03/storyboards/case-temptation-frame-01-v001.webp", "/assets/unit-03/storyboards/case-temptation-frame-02-v001.webp", "/assets/unit-03/storyboards/case-temptation-frame-03-v001.webp"], question: "u03-mediation-02-temptation", code: "temptation", caseLabel: "Case #002",
    captions: ["供应商私下提出：虚报产品质量等级并分摊利润。", "眼前出现两条路：短期获利看似诱人，长期信誉更加扎实。", "运营人员拒绝邀约，并向负责人报告供应链风险。"],
  },
  "case-misunderstanding": {
    frames: ["/assets/unit-03/storyboards/case-misunderstanding-frame-01-v001.webp", "/assets/unit-03/storyboards/case-misunderstanding-frame-02-v001.webp", "/assets/unit-03/storyboards/case-misunderstanding-frame-03-v001.webp"], question: "u03-mediation-03-misunderstanding", code: "misunderstanding", caseLabel: "Case #003",
    captions: ["团队围绕账目质问小刘，聊天记录让误会不断加深。", "小刘独自坐在角落，解释没有得到相信。", "真正的操作失误被发现，团队开始澄清和修复。"],
  },
};

function MediationCase({ type, onComplete }: { type: string; onComplete: Props["onComplete"] }) {
  const config = caseConfig[type];
  const defaultData = UNIT_THREE_QUESTIONS[config.question];
  const [opened, setOpened] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [perspective, setPerspective] = useState("");
  const questionData = config.code === "isolation" && perspective ? UNIT_THREE_ISOLATION_PERSPECTIVES[perspective] : defaultData;
  const questionReady = config.code !== "isolation" || Boolean(perspective);

  return <div className="u03-console mediation-case">
    <button className={`case-folder ${opened ? "opened" : ""}`} onClick={() => setOpened(true)}><FileText /><b>{config.caseLabel}</b><span>{opened ? "案卷已打开" : "点击打开案卷"}</span></button>
    {opened && <>
      <div className={`storyboard-grid case-${config.code}`}>{config.captions.map((caption, index) => <figure key={caption}><div className="storyboard-frame"><Image alt={`镜头${index + 1}：${caption}`} fill sizes="260px" src={config.frames[index]} /></div><figcaption><b>镜头 {index + 1}</b><span>{caption}</span></figcaption></figure>)}</div>
      {config.code === "isolation" && <div className="role-perspectives"><span>角色视角</span>{["小赵", "同事", "调解人"].map((role) => <button className={perspective === role ? "active" : ""} key={role} onClick={() => { setPerspective(role); setChoice(null); }}>{role}</button>)}</div>}
      {config.code === "temptation" && <div className="future-fork"><span>短期获利</span><i /><span>长期信誉</span></div>}
      {config.code === "misunderstanding" && <div className="truth-scale"><span>误解</span><i style={{ transform: "rotate(12deg)" }} /><span>真相</span></div>}
      {questionReady ? <ChoicePanel data={questionData} managedKey={config.code === "isolation" && perspective && perspective !== "小赵" ? `perspective-${perspective}` : "primary"} onChange={setChoice} value={choice} /> : <p className="perspective-hint">先选择小赵、同事或调解人视角，再进入对应情境题。</p>}
      {choice !== null && questionReady && <button className="primary-button" onClick={() => onComplete({ summary: { caseResolved: true, caseType: config.code, perspective: perspective || "not-applicable", choice: String.fromCharCode(65 + choice), strategyMaturity: choice === questionData.best ? 100 : 65, storyboardFramesViewed: 3 } })}>提交调解判断<Check /></button>}
    </>}
  </div>;
}

const gratitudeObjects = ["家人", "老师/师傅", "同学/朋友", "同事/合作伙伴"];
const gratitudeWords = ["辛苦了", "谢谢你", "对不起", "我爱你", "我一直想说", "其实我很感激", "如果没有你……"];

function GratitudeWrite({ onComplete }: Pick<Props, "onComplete">) {
  const [target, setTarget] = useState(0); const [text, setText] = useState(""); const [uses, setUses] = useState(0);
  const insert = (word: string) => { setText((value) => `${value}${value ? "，" : ""}${word}`); setUses((value) => value + 1); };
  return <div className="u03-console gratitude-write"><div className={`glowing-slate target-${target}`}><header>{gratitudeObjects.map((item, index) => <button className={target === index ? "active" : ""} key={item} onClick={() => setTarget(index)}>{item}</button>)}</header><h2>请选择你要感谢的人，并写下你想对 TA 说的话。（至少 50 字）</h2><textarea maxLength={600} onChange={(event) => setText(event.target.value)} placeholder="这段话只对你自己可见……" value={text} /><b>{text.trim().length} / 50 字</b><div className="emotion-words">{gratitudeWords.map((word) => <button key={word} onClick={() => insert(word)}>{word}</button>)}</div></div><p className="privacy-note"><LockKeyhole />教师端仅汇总对象类型、字数和完成状态，不显示原文。</p><button className="primary-button" disabled={text.trim().length < 50} onClick={() => onComplete({ summary: { gratitudeWritten: true, target: ["family", "teacher", "friend", "colleague"][target], contentLength: text.length, wordBankUses: uses, contentRef: "attempt-private-content", mode: "text" }, privateContent: { gratitude: text, target: gratitudeObjects[target] } })}>写入发光石板<Send /></button></div>;
}

function GratitudeCard({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const previous = evidence.latestByInteraction?.["u03-gratitude-01-write"] ?? {}; const privatePrevious = evidence.privateByInteraction?.["u03-gratitude-01-write"] ?? {};
  const targetCode = typeof previous.target === "string" ? previous.target : "family"; const target = ["family", "teacher", "friend", "colleague"].indexOf(targetCode); const safeTarget = target < 0 ? 0 : target;
  const [generated, setGenerated] = useState(false); const [flipped, setFlipped] = useState(false); const [delivery, setDelivery] = useState<"wall" | "postcard" | "">("");
  const messages = ["你的感恩，是远方最好的家书。无论你走多远，家的方向永远是归途。", "师恩如山，不在于回报什么，而在于你是否成为了更好的自己。", "有人陪你走一段路，就是青春里最好的礼物。", "同行是最好的缘分，一起扛过的事，会成为最牢固的纽带。"]; const gratitude = typeof privatePrevious.gratitude === "string" ? privatePrevious.gratitude : "谢谢你一直以来的支持，这份温暖我会认真珍藏。";
  return <div className="u03-console gratitude-card-console">{!generated ? <button className="primary-button" onClick={() => setGenerated(true)}><Sparkles />生成感恩卡片</button> : <><button aria-label="翻转感恩卡" className={`gratitude-card target-${safeTarget} ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}><span className="card-front"><i /><b>{gratitudeObjects[safeTarget]}</b><p>{gratitude}</p></span><span className="card-back"><Image className="nxz-portrait" alt="农小智寄语" height={100} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={95} /><p>{messages[safeTarget]}</p></span></button><small>点击卡片查看正面 / 背面</small><div className="delivery-options"><button className={delivery === "wall" ? "active" : ""} onClick={() => setDelivery("wall")}><Heart />贴到感恩墙上</button><button className={delivery === "postcard" ? "active" : ""} onClick={() => setDelivery("postcard")}><FileText />保存为明信片</button></div><button className="primary-button" disabled={!delivery} onClick={() => onComplete({ summary: { cardGenerated: true, target: targetCode, delivery, publicWall: delivery === "wall", postcardSaved: delivery === "postcard", cardFlipped: flipped } })}>完成赠送<Send /></button></>}</div>;
}

function GratitudeResonate({ onComplete }: Pick<Props, "onComplete">) {
  const notes = ["谢谢家人一直相信我的选择，让我敢于尝试新的方向。", "感谢实训老师一次次陪我重新操作，让我知道失败也可以重来。", "谢谢小组伙伴在我紧张时先听我说完，再一起想办法。"];
  const [viewed, setViewed] = useState<number[]>([]); const [liked, setLiked] = useState<number[]>([]);
  return <div className="u03-console resonance-console"><div className="warmth-index"><b>{36 + liked.length}</b><span>条感恩</span><b>{82 + liked.length}</b><span>次共鸣</span></div><div className="public-slates">{notes.map((note, index) => <article className={`${viewed.includes(index) ? "open" : ""} ${liked.includes(index) ? "liked" : ""}`} key={note}><button onClick={() => setViewed((items) => items.includes(index) ? items : [...items, index])}>{viewed.includes(index) ? <p>{note}</p> : <><Sparkles /><b>匿名发光石板 {index + 1}</b></>}</button>{viewed.includes(index) && <button aria-label={`为第${index + 1}块石板共鸣`} onClick={() => setLiked((items) => items.includes(index) ? items : [...items, index])}><Heart />共鸣</button>}</article>)}</div><button className="primary-button" disabled={viewed.length < 1 || liked.length < 1} onClick={() => onComplete({ summary: { resonanceCompleted: true, viewedCount: viewed.length, resonanceCount: liked.length, warmthIndex: 36 + 82 + liked.length * 2 } })}>保存温暖记录<Check /></button></div>;
}

function HarmonyGate({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const completed = new Set(evidence.completedInteractionIds ?? []); const dimensions = [completed.has("u03-comm-03-customer"), completed.has("u03-festival-04-showcase"), completed.has("u03-gratitude-03-resonate"), completed.has("u03-mediation-03-misunderstanding")]; const total = dimensions.filter(Boolean).length; const [opened, setOpened] = useState(false);
  return <div className="u03-console gate-console"><div className={`harmony-gate growth-${total} ${opened ? "open" : ""}`}><div className="gate-frame" /><div className="gate-left" /><div className="gate-right" /><div className="gate-lintel" /><div className="gate-light" /><span>携手同行</span></div><div className="gate-evidence">{["沟通能力 · 门框", "协作能力 · 门扇", "感恩之心 · 门楣", "冲突处理 · 门槛"].map((item, index) => <b className={dimensions[index] ? "done" : ""} key={item}>{dimensions[index] ? <Check /> : <Sprout />}{item}</b>)}</div>{!opened ? <button className="primary-button" disabled={total < 4} onClick={() => setOpened(true)}><Sparkles />打开和谐之门</button> : <><div className="growth-trail">沟通大厅 <ArrowRight /> 丰收节 <ArrowRight /> 调解室 <ArrowRight /> 感恩墙</div><button className="primary-button" onClick={() => onComplete({ summary: { gateOpened: true, dimensionsComplete: total, badgeId: "u03-harmony-ambassador", badgeLevel: (evidence.completedInteractionIds?.length ?? 0) >= 18 ? "gold" : "silver" } })}>领取“和谐使者”徽章<Check /></button></>}</div>;
}

function RelationshipNetwork({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-relation-01-network"];
  const [type, setType] = useState("同事"); const [name, setName] = useState(""); const [stars, setStars] = useState(3); const [frequency, setFrequency] = useState("每周"); const [comfort, setComfort] = useState("一般"); const [planted, setPlanted] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  return <div className="u03-console relation-network"><div className="seed-garden"><svg viewBox="0 0 420 280" aria-label="关系植物生长图"><circle cx="210" cy="140" r="42" /><path className="stem" d="M210 140 Q210 90 210 52" />{Array.from({ length: stars * 3 }, (_, index) => { const angle = index / (stars * 3) * Math.PI * 2; return <circle className={planted ? "leaf grown" : "leaf"} cx={210 + Math.cos(angle) * (24 + stars * 9)} cy={100 + Math.sin(angle) * (18 + stars * 5)} key={index} r={6 + stars} style={{ "--i": index } as React.CSSProperties} />; })}<line className={`relation-line comfort-${comfort}`} x1="210" x2="350" y1="140" y2="210" /></svg><div className="seed-disc">{Array.from({ length: 8 }, (_, index) => <button aria-label={`关系种子${index + 1}`} key={index} style={{ "--i": index } as React.CSSProperties}><Sprout /></button>)}</div></div><section><div className="relation-form"><label>关系对象类型<select value={type} onChange={(event) => setType(event.target.value)}>{["上级", "同事", "下属", "客户", "导师", "朋友", "家人", "其他"].map((item) => <option key={item}>{item}</option>)}</select></label><label>关系对象姓名（可选）<input maxLength={20} value={name} onChange={(event) => setName(event.target.value)} /></label><label>亲密度<div className="star-input">{[1, 2, 3, 4, 5].map((item) => <button className={item <= stars ? "active" : ""} key={item} onClick={() => setStars(item)}>★</button>)}</div></label><label>沟通频率<select value={frequency} onChange={(event) => setFrequency(event.target.value)}>{["每天", "每周", "每月", "偶尔"].map((item) => <option key={item}>{item}</option>)}</select></label><label>沟通舒适度<select value={comfort} onChange={(event) => setComfort(event.target.value)}>{["很舒服", "一般", "有压力", "很紧张"].map((item) => <option key={item}>{item}</option>)}</select></label></div>{!planted ? <button className="primary-button" onClick={() => setPlanted(true)}><Sprout />种下这段关系</button> : <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { networkCreated: true, relationType: type, stars, frequency, comfort, improvement: choice, contentLength: name.length, contentRef: "attempt-private-content", mode: "relationship" }, privateContent: name ? { relationName: name } : undefined })}>保存关系花园<Check /></button>}</>}</section></div>;
}

function CommunicationStyle({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-relation-02-style"];
  const [started, setStarted] = useState(false); const [choice, setChoice] = useState<number | null>(null); const types = ["鹰型", "猫头鹰型", "孔雀型", "金毛型"];
  return <div className="u03-console style-analyzer"><div className={`analyzer-machine ${started ? "running" : ""}`}><Image alt="沟通风格分析仪" height={260} src="/assets/global/props/typewriter-v001.png" width={400} /><button aria-label="拉动沟通风格分析仪摇杆" onClick={() => setStarted(true)}><RotateCcw /></button><div className="gears"><i /><i /><i /></div>{choice !== null && <div className="printed-report"><b>{types[choice]}</b><span>{data.feedback[choice]}</span></div>}</div>{!started ? <button className="primary-button" onClick={() => setStarted(true)}>拉动分析仪摇杆<RotateCcw /></button> : <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { styleAnalyzed: true, communicationStyle: ["eagle", "owl", "peacock", "golden-retriever"][choice], questionsAnswered: 1, contentVersion: "unit3-requirement-explicit-q1" } })}>收下沟通风格报告<Check /></button>}</>}</div>;
}

function RelationshipPlan({ onComplete }: Pick<Props, "onComplete">) {
  const [relation, setRelation] = useState(""); const [aspect, setAspect] = useState(""); const [action, setAction] = useState(""); const [date, setDate] = useState(""); const [reminder, setReminder] = useState(false); const [watered, setWatered] = useState(false);
  const valid = relation.trim().length >= 2 && aspect.trim().length >= 2 && action.trim().length >= 4 && Boolean(date);
  return <div className="u03-console plan-console"><div className={`action-whiteboard ${watered ? "watered" : ""}`}><h2>关系改善计划</h2><label>第一段关系<input value={relation} onChange={(event) => setRelation(event.target.value)} /></label><label>我想改善的方面<input value={aspect} onChange={(event) => setAspect(event.target.value)} /></label><label>我的行动计划<textarea value={action} onChange={(event) => setAction(event.target.value)} /></label><label>预期时间<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="reminder"><input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} />设置虚拟行动提醒</label></div>{!watered ? <button className="primary-button" disabled={!valid} onClick={() => setWatered(true)}><Sprout />浇灌行动计划</button> : <button className="primary-button" onClick={() => onComplete({ summary: { planCreated: true, reminderSet: reminder, contentLength: relation.length + aspect.length + action.length, contentRef: "attempt-private-content", mode: "plan" }, privateContent: { relation, aspect, action, expectedDate: date } })}>保存改善计划<Check /></button>}</div>;
}

function EmpathyRole({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-empathy-01-role"];
  const [drawn, setDrawn] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  return <div className="u03-console empathy-role"><div className={`role-draw-machine ${drawn ? "drawn" : ""}`}><button aria-label="拉下角色卡抽取机摇杆" onClick={() => setDrawn(true)}><RotateCcw /></button>{drawn && <div className="empathy-cast"><Image alt="返乡创业青年、父亲和村干部" fill sizes="760px" src="/assets/unit-03/characters/empathy-cast-v001.png" /></div>}<div className="role-card-backs">{[0, 1, 2].map((item) => <i className={drawn ? "flipped" : ""} key={item} />)}</div></div>{!drawn ? <button className="primary-button" onClick={() => setDrawn(true)}>抽取三张角色卡<Sparkles /></button> : <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { roleSelected: true, role: ["young-entrepreneur", "father", "village-cadre"][choice], opposingRole: choice !== 0, cardsRevealed: 3 } })}>走进换装间<ArrowRight /></button>}</>}</div>;
}

function EmpathyDialogue({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-empathy-02-dialogue"];
  const [lit, setLit] = useState(false); const [choice, setChoice] = useState<number | null>(null); const understanding = choice === null ? 35 : [45, 78, 12, 20][choice]; const trust = choice === null ? 40 : [48, 82, 8, 22][choice];
  return <div className={`u03-console empathy-dialogue ${lit ? "lit" : ""}`}><div className="dialogue-stage"><Image alt="返乡创业青年、父亲和村干部" fill sizes="680px" src="/assets/unit-03/characters/empathy-cast-v001.png" /><div className="spotlight" /><blockquote>父亲：“你读了这么多年书，回来种地？我对你的期望就这样？”</blockquote><p>父亲内心独白：“其实我是怕他吃苦……”</p><div className="relationship-meters"><span>理解度 <i><b style={{ width: `${understanding}%` }} /></i>{understanding}</span><span>信任度 <i><b style={{ width: `${trust}%` }} /></i>{trust}</span></div></div>{!lit ? <button className="primary-button" onClick={() => setLit(true)}>点亮对话聚光灯<Sparkles /></button> : <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { dialogueCompleted: true, responseType: ["reason", "respect", "deny", "avoid"][choice], understanding, trust, roundsAuthored: 1, contentVersion: "unit3-role-a-round1" } })}>结束本轮演绎<Check /></button>}</>}</div>;
}

function EmpathyReview({ onComplete }: Pick<Props, "onComplete">) {
  const data = UNIT_THREE_QUESTIONS["u03-empathy-03-review"];
  const [replayed, setReplayed] = useState(false); const [parallel, setParallel] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  return <div className="u03-console empathy-review"><div className="director-replay"><button onClick={() => setReplayed(true)}><CirclePlay />回放关键节点</button>{replayed && <div className="replay-columns"><article><span>听到的话</span><p>“你读了这么多年书，回来种地？”</p></article><article><span>真正担心</span><p>“其实我是怕他吃苦……”</p></article><article className={parallel ? "active" : ""}><span>另一种说法</span><p>“我知道你担心我，愿意先听十分钟计划吗？”</p></article></div>}<button disabled={!replayed} onClick={() => setParallel(true)}><RotateCcw />播放平行宇宙</button></div>{replayed && parallel && <><ChoicePanel data={data} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { reviewCompleted: true, insight: ["different-view", "listen", "reasons", "difficult"][choice], replayViewed: replayed, parallelViewed: parallel, empathyIndex: 78 + (choice === 2 ? 12 : 5) } })}>保存同理心感悟<Check /></button>}</>}</div>;
}

export function UnitThreeOperation({ interaction, evidence, onComplete }: Props) {
  switch (interaction.type) {
    case "manager-briefing": return <ManagerBriefing onComplete={onComplete} />;
    case "team-coordination": return <TeamCoordination onComplete={onComplete} />;
    case "customer-complaint": return <CustomerComplaint onComplete={onComplete} />;
    case "festival-role-allocation": return <FestivalRoles onComplete={onComplete} />;
    case "festival-dependencies": return <FestivalDependencies onComplete={onComplete} />;
    case "festival-conflict": return <FestivalConflict onComplete={onComplete} />;
    case "festival-showcase": return <FestivalShowcase onComplete={onComplete} />;
    case "case-isolation": case "case-temptation": case "case-misunderstanding": return <MediationCase onComplete={onComplete} type={interaction.type} />;
    case "gratitude-write": return <GratitudeWrite onComplete={onComplete} />;
    case "gratitude-card": return <GratitudeCard evidence={evidence} onComplete={onComplete} />;
    case "gratitude-resonate": return <GratitudeResonate onComplete={onComplete} />;
    case "harmony-gate": return <HarmonyGate evidence={evidence} onComplete={onComplete} />;
    case "relationship-network": return <RelationshipNetwork onComplete={onComplete} />;
    case "communication-style": return <CommunicationStyle onComplete={onComplete} />;
    case "relationship-plan": return <RelationshipPlan onComplete={onComplete} />;
    case "empathy-role": return <EmpathyRole onComplete={onComplete} />;
    case "empathy-dialogue": return <EmpathyDialogue onComplete={onComplete} />;
    case "empathy-review": return <EmpathyReview onComplete={onComplete} />;
    default: return <div className="u03-console"><p>互动配置不可用。</p></div>;
  }
}
