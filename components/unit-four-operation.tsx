"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, BatteryCharging, BookOpen, Bot, Check, CirclePause, CirclePlay, Clock3, FileCheck2, Lightbulb, Mail, MessageSquareText, PenLine, RotateCcw, Search, Send, Sparkles, Star, TimerReset } from "lucide-react";
import type { UnitFourInteraction } from "@/lib/curriculum";
import { UNIT_FOUR_QUESTION_SETS, type UnitFourQuestion } from "@/lib/unit-four-content";
import type { UnitFourCompletion, UnitFourEvidence } from "@/components/unit-four-activity";
import { useManagedQuestion } from "@/components/managed-questions-provider";

type Props = { interaction: UnitFourInteraction; evidence: UnitFourEvidence; onComplete: (result: UnitFourCompletion) => void; pending: boolean };

function QuestionPanel({ item, value, onChange, managedIndex = 0, onValidated }: { item: UnitFourQuestion; value: number | null; onChange: (index: number) => void; managedIndex?: number; onValidated?: (correct: boolean, version?: number) => void }) {
  const { question, check } = useManagedQuestion(managedIndex);
  const [managedResult, setManagedResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const options = question?.options ?? item.options;
  const choose = async (index: number) => {
    setManagedResult(null);
    if (question && check) {
      const result = await check(question, String.fromCharCode(65 + index));
      setManagedResult(result);
      onValidated?.(result.correct, question.version);
    } else {
      onValidated?.(index === item.best);
    }
    onChange(index);
  };
  const correct = managedResult?.correct ?? value === item.best;
  return <div className="u04-question"><h2>{question?.prompt ?? item.question}</h2><div className="u04-options">{options.map((option, index) => <button className={value === index ? "active" : ""} key={`${index}-${option}`} onClick={() => void choose(index)}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></button>)}</div>{value !== null && <div className={correct ? "u04-feedback best" : "u04-feedback reflect"}><Lightbulb /><p>{managedResult?.feedback ?? item.feedback[value]}</p></div>}</div>;
}

function QuestionSequence({ interactionId, onComplete, children, summary = {} }: { interactionId: string; onComplete: Props["onComplete"]; children?: ReactNode; summary?: Record<string, boolean | number | string> }) {
  const questions = UNIT_FOUR_QUESTION_SETS[interactionId] ?? [];
  const [step, setStep] = useState(0); const [choice, setChoice] = useState<number | null>(null); const [answers, setAnswers] = useState<number[]>([]); const [validated, setValidated] = useState<Array<{ correct: boolean; version?: number }>>([]);
  const item = questions[step];
  if (!item) return <div className="u04-console"><p>该互动的原文题目尚未配置。</p></div>;
  const advance = () => {
    if (choice === null) return;
    const nextAnswers = [...answers, choice];
    if (step < questions.length - 1) { setAnswers(nextAnswers); setChoice(null); setStep((value) => value + 1); return; }
    const fallbackCorrect = nextAnswers.filter((answer, index) => answer === questions[index].best).length;
    onComplete({ summary: { unitFourCompleted: true, questionCount: questions.length, correctCount: validated.length === questions.length ? validated.filter((item) => item.correct).length : fallbackCorrect, answers: nextAnswers.map((answer) => String.fromCharCode(65 + answer)).join("|"), questionVersions: validated.map((item) => item.version ?? 1).join("|"), ...summary } });
  };
  const recordValidation = (correct: boolean, version?: number) => setValidated((items) => { const next = [...items]; next[step] = { correct, version }; return next; });
  return <div className="u04-console question-sequence">{children}<div className="u04-step-track"><span>{step + 1} / {questions.length}</span><i><b style={{ width: `${(step + 1) / questions.length * 100}%` }} /></i></div><QuestionPanel item={item} managedIndex={step} onChange={setChoice} onValidated={recordValidation} value={choice} />{choice !== null && <button className="primary-button" onClick={advance}>{step === questions.length - 1 ? "保存学习证据" : "进入下一题"}<Check /></button>}</div>;
}

function DroneMaterial({ onComplete }: Pick<Props, "onComplete">) {
  const modules = ["起飞按钮", "航线规划区", "实时监控画面"];
  const [started, setStarted] = useState(false); const [viewed, setViewed] = useState<number[]>([]); const [paused, setPaused] = useState(false); const [notes, setNotes] = useState("");
  const toggle = (index: number) => setViewed((items) => items.includes(index) ? items : [...items, index]);
  return <div className="u04-console drone-material"><div className={`learning-orb ${started ? "burst" : ""}`}><button aria-label="领取无人机学习材料" onClick={() => setStarted(true)}><Sparkles /><b>任务 A</b></button></div>{started && <div className="holo-learning-board"><section><Image alt="植保无人机教学模型" height={180} src="/assets/global/props/drone-v001.png" width={320} /><div className="module-map">{modules.map((module, index) => <button className={viewed.includes(index) ? "viewed" : ""} key={module} onClick={() => toggle(index)}><span>{index + 1}</span><b>{module}</b><small>{["控制起飞与降落", "设置飞行路线和巡查区域", "查看作物与飞行状态"][index]}</small></button>)}</div></section><aside><div className="teaching-timer"><Clock3 /><b>03:00</b><span>原学习时长</span></div><button className="secondary-button compact" onClick={() => setPaused(!paused)}>{paused ? <CirclePlay /> : <CirclePause />}{paused ? "继续学习" : "暂停计时"}</button><label>学习笔记<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="可选：记下三个模块的关系" /></label></aside></div>}{started && viewed.length === 3 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, materialViewed: true, browseOrder: viewed.join("|"), noteUsed: Boolean(notes.trim()), contentLength: notes.trim().length, contentRef: "attempt-private-content", paused: paused }, privateContent: notes.trim() ? { notes } : undefined })}>完成材料学习<Check /></button>}</div>;
}

