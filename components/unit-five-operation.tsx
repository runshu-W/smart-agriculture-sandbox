"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, BarChart3, BookOpen, Check, CirclePause, CirclePlay, Compass, FileCheck2, Heart, Lightbulb, Mail, MessageCircle, RotateCcw, ShieldCheck, Sparkles, Target, ThumbsUp, UserRoundSearch } from "lucide-react";
import type { UnitFiveInteraction } from "@/lib/curriculum";
import { UNIT_FIVE_QUESTION_SETS, type UnitFiveQuestion } from "@/lib/unit-five-content";
import type { UnitFiveCompletion, UnitFiveEvidence } from "@/components/unit-five-activity";
import { useManagedQuestion } from "@/components/managed-questions-provider";

type Props = { interaction: UnitFiveInteraction; evidence: UnitFiveEvidence; onComplete: (result: UnitFiveCompletion) => void; pending: boolean };
type Finish = Props["onComplete"];

function QuestionPanel({ item, value, onChange, onValidated }: { item: UnitFiveQuestion; value: number | null; onChange: (value: number) => void; onValidated: (correct: boolean, version?: number) => void }) {
  const { question, check } = useManagedQuestion();
  const [managedResult, setManagedResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const options = question?.options ?? item.options;
  const choose = async (index: number) => {
    setManagedResult(null);
    if (question && check) {
      const result = await check(question, String.fromCharCode(65 + index));
      setManagedResult(result);
      onValidated(result.correct, question.version);
    } else {
      onValidated(index === item.best);
    }
    onChange(index);
  };
  return <div className="u05-question"><h2>{question?.prompt ?? item.question}</h2><div>{options.map((option, index) => <button className={value === index ? "active" : ""} key={`${index}-${option}`} onClick={() => void choose(index)}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></button>)}</div>{value !== null && <p className={(managedResult?.correct ?? value === item.best) ? "best" : "reflect"}><Lightbulb />{managedResult?.feedback ?? item.feedback[value]}</p>}</div>;
}

function QuestionFinish({ id, onComplete, ready = true, summary = {}, privateContent, children, label = "保存学习证据" }: { id: string; onComplete: Finish; ready?: boolean; summary?: Record<string, boolean | number | string>; privateContent?: Record<string, string | string[]>; children?: ReactNode; label?: string }) {
  const item = UNIT_FIVE_QUESTION_SETS[id]?.[0]; const [value, setValue] = useState<number | null>(null); const [validated, setValidated] = useState<{ correct: boolean; version?: number } | null>(null);
  if (!item) return <div className="u05-console">{children}<p className="u05-source-gap">该互动没有原文题目。</p></div>;
  return <div className="u05-console">{children}{ready ? <><QuestionPanel item={item} value={value} onChange={setValue} onValidated={(correct, version) => setValidated({ correct, version })} /><button className="primary-button" disabled={value === null} onClick={() => onComplete({ summary: { unitFiveCompleted: true, answer: String.fromCharCode(65 + (value ?? 0)), bestAnswer: validated?.correct ?? value === item.best, questionVersion: validated?.version ?? 1, ...summary }, privateContent })}>{label}<Check /></button></> : <p className="u05-hint">完成上方操作后解锁原文提问。</p>}</div>;
}

const jobs = [
  { name: "助农电商主播", image: "/assets/global/roles/anchor-f-v001.png", color: "#e8b83f" },
  { name: "智慧农场运营师", image: "/assets/global/roles/farm-m-v001.png", color: "#1d9b69" },
  { name: "农产品品牌策划师", image: "/assets/global/roles/brand-f-v001.png", color: "#d86f56" },
  { name: "乡村电商运营官", image: "/assets/global/roles/ops-m-v001.png", color: "#2789a6" },
  { name: "新农人创业家", image: "/assets/global/roles/founder-f-v001.png", color: "#8e74b4" },
];

function CareerStaircase({ onComplete }: { onComplete: Finish }) {
  const [active, setActive] = useState(0); const [viewed, setViewed] = useState<number[]>([]); const stages = ["实习期", "初级岗位", "业务骨干", "团队负责人", "行业引领者"];
  const choose = (index: number) => { setActive(index); setViewed((items) => items.includes(index) ? items : [...items, index]); };
  return <QuestionFinish id="u05-path-01-role" onComplete={onComplete} ready={viewed.length >= 3} summary={{ rolesViewed: viewed.length, roleOrder: viewed.join("|") }}><div className="u05-career-stage"><div className="u05-job-holograms">{jobs.map((job, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={job.name} onClick={() => choose(index)} style={{ "--job": job.color } as React.CSSProperties}><Image alt={job.name} height={190} src={job.image} width={100} /><span>{job.name}</span></button>)}</div><div className="u05-staircase" aria-label={`${jobs[active].name}发展阶梯`}>{stages.map((stage, index) => <button key={stage} style={{ "--step": index } as React.CSSProperties}><b>{index + 1}</b><span>{stage}</span><small>{["熟悉流程", "独立执行", "解决复杂问题", "协调资源", "持续创新"][index]}</small></button>)}</div></div></QuestionFinish>;
}

function StageExplorer({ onComplete }: { onComplete: Finish }) {
  const stages = ["实习期", "初级阶段", "中级阶段", "高级阶段", "领军阶段"]; const [active, setActive] = useState(0); const [viewed, setViewed] = useState<number[]>([]); const [simulated, setSimulated] = useState(false);
  const open = (index: number) => { setActive(index); setViewed((items) => items.includes(index) ? items : [...items, index]); };
  return <QuestionFinish id="u05-path-02-stage" onComplete={onComplete} ready={viewed.length >= 3 && simulated} summary={{ stagesViewed: viewed.length, simulated }}><div className="u05-stage-explorer"><nav>{stages.map((stage, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={stage} onClick={() => open(index)}>{stage}</button>)}</nav><section><div><span>技能清单</span><i><b style={{ width: `${40 + active * 12}%` }} /></i><strong>{["岗位基础", "快速学习", "独立判断", "团队带领", "行业创新"][active]}</strong></div><div><span>心理画像</span><p>{["适应真实工作节奏", "从学生到职场人的角色转换", "技术或管理方向选择", "带领团队与压力管理", "责任、传承与持续更新"][active]}</p></div><div><span>典型案例</span><p>一位从业者在真实农业项目中持续记录、复盘并解决阶段性挑战。</p></div><div><span>关键跃迁</span><p>积累可验证成果，主动寻求反馈，并在实践中补齐下一阶段能力。</p></div><button className={simulated ? "done" : ""} onClick={() => setSimulated(true)}><CirclePlay />{simulated ? "模拟体验已完成" : "启动本阶段模拟体验"}</button></section></div></QuestionFinish>;
}

const forks = {
  "u05-path-03-tech-manage": { roads: ["深耕技术路线", "转向管理路线"], notes: ["专注钻研 · 解决难题", "带领团队 · 协调资源"] },
  "u05-path-04-startup": { roads: ["稳定就业", "自主创业"], notes: ["稳步晋升 · 风险较低", "自主决策 · 风险与机会并存"] },
  "u05-path-05-change": { roads: ["转型", "坚守", "升级"], notes: ["学习新技能转向新领域", "在当前领域深耕", "叠加农业+AI新能力"] },
} as const;
function ForkRoad({ id, onComplete }: { id: keyof typeof forks; onComplete: Finish }) {
  const config = forks[id]; const [viewed, setViewed] = useState<number[]>([]); const [selected, setSelected] = useState<number | null>(null); const [reviewed, setReviewed] = useState(false);
  return <QuestionFinish id={id} onComplete={onComplete} ready={viewed.length === config.roads.length} summary={{ roadsViewed: viewed.length, routePreference: selected === null ? "unselected" : config.roads[selected], selfDataReviewed: reviewed }}><div className={`u05-fork-road ${id.endsWith("change") ? "collapse" : ""}`}><button className={reviewed ? "reviewed" : ""} onClick={() => setReviewed(true)}><UserRoundSearch />{reviewed ? "已回看本人数据" : "回看前序自我认知"}</button><div>{config.roads.map((road, index) => <button className={selected === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={road} onClick={() => { setSelected(index); setViewed((items) => items.includes(index) ? items : [...items, index]); }}><Compass /><b>{road}</b><span>{config.notes[index]}</span><i /></button>)}</div></div></QuestionFinish>;
}

function GrowthRadar({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const [layers, setLayers] = useState<string[]>([]); const [axes, setAxes] = useState<number[]>([]); const current = evidence.abilities?.current ?? [68, 66, 70, 67]; const base = evidence.abilities?.baseline ?? [50, 50, 50, 50]; const mid = current.map((value, index) => Math.round((value + base[index]) / 2)); const values = layers.includes("current") ? current : layers.includes("mid") ? mid : base;
  const points = values.map((value, index) => { const angle = -Math.PI / 2 + index * Math.PI / 2; const r = value * .72; return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`; }).join(" ");
  return <QuestionFinish id="u05-memory-01-radar" onComplete={onComplete} ready={layers.length === 3} summary={{ radarLayersViewed: layers.length, dimensionsViewed: axes.length, growthDelta: Math.round(current.reduce((sum, value, index) => sum + value - base[index], 0) / 4) }}><div className="u05-growth-radar"><div className="u05-tree"><Sparkles /><span /><span /><span /></div><svg viewBox="0 0 200 200" aria-label="四维成长雷达"><polygon className="grid" points="100,25 175,100 100,175 25,100" /><polygon className="data" points={points} /><circle cx="100" cy="100" r="4" /></svg><div className="u05-radar-controls"><p className="u05-radar-instruction">依次查看三条成长曲线即可解锁原文提问；下方四个维度可继续点击查看数据来源。</p>{[["baseline", "入学基线"], ["mid", "第三单元中期"], ["current", "当前数据"]].map(([key, label]) => <button className={layers.includes(key) ? "active" : ""} key={key} onClick={() => setLayers((items) => items.includes(key) ? items : [...items, key])}>{label}</button>)}{["职业能力", "心理韧性", "学习能力", "团队协作"].map((label, index) => <button className={axes.includes(index) ? "viewed" : ""} key={label} onClick={() => setAxes((items) => items.includes(index) ? items : [...items, index])}><span>{label}</span><b>{current[index]}</b><small>来源：前四单元统一快照</small></button>)}</div></div></QuestionFinish>;
}

const memories = [
  ["第一单元 · 岗位选择", "/assets/unit-01/scenes/career-hub-v001.webp"],
  ["第二单元 · 挫折恢复", "/assets/unit-02/scenes/frustration-field-v001.webp"],
  ["第三单元 · 团队协作", "/assets/unit-03/scenes/harvest-festival-v001.webp"],
  ["第四单元 · 限时学习", "/assets/unit-04/scenes/learning-space-v001.webp"],
  ["特别时刻 · 坚持完成", "/assets/unit-05/scenes/memory-gallery-v001.webp"],
] as const;
function MemoryReplay({ onComplete }: { onComplete: Finish }) {
  const [active, setActive] = useState(0); const [playing, setPlaying] = useState(false); const [viewed, setViewed] = useState<number[]>([]); const [replays, setReplays] = useState(0);
  useEffect(() => { if (!playing) return; const timer = window.setTimeout(() => { setViewed((items) => items.includes(active) ? items : [...items, active]); setPlaying(false); }, 1700); return () => window.clearTimeout(timer); }, [playing, active]);
  const choose = (index: number) => { setActive(index); setPlaying(true); };
  return <QuestionFinish id="u05-memory-02-replay" onComplete={onComplete} ready={viewed.length === 5} summary={{ mediaId: "u05-memory-events-v1", mediaProgress: 100, replayCount: replays, momentsViewed: viewed.length }}><div className="u05-memory-player"><div className={`screen ${playing ? "playing" : ""}`}><Image alt={memories[active][0]} fill sizes="700px" src={memories[active][1]} /><div /><strong>{memories[active][0]}</strong><small>{playing ? "正在回放本人已记录的学习证据…" : viewed.includes(active) ? "关键片段已看完" : "选择播放"}</small></div><nav>{memories.map((memory, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={memory[0]} onClick={() => choose(index)}>{index + 1}<span>{memory[0]}</span></button>)}</nav><div className="player-controls"><button onClick={() => setPlaying(!playing)}>{playing ? <CirclePause /> : <CirclePlay />}</button><button onClick={() => { setReplays((value) => value + 1); setPlaying(true); }}><RotateCcw />重播</button></div></div></QuestionFinish>;
}

function TimeMirror({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const [split, setSplit] = useState(48); const [viewed, setViewed] = useState<number[]>([]); const labels = ["职业能力", "心理韧性", "学习能力", "团队协作"]; const current = evidence.abilities?.current ?? [68, 66, 70, 67]; const base = evidence.abilities?.baseline ?? [50, 50, 50, 50];
  return <QuestionFinish id="u05-memory-03-mirror" onComplete={onComplete} ready={viewed.length === 4 && split !== 48} summary={{ mirrorDragged: true, dimensionsCompared: viewed.length }}><div className="u05-time-mirror"><section className="past" style={{ width: `${split}%` }}><span>入学初期</span><b>我还在探索职业和自己</b></section><section className="now"><span>现在</span><b>我能用证据规划下一步</b></section><i style={{ left: `${split}%` }} /><input aria-label="拖动时光对比镜" min="18" max="82" type="range" value={split} onChange={(event) => setSplit(Number(event.target.value))} /><div>{labels.map((label, index) => <button className={viewed.includes(index) ? "active" : ""} key={label} onClick={() => setViewed((items) => items.includes(index) ? items : [...items, index])}><span>{label}</span><b>{base[index]} → {current[index]}</b></button>)}</div></div></QuestionFinish>;
}

function CareerMatch({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const [active, setActive] = useState(0); const [viewed, setViewed] = useState<number[]>([]); const [parts, setParts] = useState<string[]>([]); const completed = evidence.allCompletedCount ?? 0; const baseScores = [76, 79, 74, 77, 72]; const scores = baseScores.map((value, index) => Math.min(96, value + Math.round(completed / 10) + (index === 1 ? 3 : 0)));
  const choose = (index: number) => { setActive(index); setViewed((items) => items.includes(index) ? items : [...items, index]); setParts([]); };
  return <QuestionFinish id="u05-match-01-report" onComplete={onComplete} ready={viewed.length === 5 && parts.length === 3} summary={{ jobsViewed: viewed.length, highestJob: jobs[scores.indexOf(Math.max(...scores))].name, highestScore: Math.max(...scores), evidenceVersion: "five-unit-v1" }}><div className="u05-match-report"><nav>{jobs.map((job, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={job.name} onClick={() => choose(index)}><Image alt="" height={90} src={job.image} width={50} /><span>{job.name}</span><b>{scores[index]}</b></button>)}</nav><section><div className="match-ring" style={{ "--score": scores[active] } as React.CSSProperties}><strong>{scores[active]}</strong><span>证据匹配度</span></div><div className="match-bars">{["专业技能适配度", "性格匹配度", "心理韧性匹配度", "学习能力匹配度", "团队协作适配度"].map((label, index) => <p key={label}><span>{label}</span><i><b style={{ width: `${Math.max(45, scores[active] - 10 + index * 3)}%` }} /></i></p>)}</div><div className="match-analysis">{["你的优势", "你的挑战", "发展建议"].map((label) => <button className={parts.includes(label) ? "active" : ""} key={label} onClick={() => setParts((items) => items.includes(label) ? items : [...items, label])}><b>{label}</b><span>{label === "你的优势" ? "来自已完成任务与能力快照" : label === "你的挑战" ? "需要更多真实实践证据" : "从一个可执行小目标开始"}</span></button>)}</div></section></div></QuestionFinish>;
}

function ChallengeAnalysis({ onComplete }: { onComplete: Finish }) {
  const [opened, setOpened] = useState<number[]>([]); const [caseViewed, setCaseViewed] = useState(false); const [action, setAction] = useState(""); const challenges = ["在压力下稳定表达", "把数据转化为业务判断", "持续积累真实项目成果"];
  return <QuestionFinish id="u05-match-02-challenge" onComplete={onComplete} ready={opened.length === 3 && caseViewed && action.trim().length >= 8} summary={{ challengesViewed: opened.length, caseViewed, contentLength: action.length, contentRef: "attempt-private-content" }} privateContent={{ improvementAction: action }}><div className="u05-challenges">{challenges.map((challenge, index) => <button className={opened.includes(index) ? "open" : ""} key={challenge} onClick={() => setOpened((items) => items.includes(index) ? items : [...items, index])}><b>{challenge}</b><span>{opened.includes(index) ? `${["2 周", "1 个月", "1 学期"][index]} · 每次实践后记录一次证据` : "点击翻开挑战"}</span></button>)}<button className={caseViewed ? "case viewed" : "case"} onClick={() => setCaseViewed(true)}><BookOpen />{caseViewed ? "已查看学长学姐案例：从一次小任务开始" : "查看成功案例"}</button><label>我的第一步行动（仅自己可见）<textarea value={action} onChange={(event) => setAction(event.target.value)} /></label></div></QuestionFinish>;
}

function PlanningBoot({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const [started, setStarted] = useState(false); const sources = ["职业偏好", "心理韧性", "团队协作", "学习能力", "成长轨迹"];
  return <div className="u05-console u05-plan-boot"><button className={`boot-terminal ${started ? "started" : ""}`} onClick={() => setStarted(true)}><Target /><b>职业生涯规划系统 v2.0</b><span>{started ? "本人数据草稿已载入" : "点击启动"}</span></button>{started && <><div className="source-stream">{sources.map((source, index) => <span style={{ animationDelay: `${index * 120}ms` }} key={source}><Check />{source}<small>{index < 4 ? evidence.abilities?.current[index] ?? 0 : evidence.allCompletedCount ?? 0}</small></span>)}</div><button className="primary-button" onClick={() => onComplete({ summary: { unitFiveCompleted: true, systemOpened: true, sourcesLoaded: 5, recommendationsEditable: true } })}>进入五步规划<ArrowRight /></button></>}</div>;
}

function SelfPlanning({ onComplete }: { onComplete: Finish }) {
  const blocks = ["我的兴趣", "我的性格", "我的能力优势", "我的成长空间"]; const [modes, setModes] = useState<Record<string, string>>({}); const [texts, setTexts] = useState<Record<string, string>>({}); const complete = blocks.every((item) => modes[item] && (modes[item] === "采纳推荐" || (texts[item] ?? "").trim().length >= 4));
  return <QuestionFinish id="u05-plan-02-self" onComplete={onComplete} ready={complete} summary={{ blocksCompleted: 4, modifiedCount: Object.values(modes).filter((mode) => mode !== "采纳推荐").length, contentLength: Object.values(texts).join("").length, contentRef: "attempt-private-content" }} privateContent={Object.fromEntries(blocks.map((block) => [block, texts[block] ?? modes[block]]))}><div className="u05-self-plan">{blocks.map((block, index) => <section className={modes[block] ? "complete" : ""} key={block}><b>{block}</b><p>{["我愿意探索智慧农业的多种岗位", "我能在实践中观察自己的工作方式", "我已经完成多个连续任务", "我还需要积累更多真实项目证据"][index]}</p><div>{["采纳推荐", "自主修改", "补充说明"].map((mode) => <button className={modes[block] === mode ? "active" : ""} key={mode} onClick={() => setModes((items) => ({ ...items, [block]: mode }))}>{mode}</button>)}</div>{modes[block] && modes[block] !== "采纳推荐" && <textarea value={texts[block] ?? ""} onChange={(event) => setTexts((items) => ({ ...items, [block]: event.target.value }))} />}</section>)}</div></QuestionFinish>;
}

function EnvironmentPlan({ onComplete }: { onComplete: Finish }) {
  const panels = ["行业环境", "区域环境", "个人环境"]; const [viewed, setViewed] = useState<number[]>([]); const [resource, setResource] = useState("");
  return <QuestionFinish id="u05-plan-03-environment" onComplete={onComplete} ready={viewed.length === 3 && resource.trim().length >= 6} summary={{ panelsViewed: viewed.length, confidenceEvidence: true, contentLength: resource.length, contentRef: "attempt-private-content" }} privateContent={{ availableResources: resource }}><div className="u05-environment">{panels.map((panel, index) => <button className={viewed.includes(index) ? "active" : ""} key={panel} onClick={() => setViewed((items) => items.includes(index) ? items : [...items, index])}><BarChart3 /><b>{panel}</b><span>{["智慧农业与农村电商持续数字化", "本地产业与政策需结合学校资料核验", "家庭、学校、老师与同伴都是资源"][index]}</span><i><b style={{ width: `${64 + index * 10}%` }} /></i></button>)}<label>我目前可以使用的真实资源（仅自己可见）<textarea value={resource} onChange={(event) => setResource(event.target.value)} /></label></div></QuestionFinish>;
}

function GoalPlan({ onComplete }: { onComplete: Finish }) {
  const labels = ["短期目标（1–2 年）", "中期目标（3–5 年）", "长期目标（5–10 年）"]; const [goals, setGoals] = useState<string[]>(["", "", ""]); const [checked, setChecked] = useState(false); const complete = goals.every((goal) => goal.trim().length >= 8);
  return <QuestionFinish id="u05-plan-04-goal" onComplete={onComplete} ready={complete && checked} summary={{ goalsCompleted: 3, smartChecked: checked, smartPass: goals.filter((goal) => /\d/.test(goal)).length, contentLength: goals.join("").length, contentRef: "attempt-private-content" }} privateContent={{ shortGoal: goals[0], midGoal: goals[1], longGoal: goals[2] }}><div className="u05-goal-stairs">{labels.map((label, index) => <label key={label} style={{ "--step": index } as React.CSSProperties}><b>{label}</b><textarea value={goals[index]} onChange={(event) => setGoals((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}<button disabled={!complete} className={checked ? "checked" : ""} onClick={() => setChecked(true)}><ShieldCheck />{checked ? "SMART 扫描完成：请核对具体、可衡量与时限" : "运行目标检查"}</button></div></QuestionFinish>;
}

function ActionPlan({ onComplete }: { onComplete: Finish }) {
  const areas = ["专业技能提升", "心理素质培养", "证书考取", "实践经验积累", "人际关系建设"]; const [values, setValues] = useState<Record<string, string>>({}); const fields = ["具体行动", "时间节点", "衡量标准", "所需资源"]; const filled = areas.flatMap((_, ai) => fields.map((__, fi) => `${ai}-${fi}`)).filter((key) => (values[key] ?? "").trim().length >= 2).length;
  return <QuestionFinish id="u05-plan-05-action" onComplete={onComplete} ready={filled === 20} summary={{ planCells: filled, areasCovered: 5, contentLength: Object.values(values).join("").length, contentRef: "attempt-private-content" }} privateContent={Object.fromEntries(Object.entries(values).map(([key, value]) => [`action-${key}`, value]))}><div className="u05-gantt"><header><span />{fields.map((field) => <b key={field}>{field}</b>)}</header>{areas.map((area, ai) => <section key={area}><strong>{area}</strong>{fields.map((field, fi) => <input aria-label={`${area}${field}`} key={field} value={values[`${ai}-${fi}`] ?? ""} onChange={(event) => setValues((items) => ({ ...items, [`${ai}-${fi}`]: event.target.value }))} />)}<i style={{ width: `${24 + ai * 13}%` }} /></section>)}<p>行动计划完成 {filled} / 20 格</p></div></QuestionFinish>;
}

function AdjustPlan({ onComplete }: { onComplete: Finish }) {
  const [standard, setStandard] = useState(""); const [rule, setRule] = useState(""); const [backup, setBackup] = useState(""); const ready = [standard, rule, backup].every((value) => value.trim().length >= 6);
  return <QuestionFinish id="u05-plan-06-adjust" onComplete={onComplete} ready={ready} summary={{ cycleCompleted: true, contentLength: standard.length + rule.length + backup.length, contentRef: "attempt-private-content" }} privateContent={{ reviewStandard: standard, adjustmentRule: rule, backupPlan: backup }}><div className="u05-review-cycle"><div>{["执行", "评估", "调整", "再执行"].map((label, index) => <span key={label} style={{ "--index": index } as React.CSSProperties}>{label}<ArrowRight /></span>)}</div><label>评估标准<textarea value={standard} onChange={(event) => setStandard(event.target.value)} /></label><label>调整规则<textarea value={rule} onChange={(event) => setRule(event.target.value)} /></label><label>应急预案<textarea value={backup} onChange={(event) => setBackup(event.target.value)} /></label></div></QuestionFinish>;
}

function PlanningBook({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const pages = ["自我认知", "环境分析", "职业目标", "实施计划", "评估调整"]; const [assembled, setAssembled] = useState(false); const [viewed, setViewed] = useState<number[]>([]); const [signature, setSignature] = useState("");
  return <div className="u05-console u05-planning-book"><div className={`book-assembly ${assembled ? "assembled" : ""}`}>{pages.map((page, index) => <button key={page} onClick={() => setViewed((items) => items.includes(index) ? items : [...items, index])} style={{ "--page": index } as React.CSSProperties}><FileCheck2 /><span>{page}</span><small>{viewed.includes(index) ? "已审阅" : "点击审阅"}</small></button>)}</div>{viewed.length === 5 && !assembled && <button className="primary-button" onClick={() => setAssembled(true)}><BookOpen />组合规划书</button>}{assembled && <div className="promise-page"><Image className="nxz-portrait" alt="农小智生涯导师" height={126} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={120} /><p>我，承诺为自己的职业生涯负责，从今天开始，用行动书写未来。</p><label>电子签名<input maxLength={16} value={signature} onChange={(event) => setSignature(event.target.value)} /></label><button className="primary-button" disabled={signature.trim().length < 2} onClick={() => onComplete({ summary: { unitFiveCompleted: true, modulesReviewed: viewed.length, bookAssembled: true, signed: true, planEvidenceCount: evidence.completedInteractionIds?.filter((id) => id.startsWith("u05-plan-")).length ?? 0, contentLength: signature.length, contentRef: "attempt-private-content" }, privateContent: { signature } })}>盖下规划封印<Check /></button></div>}</div>;
}

function DreamPublish({ onComplete }: { onComplete: Finish }) {
  const [declaration, setDeclaration] = useState(""); const [pattern, setPattern] = useState(""); const patterns = ["金色麦田", "翠绿茶园", "丰收果园", "智慧温室", "星空农场"];
  return <QuestionFinish id="u05-dream-01-publish" onComplete={onComplete} ready={declaration.trim().length >= 6 && Boolean(pattern)} summary={{ dreamPublished: true, pattern, declarationLength: declaration.length, contentLength: declaration.length, contentRef: "attempt-private-content" }} privateContent={{ dreamDeclaration: declaration }} label="确认公开范围并发布"><div className="u05-dream-editor"><div className={`dream-brick ${pattern ? "active" : ""}`}><Sparkles /><b>我的职业目标</b><span>{declaration || "一句话宣言会显示在这里"}</span></div><label>一句话宣言（最多 30 字）<input maxLength={30} value={declaration} onChange={(event) => setDeclaration(event.target.value)} /></label><div>{patterns.map((item) => <button className={pattern === item ? "active" : ""} key={item} onClick={() => setPattern(item)}>{item}</button>)}</div><p><ShieldCheck />公开范围由下方原题选择；选择不公开不会降低得分或改变结局。</p></div></QuestionFinish>;
}

function PeerSupport({ onComplete }: { onComplete: Finish }) {
  const peers = [["小林", "让家乡苹果被更多人看见"], ["小周", "用数据让农场少走弯路"], ["小陈", "做有温度的助农主播"], ["小吴", "建立可信赖的家乡品牌"]]; const [read, setRead] = useState<number[]>([]); const [liked, setLiked] = useState<number[]>([]); const [cheered, setCheered] = useState<number[]>([]); const [comment, setComment] = useState(""); const [commented, setCommented] = useState(false); const support = liked.length + cheered.length + (commented ? 1 : 0);
  return <div className="u05-console u05-peer-support"><div className="warm-ticker">今日最暖留言 · 每一步都算数，我们一起加油</div><div className="peer-wall">{peers.map((peer, index) => <article className={read.includes(index) ? "open" : ""} key={peer[0]} onClick={() => setRead((items) => items.includes(index) ? items : [...items, index])}><b>{peer[0]}的梦想</b><p>{read.includes(index) ? peer[1] : "点击阅读同学主动公开的摘要"}</p>{read.includes(index) && <div><button className={liked.includes(index) ? "active" : ""} onClick={(event) => { event.stopPropagation(); setLiked((items) => items.includes(index) ? items : [...items, index]); }}><Heart />点赞</button><button className={cheered.includes(index) ? "active cheer" : "cheer"} onClick={(event) => { event.stopPropagation(); setCheered((items) => items.includes(index) ? items : [...items, index]); }}><ThumbsUp />加油</button></div>}</article>)}</div><label>鼓励留言（可选，最多 50 字）<input maxLength={50} value={comment} onChange={(event) => setComment(event.target.value)} /></label><button className="secondary-button" disabled={comment.trim().length < 2} onClick={() => setCommented(true)}><MessageCircle />{commented ? "留言已进入异步汇总" : "送出鼓励"}</button><p className="u05-hint">已深读 {read.length}/2 · 已完成支持 {support}/2</p><button className="primary-button" disabled={read.length < 2 || support < 2} onClick={() => onComplete({ summary: { unitFiveCompleted: true, dreamsRead: read.length, likes: liked.length, cheers: cheered.length, comments: commented ? 1 : 0, mode: "asynchronous-peer-support", contentLength: comment.length, contentRef: "attempt-private-content" }, privateContent: comment ? { peerComment: comment } : undefined })}>完成同伴支持<Check /></button></div>;
}

function MentorMessage({ onComplete }: { onComplete: Finish }) {
  const messages = ["你的起点不决定你的终点，未来由你自己书写。", "规划不是限制自由，而是让每一步都有方向。", "永远不要停止学习，真实的人生旅程才刚刚开始。"];
  const [started, setStarted] = useState(false); const [step, setStep] = useState(0); const [replay, setReplay] = useState(0); const [satisfaction, setSatisfaction] = useState(4);
  useEffect(() => { if (!started || step >= 2) return; const timer = window.setTimeout(() => setStep((value) => value + 1), 1600); return () => window.clearTimeout(timer); }, [started, step]);
  return <div className="u05-console u05-mentor-message"><div className={`photo-wall step-${step}`}>{memories.slice(0, 4).map((memory) => <Image alt="" height={120} key={memory[0]} src={memory[1]} width={200} />)}<Image className="mentor nxz-portrait" alt="农小智生涯导师" height={190} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={180} /></div><blockquote>{started ? messages[step] : "点击开始观看农小智总结寄语"}</blockquote><div className="player-controls"><button onClick={() => setStarted(true)}><CirclePlay />开始</button><button onClick={() => { setStep(0); setReplay((value) => value + 1); setStarted(true); }}><RotateCcw />重播</button></div><p className="u05-source-gap">字幕已完整提供 · 正式配音素材待接入</p>{started && step === 2 && <><label>总体满意度 {satisfaction}/5<input min="1" max="5" type="range" value={satisfaction} onChange={(event) => setSatisfaction(Number(event.target.value))} /></label><button className="primary-button" onClick={() => onComplete({ summary: { unitFiveCompleted: true, narrationProgress: 100, replayCount: replay, satisfaction, mediaMode: "subtitle" } })}>保存寄语观看记录<Check /></button></>}</div>;
}

function FutureEnding({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const mainCompleted = evidence.completedInteractionIds?.filter((id) => id.startsWith("u05-") && !id.includes("prophecy") && !id.includes("letter")).length ?? 0; const ability = evidence.abilities?.current ?? [60, 60, 60, 60]; const score = Math.min(100, Math.round(mainCompleted / 20 * 60 + ability.reduce((sum, value) => sum + value, 0) / 4 * .4)); const ending = score >= 80 ? "星光大道" : score >= 60 ? "晨光之路" : "种子发芽"; const image = score >= 80 ? "/assets/unit-05/endings/starlight-road-v001.webp" : score >= 60 ? "/assets/unit-05/endings/dawn-road-v001.webp" : "/assets/unit-05/endings/seedling-field-v001.webp"; const [opened, setOpened] = useState(false); const [evidenceOpen, setEvidenceOpen] = useState(false); const [save, setSave] = useState(false);
  return <div className="u05-console u05-future-ending">{!opened ? <button className="future-gate" onClick={() => setOpened(true)}><Sparkles /><b>未来之门</b><span>依据五单元证据进入未来之境</span></button> : <div className={`ending-scene ending-${ending}`}><Image alt={`${ending}结局场景`} fill sizes="900px" src={image} /><div /><Image className="ending-mentor nxz-portrait" alt="农小智" height={169} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={160} /><section><span>多元成长结局</span><h2>{ending}</h2><p>{ending === "星光大道" ? "你的准备充分，目标清晰。保持谦逊，保持学习。" : ending === "晨光之路" ? "你已经有了方向。每一步都算数，不要停下脚步。" : "一切正在萌芽。这不是落后，而是仍有巨大的成长空间。"}</p></section></div>}{opened && <><button className="secondary-button" onClick={() => setEvidenceOpen(!evidenceOpen)}><BarChart3 />{evidenceOpen ? "收起构成" : "查看结局构成"}</button>{evidenceOpen && <div className="ending-evidence"><span>第五单元主线证据 <b>{mainCompleted}/20</b></span><span>四维能力当前均值 <b>{Math.round(ability.reduce((a, b) => a + b, 0) / 4)}</b></span><span>规则版本 <b>ending-v1</b></span><strong>综合 {score}</strong></div>}<label className="share-toggle"><input checked={save} type="checkbox" onChange={(event) => setSave(event.target.checked)} />标记为希望保存结局画面</label><button className="primary-button" onClick={() => onComplete({ summary: { unitFiveCompleted: true, ending, endingScore: score, endingRule: "ending-v1", evidenceViewed: evidenceOpen, saveRequested: save } })}>确认这是新的起点<Check /></button></>}</div>;
}

function ProphecyBook({ onComplete }: { onComplete: Finish }) {
  const events = [["2028", "AI 农业顾问更加普及"], ["2030", "沉浸式农场体验成为新消费方式"], ["2032", "农场数据分析岗位更常见"]]; const [active, setActive] = useState(0); const [strategies, setStrategies] = useState<string[]>(["", "", ""]); const [viewed, setViewed] = useState<number[]>([]); const ready = strategies.every((item) => item.trim().length >= 6) && viewed.length === 3;
  return <QuestionFinish id="u05-prophecy-01-book" onComplete={onComplete} ready={ready} summary={{ trendsViewed: viewed.length, strategiesCompleted: 3, contentLength: strategies.join("").length, contentRef: "attempt-private-content" }} privateContent={{ strategy2028: strategies[0], strategy2030: strategies[1], strategy2032: strategies[2] }}><div className="u05-prophecy-book"><nav>{events.map((event, index) => <button className={active === index ? "active" : viewed.includes(index) ? "viewed" : ""} key={event[0]} onClick={() => { setActive(index); setViewed((items) => items.includes(index) ? items : [...items, index]); }}>{event[0]}</button>)}</nav><section><BookOpen /><span>趋势不是确定预言</span><h2>{events[active][1]}</h2><p>对你的影响：基础工作会改变，但理解业务、核验结果和持续学习仍然重要。</p><label>我的应对策略（仅自己可见）<textarea value={strategies[active]} onChange={(event) => setStrategies((items) => items.map((item, index) => index === active ? event.target.value : item))} /></label></section></div></QuestionFinish>;
}

function ProphecySimulation({ onComplete }: { onComplete: Finish }) {
  const years = ["2026", "2028", "2030", "2032", "2036"]; const [opened, setOpened] = useState<number[]>([0]); const [answered, setAnswered] = useState(false);
  return <QuestionFinish id="u05-prophecy-02-sim" onComplete={onComplete} ready={opened.includes(1) && answered} summary={{ authoredDecisionCount: 1, totalVisualNodes: 5, missingAuthoredQuestions: 4, trajectoryGenerated: answered }} label="生成已定义职业轨迹"><div className="u05-future-timeline"><svg viewBox="0 0 600 120"><path d="M20 70 C140 10 230 115 350 55 S500 30 580 70" /><path className={answered ? "active" : ""} d="M20 70 C140 10 230 115 350 55 S500 30 580 70" /></svg>{years.map((year, index) => <button className={opened.includes(index) ? "active" : ""} key={year} onClick={() => setOpened((items) => items.includes(index) ? items : [...items, index])}><b>{year}</b><span>{index === 1 ? "原文决策题" : index === 0 ? "当前起点" : "课程题干待补充"}</span></button>)}</div>{opened.some((index) => index > 1) && <p className="u05-source-gap">原始需求未提供其余 4 个节点的题干与选项，本版不擅自编题，也不计入正确率。</p>}<button className="secondary-button compact" onClick={() => setAnswered(true)}><Sparkles />预览选择后的轨迹线</button></QuestionFinish>;
}

function LetterTime({ evidence, onComplete }: { evidence: UnitFiveEvidence; onComplete: Finish }) {
  const [selected, setSelected] = useState<number | null>(null); const envelopes = [["1 年后", "green"], ["3 年后", "blue"], ["5 年后", "gold"]];
  return <QuestionFinish id="u05-letter-01-time" onComplete={onComplete} ready={selected !== null} summary={{ envelopeSelected: selected === null ? "unselected" : envelopes[selected][0], snapshotVersion: "five-unit-current" }}><div className="u05-letter-time"><div>{envelopes.map((item, index) => <button className={`${item[1]} ${selected === index ? "active" : ""}`} key={item[0]} onClick={() => setSelected(index)}><Mail /><b>{item[0]}</b><span>{["毕业时", "职场初期", "发展阶段"][index]}</span></button>)}</div><section><b>当前成长快照</b>{["职业能力", "心理韧性", "学习能力", "团队协作"].map((label, index) => <span key={label}>{label}<strong>{evidence.abilities?.current[index] ?? 0}</strong></span>)}</section></div></QuestionFinish>;
}

function LetterSeal({ onComplete }: { onComplete: Finish }) {
  const [letter, setLetter] = useState(""); const [stamp, setStamp] = useState(""); const [sealed, setSealed] = useState(false);
  return <QuestionFinish id="u05-letter-02-seal" onComplete={onComplete} ready={letter.trim().length >= 20 && Boolean(stamp) && sealed} summary={{ letterSealed: true, stamp, letterLength: letter.length, reminderRequested: true, contentLength: letter.length, contentRef: "attempt-private-content" }} privateContent={{ futureLetter: letter }} label="保存感受并投递"><div className="u05-letter-seal"><div className={`paper ${sealed ? "sealed" : ""}`}><Mail /><label>写给未来的我<textarea maxLength={800} value={letter} onChange={(event) => setLetter(event.target.value)} /></label><span>{letter.length}/800</span>{stamp && <i className={stamp}>梦</i>}</div><div className="stamp-picker">{[["red", "红色"], ["blue", "蓝色"], ["gold", "金色"]].map(([code, label]) => <button className={stamp === code ? "active" : ""} key={code} onClick={() => setStamp(code)}><i className={code} />{label}火漆</button>)}</div><button className="secondary-button" disabled={letter.trim().length < 20 || !stamp} onClick={() => setSealed(true)}><FileCheck2 />{sealed ? "信件已折叠并飞入信箱" : "完成并密封"}</button></div></QuestionFinish>;
}

export function UnitFiveOperation({ interaction, evidence, onComplete }: Props) {
  switch (interaction.id) {
    case "u05-path-01-role": return <CareerStaircase onComplete={onComplete} />;
    case "u05-path-02-stage": return <StageExplorer onComplete={onComplete} />;
    case "u05-path-03-tech-manage": case "u05-path-04-startup": case "u05-path-05-change": return <ForkRoad id={interaction.id} onComplete={onComplete} />;
    case "u05-memory-01-radar": return <GrowthRadar evidence={evidence} onComplete={onComplete} />;
    case "u05-memory-02-replay": return <MemoryReplay onComplete={onComplete} />;
    case "u05-memory-03-mirror": return <TimeMirror evidence={evidence} onComplete={onComplete} />;
    case "u05-match-01-report": return <CareerMatch evidence={evidence} onComplete={onComplete} />;
    case "u05-match-02-challenge": return <ChallengeAnalysis onComplete={onComplete} />;
    case "u05-plan-01-open": return <PlanningBoot evidence={evidence} onComplete={onComplete} />;
    case "u05-plan-02-self": return <SelfPlanning onComplete={onComplete} />;
    case "u05-plan-03-environment": return <EnvironmentPlan onComplete={onComplete} />;
    case "u05-plan-04-goal": return <GoalPlan onComplete={onComplete} />;
    case "u05-plan-05-action": return <ActionPlan onComplete={onComplete} />;
    case "u05-plan-06-adjust": return <AdjustPlan onComplete={onComplete} />;
    case "u05-plan-07-save": return <PlanningBook evidence={evidence} onComplete={onComplete} />;
    case "u05-dream-01-publish": return <DreamPublish onComplete={onComplete} />;
    case "u05-dream-02-peer": return <PeerSupport onComplete={onComplete} />;
    case "u05-dream-03-message": return <MentorMessage onComplete={onComplete} />;
    case "u05-ending-01-future": return <FutureEnding evidence={evidence} onComplete={onComplete} />;
    case "u05-prophecy-01-book": return <ProphecyBook onComplete={onComplete} />;
    case "u05-prophecy-02-sim": return <ProphecySimulation onComplete={onComplete} />;
    case "u05-letter-01-time": return <LetterTime evidence={evidence} onComplete={onComplete} />;
    case "u05-letter-02-seal": return <LetterSeal onComplete={onComplete} />;
    default: return <div className="u05-console">未知互动。</div>;
  }
}