const iconPool = ["一键起飞", "航线绘制", "实时画面", "天气查询", "电池商城", "用户头像", "音乐播放", "皮肤设置", "社区消息", "系统主题", "好友列表", "帮助中心"];
const targets = ["起飞控制", "航线规划", "实时监控"];
function DroneMatch({ onComplete }: Pick<Props, "onComplete">) {
  const [selected, setSelected] = useState<number | null>(null); const [matched, setMatched] = useState<number[]>([]); const [errors, setErrors] = useState(0); const [review, setReview] = useState(false);
  const place = (target: number) => { if (selected === null) return; if (selected === target) setMatched((items) => items.includes(selected) ? items : [...items, selected]); else setErrors((value) => value + 1); setSelected(null); };
  return <div className="u04-console drone-match"><div className="match-timer"><span>练习剩余</span><b>02:48</b><i /></div><div className="icon-pool">{iconPool.map((label, index) => <button className={matched.includes(index) ? "matched" : selected === index ? "selected" : index > 2 ? "distractor" : ""} disabled={matched.includes(index)} draggable key={label} onClick={() => setSelected(index)} onDragStart={() => setSelected(index)}><span>{index < 3 ? ["↑", "⌁", "◉"][index] : ["☁", "▣", "◎", "♪", "◫", "✉", "◈", "♙", "?"][index - 3]}</span><small>{label}</small></button>)}</div><div className="match-targets">{targets.map((label, index) => <button className={matched.includes(index) ? "complete" : ""} key={label} onClick={() => place(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => place(index)}><b>{label}</b><span>{matched.includes(index) ? "匹配正确 ✓" : "拖到这里"}</span></button>)}</div>{errors > 0 && <p className="u04-inline-note">图标已回弹。先看功能含义，而不是只看图形外观。错误尝试：{errors}</p>}<button className="secondary-button compact" onClick={() => setReview(!review)}><BookOpen />{review ? "收起材料" : "回看学习材料"}</button>{review && <div className="review-strip">起飞控制负责启动 · 航线规划负责路线 · 实时监控负责状态</div>}{matched.length === 3 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, matchedCount: 3, errors, reviewCount: review ? 1 : 0, accuracy: Math.round(300 / (3 + errors)) } })}>提交匹配结果<Check /></button>}</div>;
}

function DashboardExplore({ onComplete }: Pick<Props, "onComplete">) {
  const modules = ["销售趋势折线图", "热销产品排行榜", "客户地域分布图", "利润率分析表"]; const [viewed, setViewed] = useState<number[]>([]); const [toolbox, setToolbox] = useState(false);
  return <div className="u04-console dashboard-explore"><div className="green-orb"><Sparkles /></div><div className="sales-dashboard">{modules.map((module, index) => <button className={viewed.includes(index) ? "viewed" : ""} key={module} onClick={() => setViewed((items) => items.includes(index) ? items : [...items, index])}><b>{module}</b>{index === 0 ? <svg viewBox="0 0 160 60"><polyline points="5,48 35,38 65,44 95,15 125,22 155,8" /></svg> : index === 1 ? <div className="mini-bars"><i /><i /><i /></div> : index === 2 ? <div className="region-map"><i /><i /><i /></div> : <div className="profit-grid"><i /><i /><i /><i /></div>}<small>{viewed.includes(index) ? "已带着问题查看" : "点击浏览"}</small></button>)}</div><button className="secondary-button compact" onClick={() => setToolbox(!toolbox)}><Lightbulb />学习方法工具箱</button>{toolbox && <p className="u04-inline-note">先问“我想知道什么”，再寻找对应模块；先确认现象，再分析原因。</p>}{viewed.length === 4 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, modulesViewed: 4, browseOrder: viewed.join("|"), toolboxUsed: toolbox } })}>完成看板学习<Check /></button>}</div>;
}

function Reflection({ onComplete }: Pick<Props, "onComplete">) {
  const [evidence, setEvidence] = useState<number[]>([]); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-learn-06-reflect"][0];
  return <div className="u04-console reflection-book"><div className="behavior-evidence">{[["任务 A 学习", "3:00"], ["识别练习正确率", "75%"], ["任务 B 回看", "1 次"]].map(([label, value], index) => <button className={evidence.includes(index) ? "active" : ""} key={label} onClick={() => setEvidence((items) => items.includes(index) ? items : [...items, index])}><span>{label}</span><b>{value}</b><i style={{ width: `${[72, 75, 38][index]}%` }} /></button>)}</div><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && evidence.length >= 2 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, reflection: String.fromCharCode(65 + choice), evidenceViewed: evidence.length, metacognition: choice === 0 || choice === 2 ? 90 : 68 } })}>保存学习复盘<Check /></button>}{evidence.length < 2 && <p className="u04-inline-note">先查看至少两项自己的学习行为数据。</p>}</div>;
}

function LiveMaterial({ onComplete }: Pick<Props, "onComplete">) {
  const names = ["开场白", "产品介绍", "互动引导", "促单话术", "感谢收尾"]; const [viewed, setViewed] = useState<number[]>([]); const [active, setActive] = useState(0); const [noted, setNoted] = useState(false);
  const open = (index: number) => { setActive(index); setViewed((items) => items.includes(index) ? items : [...items, index]); };
  return <div className="u04-console live-material"><div className="live-learning-stage"><Image alt="直播话术训练农产品" height={210} src="/assets/global/props/tomato-display-v001.png" width={390} /><div className="focus-status"><span>模拟心率 76</span><span>专注度 {55 + viewed.length * 8}</span><span>学习效率 {50 + viewed.length * 9}</span></div></div><div className="speech-tabs">{names.map((name, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={name} onClick={() => open(index)}><b>{index + 1}</b>{name}</button>)}</div><div className="speech-template"><span>{names[active]}</span><h2>{["打招呼 + 亮点 + 关注", "产地 + 特点 + 真实证据", "提问 + 回应 + 参与", "价值 + 利益 + 行动", "感谢 + 承诺 + 再见"][active]}</h2><i>吸引注意 → 传递价值 → 引导行动</i></div><button className={`secondary-button compact ${noted ? "selected" : ""}`} onClick={() => setNoted(!noted)}><PenLine />{noted ? "已记下共同结构" : "记下共同结构"}</button>{viewed.length === 5 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, templatesViewed: 5, commonStructureFound: noted, browseOrder: viewed.join("|") } })}>进入直播实战<Check /></button>}</div>;
}

function LivePractice({ onComplete }: Pick<Props, "onComplete">) {
  const [live, setLive] = useState(false); const [round, setRound] = useState(0); const [choice, setChoice] = useState<number | null>(null); const [answers, setAnswers] = useState<number[]>([]); const item = UNIT_FOUR_QUESTION_SETS["u04-learn-08-live"][round];
  const submit = () => { if (choice === null) return; const next = [...answers, choice]; if (round === 0) { setAnswers(next); setRound(1); setChoice(null); } else onComplete({ summary: { unitFourCompleted: true, liveCompleted: true, answers: next.map((value) => String.fromCharCode(65 + value)).join("|"), positiveReactions: next.filter((value) => value === 0).length, liveCompletion: 100 } }); };
  return <div className="u04-console live-practice"><div className={`live-stage ${live ? "on-air" : ""}`}><Image alt="直播农产品展架" height={220} src="/assets/global/props/tomato-display-v001.png" width={410} /><div className="ring-light" /><b>{live ? "直播中" : "准备开播"}</b>{live && <div className="bullet-comments"><span>主播好！</span><span>今天有什么好东西？</span><span>{round ? "能不能便宜点？" : "草莓看起来很新鲜"}</span></div>}</div>{!live ? <button className="primary-button" onClick={() => setLive(true)}><CirclePlay />开始直播</button> : <><QuestionPanel item={item} managedIndex={round} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={submit}>{round ? "完成直播" : "回应下一条弹幕"}<Send /></button>}</>}</div>;
}

function LearningReport({ onComplete }: Pick<Props, "onComplete">) {
  const [opened, setOpened] = useState(false); const values = [78, 74, 82, 68, 80];
  if (!opened) return <div className="u04-console"><button className="report-envelope" onClick={() => setOpened(true)}><Mail /><b>我的学习能力报告</b><span>点击开启火漆封印</span></button></div>;
  return <QuestionSequence interactionId="u04-learn-09-report" onComplete={onComplete} summary={{ reportOpened: true, informationSpeed: 78, understanding: 74, flexibility: 82, pressure: 68, transfer: 80 }}><div className="learning-report"><div className="u04-radar">{values.map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}</div><div>{["信息获取速度", "知识理解深度", "方法运用灵活度", "压力下的表现", "学习迁移能力"].map((name, index) => <span key={name}>{name}<b>{values[index]}</b></span>)}</div></div></QuestionSequence>;
}

function AiExplore({ onComplete }: Pick<Props, "onComplete">) {
  const tools = ["AI 写作助手", "AI 数据分析", "AI 图像识别"]; const [done, setDone] = useState<number[]>([]); const [active, setActive] = useState(0);
  const run = (index: number) => { setActive(index); setDone((items) => items.includes(index) ? items : [...items, index]); };
  return <div className="u04-console ai-explore"><Image className="ai-helper" alt="农业 AI 机器人助手" height={320} src="/assets/unit-04/characters/ai-assistant-v001.png" width={256} /><div className="ai-terminals">{tools.map((name, index) => <button className={active === index ? "active" : done.includes(index) ? "done" : ""} key={name} onClick={() => run(index)}><Bot /><b>{name}</b><span>{index === 0 ? "输入：淮安草莓推广" : index === 1 ? "拖入：月度销量表" : "扫描：番茄早疫叶斑"}</span><small>{done.includes(index) ? "规则模拟已完成 ✓" : "点击体验"}</small>{index === 2 && <Image alt="番茄早疫叶斑样本" height={70} src="/assets/global/crops/disease-tomato-early-blight-v001.webp" width={70} />}</button>)}</div><p className="simulation-label"><Bot />确定性教学模拟，不调用自由对话 AI。</p>{done.length === 3 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, toolsExplored: 3, explorationOrder: done.join("|"), simulationMode: "deterministic" } })}>完成三终端体验<Check /></button>}</div>;
}

function AiCollaboration({ onComplete }: Pick<Props, "onComplete">) {
  const [aiRan, setAiRan] = useState(false); const [theme, setTheme] = useState(""); const [edited, setEdited] = useState(""); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-ai-02-collaborate"][0];
  return <div className="u04-console ai-collaboration"><div className="collab-zones"><section><span>AI 区域</span><h3>数据处理与信息检索</h3><button onClick={() => setAiRan(true)}><Bot />生成市场数据和初稿</button>{aiRan && <p>苹果供应增加 · 年轻家庭关注产地故事 · 初稿缺少果农真实感受</p>}</section><i>{aiRan && <Sparkles />}</i><section><span>人类区域</span><h3>创意判断与情感表达</h3><select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="">选择创意主题</option><option>一颗苹果的回家路</option><option>果农守候的四季</option><option>为家乡接一份订单</option></select><textarea disabled={!theme} value={edited} onChange={(event) => setEdited(event.target.value)} placeholder="补充至少 12 字有温度的表达" /></section></div>{aiRan && theme && edited.trim().length >= 12 && <><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, aiDraftGenerated: true, creativeTheme: theme, humanEditLength: edited.length, contentLength: edited.length, contentRef: "attempt-private-content", answer: String.fromCharCode(65 + choice), mode: "human-ai-collaboration" }, privateContent: { humanEdit: edited } })}>合成协作方案<Check /></button>}</>}</div>;
}

function AiDebate({ onComplete }: Pick<Props, "onComplete">) {
  const item = UNIT_FOUR_QUESTION_SETS["u04-ai-03-debate"][0]; const [choice, setChoice] = useState<number | null>(null); const [reason, setReason] = useState("");
  return <div className="u04-console ai-debate"><div className="floating-question"><b>?</b>{["岗位正在变化", "新工具持续出现", "人的判断仍然关键", "学习让能力更新"].map((text) => <span key={text}>{text}</span>)}</div><QuestionPanel item={item} onChange={setChoice} value={choice} /><label>选择后说明理由（至少 10 字，原文仅自己可见）<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label><div className="anonymous-vote"><span>匿名教学示例</span><i><b style={{ width: "62%" }} /></i><strong>62%</strong></div><button className="primary-button" disabled={choice === null || reason.trim().length < 10} onClick={() => onComplete({ summary: { unitFourCompleted: true, vote: String.fromCharCode(65 + (choice ?? 0)), contentLength: reason.length, contentRef: "attempt-private-content", mode: "ai-debate" }, privateContent: { debateReason: reason } })}>匿名提交观点<Send /></button></div>;
}

function ConfidenceCharger({ onComplete }: Pick<Props, "onComplete">) {
  const item = UNIT_FOUR_QUESTION_SETS["u04-ai-04-confidence"][0]; const [choice, setChoice] = useState<number | null>(null); const [charged, setCharged] = useState<number[]>([]); const statements = ["我今天完成了三个数字终端体验", "我能够检查 AI 输出而不是盲从", "我可以用练习逐步学会新工具"];
  return <div className="u04-console confidence-charger"><div className="battery"><BatteryCharging /><i><b style={{ width: `${28 + charged.length * 24}%` }} /></i><strong>{28 + charged.length * 24}</strong><span>数字化学习信心</span></div><QuestionPanel item={item} onChange={setChoice} value={choice} /><div className="affirmations">{statements.map((text, index) => <button className={charged.includes(index) ? "done" : ""} key={text} onClick={() => setCharged((items) => items.includes(index) ? items : [...items, index])}><Check />{text}</button>)}</div>{choice !== null && charged.length === 3 && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, confidenceSelfRating: String.fromCharCode(65 + choice), confidenceBaseline: 28, confidenceCurrent: 100, affirmations: 3 } })}>完成信心充电<Check /></button>}</div>;
}

const stories = [
  { id: "xiaozhao", name: "小赵——从打工仔到直播达人", image: "/assets/unit-04/storyboards/xiaozhao-v001.webp", captions: ["下班后从零学习直播", "第一次直播紧张但没有放弃", "持续练习后自信介绍家乡产品"] },
  { id: "ahuajie", name: "阿花姐——返乡大学生的智慧农场梦", image: "/assets/unit-04/storyboards/ahuajie-v001.webp", captions: ["回到传统温室发现问题", "查资料设计智慧改造", "把所学用于农场并和家人收获"] },
  { id: "laozhou", name: "老周——60 岁学电商的倔强爷爷", image: "/assets/unit-04/storyboards/laozhou-v001.webp", captions: ["戴上老花镜学习电脑", "首播后请家人帮助复盘", "持续改进后从容直播农产品"] },
];
function StoryPlayer({ onComplete }: Pick<Props, "onComplete">) {
  const [active, setActive] = useState(0); const [frame, setFrame] = useState(0); const [playing, setPlaying] = useState(false); const [viewed, setViewed] = useState<number[]>([]); const [notes, setNotes] = useState<Record<number, string>>({});
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setFrame((value) => { if (value >= 2) { setPlaying(false); setViewed((items) => items.includes(active) ? items : [...items, active]); return 2; } return value + 1; }), 1200); return () => window.clearInterval(timer); }, [playing, active]);
  const choose = (index: number) => { setActive(index); setFrame(0); setPlaying(false); };
  return <div className="u04-console story-player"><div className="story-tabs">{stories.map((story, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={story.id} onClick={() => choose(index)}><Star />{story.name}<small>{viewed.includes(index) ? "已看完" : "教学故事板"}</small></button>)}</div><div className="story-screen"><Image alt={`${stories[active].name}三镜头教学故事板`} fill sizes="900px" src={stories[active].image} /><div className={`story-mask focus-${frame}`} /><p>{stories[active].captions[frame]}</p><div><button aria-label={playing ? "暂停故事" : "播放故事"} onClick={() => setPlaying(!playing)}>{playing ? <CirclePause /> : <CirclePlay />}</button>{[0, 1, 2].map((item) => <button className={frame === item ? "active" : ""} key={item} onClick={() => { setFrame(item); setPlaying(false); if (item === 2) setViewed((items) => items.includes(active) ? items : [...items, active]); }}>{item + 1}</button>)}<button aria-label="重播故事" onClick={() => { setFrame(0); setPlaying(true); }}><RotateCcw /></button></div></div><label>学习笔记<textarea value={notes[active] ?? ""} onChange={(event) => setNotes((items) => ({ ...items, [active]: event.target.value }))} placeholder="记录困难和通过学习解决问题的方法" /></label><p className="simulation-label">正式授权视频待接入 · 当前为可操作教学故事板</p>{viewed.length === 3 && <button className="primary-button" onClick={() => { const allNotes = Object.values(notes).join("\n"); onComplete({ summary: { unitFourCompleted: true, storiesCompleted: 3, mediaProgress: 100, mediaId: "u04-storyboards-v001", replayCount: 0, contentLength: allNotes.length, contentRef: "attempt-private-content", mode: "story-notes" }, privateContent: allNotes ? { storyNotes: allNotes } : undefined }); }}>完成三段故事<Check /></button>}</div>;
}

function InsightStar({ onComplete }: Pick<Props, "onComplete">) {
  const item = UNIT_FOUR_QUESTION_SETS["u04-story-03-insight"][0]; const [landed, setLanded] = useState(false); const [choice, setChoice] = useState<number | null>(null); const [text, setText] = useState("");
  return <div className="u04-console insight-star"><button className={landed ? "landed" : ""} onClick={() => setLanded(true)}><Star /><span>{landed ? "感悟之星已展开" : "点击接住感悟之星"}</span></button>{landed && <><div className="insight-regions"><b>我被打动的瞬间</b><b>我想学到的方法</b><b>我决定做出的改变</b></div><QuestionPanel item={item} onChange={setChoice} value={choice} /><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="可选：写下只属于你的补充感悟" />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, insight: String.fromCharCode(65 + choice), actionable: choice !== 3, contentLength: text.length, contentRef: "attempt-private-content", mode: "insight" }, privateContent: text ? { insight: text } : undefined })}>保存感悟之星<Check /></button>}</>}</div>;
}

function EvidenceReview({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const completed = evidence.completedInteractionIds?.length ?? 0; const [viewed, setViewed] = useState<number[]>([]); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-plan-01-review"][0]; const nodes = [["已完成互动", completed], ["学习方法使用", Math.min(6, completed)], ["数字工具体验", Math.min(3, completed)], ["故事学习", completed > 13 ? 3 : 0]] as const;
  return <div className="u04-console evidence-review"><div className="season-window"><i /><i /><i /><i /><span>春 · 夏 · 秋 · 冬</span></div><div className="evidence-timeline">{nodes.map(([label, value], index) => <button className={viewed.includes(index) ? "active" : ""} key={label} onClick={() => setViewed((items) => items.includes(index) ? items : [...items, index])}><span>{label}</span><b>{value}</b><i style={{ width: `${Math.min(100, Number(value) * 12 + 18)}%` }} /></button>)}</div>{viewed.length >= 3 && <><div className="portrait-tags"><span>愿意尝试</span><span>能看证据</span><span>重视方法</span><span>持续更新</span></div><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, evidenceNodesViewed: viewed.length, advantage: ["speed", "method", "pressure", "curiosity"][choice], evidenceCompletion: completed } })}>确认学习画像<Check /></button>}</>}</div>;
}

function LearningMap({ onComplete }: Pick<Props, "onComplete">) {
  const periods = ["短期目标（本学期）", "中期目标（在校期间）", "长期目标（毕业后 3 年）"]; const fields = ["目标描述", "行动计划", "预期困难", "应对策略"]; const [values, setValues] = useState<Record<string, string>>({}); const [advice, setAdvice] = useState(false); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-plan-02-create"][0];
  const filled = periods.flatMap((_, pi) => fields.map((__, fi) => `${pi}-${fi}`)).filter((key) => (values[key] ?? "").trim().length >= 2).length;
  return <div className="u04-console learning-map"><div className="map-grid"><span />{fields.map((field) => <b key={field}>{field}</b>)}{periods.map((period, pi) => <div className="map-row" key={period}><strong>{period}</strong>{fields.map((field, fi) => <textarea aria-label={`${period}${field}`} className={(values[`${pi}-${fi}`] ?? "").trim().length >= 2 ? "filled" : ""} key={field} value={values[`${pi}-${fi}`] ?? ""} onChange={(event) => setValues((items) => ({ ...items, [`${pi}-${fi}`]: event.target.value }))} />)}</div>)}</div><button className="secondary-button compact" onClick={() => setAdvice(!advice)}><Lightbulb />农小智建议</button>{advice && <p className="u04-inline-note">目标要具体可衡量；行动要有频率；困难和应对要成对出现。</p>}<QuestionPanel item={item} onChange={setChoice} value={choice} /><p className="map-completion">学习地图完成 {filled} / 12 格</p><button className="primary-button" disabled={filled < 12 || choice === null} onClick={() => { const privateContent = Object.fromEntries(Object.entries(values).map(([key, value]) => [`plan-${key}`, value])); onComplete({ summary: { unitFourCompleted: true, cellsCompleted: filled, shortTermChoice: String.fromCharCode(65 + (choice ?? 0)), adviceUsed: advice, contentLength: Object.values(values).join("").length, contentRef: "attempt-private-content", mode: "learning-plan" }, privateContent }); }}>保存三阶段学习地图<Check /></button></div>;
}

function PlanSeal({ onComplete }: Pick<Props, "onComplete">) {
  const [stamp, setStamp] = useState(""); const [sealed, setSealed] = useState(false); const [choice, setChoice] = useState<number | null>(null); const [share, setShare] = useState(false); const item = UNIT_FOUR_QUESTION_SETS["u04-plan-03-seal"][0];
  return <div className="u04-console plan-seal"><div className={`sealed-letter ${sealed ? "fly" : ""}`}><Mail /><b>我的学习计划</b><span>{sealed ? "打开日期：本学期最后一天" : "等待火漆封存"}</span>{stamp && <i className={`stamp ${stamp}`}>智</i>}</div><div className="stamp-picker">{[["red", "红"], ["blue", "蓝"], ["gold", "金"]].map(([code, label]) => <button className={stamp === code ? "active" : ""} key={code} onClick={() => setStamp(code)}><i className={code} />{label}色火漆</button>)}</div><button className="primary-button" disabled={!stamp} onClick={() => setSealed(true)}><FileCheck2 />封存计划</button>{sealed && <><QuestionPanel item={item} onChange={setChoice} value={choice} /><label className="share-toggle"><input checked={share} type="checkbox" onChange={(event) => setShare(event.target.checked)} />公开分享计划摘要（默认关闭）</label>{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, planSealed: true, stampColor: stamp, confidence: String.fromCharCode(65 + choice), shared: share } })}>送入时光信箱<Send /></button>}</>}</div>;
}

function CompletionCrystal({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const required = [9, 4, 3, 3]; const counts = ["u04-learn", "u04-ai", "u04-story", "u04-plan"].map((prefix) => evidence.completedInteractionIds?.filter((id) => id.startsWith(prefix)).length ?? 0); const ready = counts.every((count, index) => count >= required[index]); const [started, setStarted] = useState(false);
  return <div className="u04-console completion-crystal"><div className={`crystal-ball ${started ? "active" : ""}`}><Sparkles /><div>{counts.map((count, index) => <i key={index} style={{ "--i": index, opacity: count >= required[index] ? 1 : .18 } as React.CSSProperties} />)}</div><b>{started ? "终身学习者" : "结业水晶球"}</b></div><div className="crystal-evidence">{["限时技能学习", "AI 技能大比拼", "行业故事", "学习计划"].map((name, index) => <span className={counts[index] >= required[index] ? "done" : ""} key={name}><Check />{name} {counts[index]}/{required[index]}</span>)}</div>{!started ? <button className="primary-button" disabled={!ready} onClick={() => setStarted(true)}><Sparkles />启动结业仪式</button> : <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, crystalCompleted: true, badge: "u04-lifelong-learner", title: "终身学习者", satisfaction: 5 } })}>领取智创未来徽章<Star /></button>}</div>;
}

function Pomodoro({ onComplete }: Pick<Props, "onComplete">) {
  const [running, setRunning] = useState(false); const [seconds, setSeconds] = useState(25); const [interruptions, setInterruptions] = useState(0); const [read, setRead] = useState(false); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-method-01-pomodoro"][0];
  useEffect(() => { if (!running || seconds <= 0) return; const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [running, seconds]);
  return <div className="u04-console pomodoro"><div className={`tomato-clock ${running ? "running" : ""}`}><TimerReset /><b>{String(seconds).padStart(2, "0")}:00</b><span>教学加速：1 秒映射 1 分钟 · 原法 25+5</span><i style={{ "--value": `${(25 - seconds) / 25 * 360}deg` } as React.CSSProperties} /></div><article><h3>农业政策学习材料</h3><p>发展智慧农业要让数字技术服务真实生产需求，兼顾生产效率、资源节约、农民技能提升和数据安全。选择工具前，应先明确问题，再核对数据来源和适用条件。</p><button onClick={() => setRead(true)}><BookOpen />读完材料</button></article><div><button className="secondary-button compact" onClick={() => setRunning(!running)}>{running ? <CirclePause /> : <CirclePlay />}{running ? "暂停" : "开始专注"}</button><button className="secondary-button compact" onClick={() => { setInterruptions((value) => value + 1); setRunning(false); }}>记录一次分心</button></div>{seconds === 0 && read && <><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, pomodoroCompleted: true, standardMinutes: 25, interruptions, focusRating: String.fromCharCode(65 + choice) } })}>收藏番茄工作法<Check /></button>}</>}</div>;
}

function MindMap({ onComplete }: Pick<Props, "onComplete">) {
  const branches = ["时间管理", "记忆方法", "理解方法", "实践方法"]; const [values, setValues] = useState<Record<string, string>>({}); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-method-02-mindmap"][0]; const count = Object.values(values).filter((value) => value.trim()).length;
  return <div className="u04-console mindmap"><div className="mindmap-canvas"><b>高效学习</b>{branches.map((branch, bi) => <section className={`branch branch-${bi}`} key={branch}><strong>{branch}</strong>{[0, 1].map((ni) => <input aria-label={`${branch}子节点${ni + 1}`} className={(values[`${bi}-${ni}`] ?? "").trim() ? "grown" : ""} key={ni} value={values[`${bi}-${ni}`] ?? ""} onChange={(event) => setValues((items) => ({ ...items, [`${bi}-${ni}`]: event.target.value }))} placeholder="补充方法" />)}</section>)}</div>{count >= 8 && <><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, mindmapCompleted: true, branchCount: 4, nodeCount: count, contentLength: Object.values(values).join("").length, contentRef: "attempt-private-content", clarity: String.fromCharCode(65 + choice), mode: "mindmap" }, privateContent: { mindmapNodes: Object.values(values) } })}>收藏思维导图<Check /></button>}</>}</div>;
}

function Feynman({ onComplete }: Pick<Props, "onComplete">) {
  const [choice, setChoice] = useState<number | null>(null); const [reviewed, setReviewed] = useState(false); const item = UNIT_FOUR_QUESTION_SETS["u04-method-03-feynman"][0]; const understanding = choice === null ? [0, 0, 0] : choice === 0 ? [3, 3, 3] : choice === 3 ? [1, 1, 1] : [2, 1, 2];
  return <div className="u04-console feynman-class"><div className="mini-class"><div className="blackboard"><b>时间管理四象限</b><div><span>重要·紧急</span><span>重要·不紧急</span><span>不重要·紧急</span><span>不重要·不紧急</span></div></div><div className="nxz-students">{understanding.map((level, index) => <div key={index}><Image className="nxz-portrait" alt="农小智课堂分身" height={82} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={78} /><span>{["等待解释", "😵 没懂", "😐 半懂", "😊 懂了"][level]}</span></div>)}</div></div><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice === 3 && <button className="secondary-button compact" onClick={() => setReviewed(true)}><BookOpen />重新查看四象限材料</button>}{choice !== null && (choice !== 3 || reviewed) && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, feynmanCompleted: true, explanation: String.fromCharCode(65 + choice), understandingScore: understanding.reduce((a, b) => a + b, 0), reviewed } })}>完成费曼课堂<Check /></button>}</div>;
}

function SourceSearch({ onComplete }: Pick<Props, "onComplete">) {
  const [tool, setTool] = useState(""); const [searched, setSearched] = useState(false); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-digital-01-search"][0];
  return <div className="u04-console source-search"><div className="arena-door green"><Search /><b>信息检索·初级</b></div><h2>请找出适合淮安地区种植的 3 种特色农产品及其生长条件</h2><div className="search-tools">{["关键词搜索", "图片搜索", "AI 问答"].map((name) => <button className={tool === name ? "active" : ""} key={name} onClick={() => setTool(name)}>{name}</button>)}</div><button className="primary-button" disabled={!tool} onClick={() => setSearched(true)}><Search />开始检索</button>{searched && <><div className="source-results"><span>农业科研机构资料 <b>来源可核验</b></span><span>地方农技推广资料 <b>来源可核验</b></span><span>社交平台转发内容 <b>需要交叉验证</b></span></div><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, searchCompleted: true, searchTool: tool, sourceAnswer: String.fromCharCode(65 + choice), verifiedSources: 2 } })}>通过绿色门<Check /></button>}</>}</div>;
}

function ChartLab({ onComplete }: Pick<Props, "onComplete">) {
  const [chart, setChart] = useState(0); const [choice, setChoice] = useState<number | null>(null); const item = UNIT_FOUR_QUESTION_SETS["u04-digital-02-data"][0]; const values = [32, 38, 35, 48, 56, 62, 68, 65, 74, 82, 79, 91];
  return <div className="u04-console chart-lab"><div className="arena-door blue"><BarChart3 /><b>数据分析·中级</b></div><div className="chart-picker">{["折线图", "柱状图", "饼图", "散点图"].map((name, index) => <button className={chart === index ? "active" : ""} key={name} onClick={() => setChart(index)}>{name}</button>)}</div><div className={`dynamic-chart chart-${chart}`}>{values.map((value, index) => <i key={index} style={{ "--v": value, height: `${value}%`, left: `${index * 8 + 2}%` } as React.CSSProperties}><b /></i>)}</div><QuestionPanel item={item} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, chartRendered: ["line", "bar", "pie", "scatter"][chart], chartAnswer: String.fromCharCode(65 + choice), dataPoints: 12 } })}>通过蓝色门<Check /></button>}</div>;
}

function AiAudit({ onComplete }: Pick<Props, "onComplete">) {
  const [marked, setMarked] = useState(false); const [choice, setChoice] = useState<number | null>(null); const [revised, setRevised] = useState(false); const item = UNIT_FOUR_QUESTION_SETS["u04-digital-03-ai"][0];
  return <div className="u04-console ai-audit"><div className="arena-door gold"><Bot /><b>AI 协作·高级</b></div><div className="audit-copy"><span>AI 预设初稿</span><p>“淮安苹果全年自然成熟，所有产区都完全不使用任何植保措施，营养价值是普通苹果的十倍。”</p><button className={marked ? "marked" : ""} onClick={() => setMarked(true)}>标记无法核验的事实表述</button></div>{marked && <QuestionPanel item={item} onChange={setChoice} value={choice} />}{choice !== null && <button className="secondary-button compact" onClick={() => setRevised(true)}><MessageSquareText />根据错误重新提问并核验</button>}{revised && <div className="revised-copy"><Check />已移除绝对化表述，并要求补充农业部门可核验来源。</div>}{revised && <button className="primary-button" onClick={() => onComplete({ summary: { unitFourCompleted: true, aiAudited: true, errorMarked: true, strategy: String.fromCharCode(65 + (choice ?? 0)), reprompted: true, finalQuality: 90 } })}>通过金色门<Check /></button>}</div>;
}

export function UnitFourOperation({ interaction, evidence, onComplete }: Props) {
  switch (interaction.type) {
    case "drone-material": return <DroneMaterial onComplete={onComplete} />;
    case "icon-drag-match": return <DroneMatch onComplete={onComplete} />;
    case "timed-quiz": return <QuestionSequence interactionId={interaction.id} onComplete={onComplete}><div className="star-collection"><Star /><Star /><Star /><span>学习力检测 · 任务 A</span></div></QuestionSequence>;
    case "dashboard-explore": return <DashboardExplore onComplete={onComplete} />;
    case "data-card-apply": return <QuestionSequence interactionId={interaction.id} onComplete={onComplete}><div className="data-task-cards"><FileCheck2 /><FileCheck2 /><span>原文提供 2 张业务任务卡</span></div></QuestionSequence>;
    case "method-reflection": return <Reflection onComplete={onComplete} />;
    case "live-material": return <LiveMaterial onComplete={onComplete} />;
    case "live-practice": return <LivePractice onComplete={onComplete} />;
    case "learning-report": return <LearningReport onComplete={onComplete} />;
    case "ai-terminal-explore": return <AiExplore onComplete={onComplete} />;
    case "human-ai-collaboration": return <AiCollaboration onComplete={onComplete} />;
    case "ai-debate": return <AiDebate onComplete={onComplete} />;
    case "confidence-charger": return <ConfidenceCharger onComplete={onComplete} />;
    case "story-player": return <StoryPlayer onComplete={onComplete} />;
    case "story-quiz": return <QuestionSequence interactionId={interaction.id} onComplete={onComplete}><div className="star-collection"><Star /><span>学习密码检测</span></div></QuestionSequence>;
    case "insight-star": return <InsightStar onComplete={onComplete} />;
    case "evidence-review": return <EvidenceReview evidence={evidence} onComplete={onComplete} />;
    case "learning-map": return <LearningMap onComplete={onComplete} />;
    case "plan-seal": return <PlanSeal onComplete={onComplete} />;
    case "learning-crystal": return <CompletionCrystal evidence={evidence} onComplete={onComplete} />;
    case "pomodoro": return <Pomodoro onComplete={onComplete} />;
    case "mindmap": return <MindMap onComplete={onComplete} />;
    case "feynman-class": return <Feynman onComplete={onComplete} />;
    case "source-search": return <SourceSearch onComplete={onComplete} />;
    case "chart-lab": return <ChartLab onComplete={onComplete} />;
    case "ai-audit": return <AiAudit onComplete={onComplete} />;
    default: return <QuestionSequence interactionId={interaction.id} onComplete={onComplete} />;
  }
}
