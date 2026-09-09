"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Check, ChevronRight, CirclePause, CirclePlay, Crown, HeartPulse, Lightbulb, LockKeyhole, MessageCircleHeart, MessagesSquare, Palette, Rocket, ScanSearch, ShieldCheck, Sparkles, Sprout, Users, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import type { UnitTwoInteraction } from "@/lib/curriculum";
import { getCareerRoleAsset } from "@/lib/visual-assets";
import { useManagedQuestion } from "@/components/managed-questions-provider";

type Completion = { summary: Record<string, boolean | number | string>; privateContent?: Record<string, string | string[]> };
type Evidence = { completedInteractionIds?: string[]; role?: string; avatar?: string; latestByInteraction?: Record<string, Record<string, unknown>> };
type Props = { interaction: UnitTwoInteraction; evidence: Evidence; onComplete: (result: Completion) => void; pending: boolean };

const roleIdByName: Record<string, string> = { "助农电商主播": "anchor", "智慧农场运营师": "farm", "农产品品牌策划师": "brand", "乡村电商运营官": "ops", "新农人创业家": "founder" };
const roleImage = (evidence: Evidence) => {
  const [avatarRole, avatarGender] = (evidence.avatar ?? "anchor-female").split("-");
  return getCareerRoleAsset(avatarRole || roleIdByName[evidence.role ?? ""] || "anchor", avatarGender === "male" ? "male" : "female");
};

function ChoiceButtons({ items, value, onChange }: { items: readonly string[]; value: number | null; onChange: (index: number) => void }) {
  const { question, check } = useManagedQuestion(); const [managedFeedback, setManagedFeedback] = useState(""); const choices = question?.options ?? items;
  const choose = async (index: number) => { if (question && check) { const result = await check(question, String.fromCharCode(65 + index)); setManagedFeedback(result.feedback); } onChange(index); };
  return <div className={`u02-choice-grid ${question ? "managed" : ""}`}>{question && <h2 className="managed-question-prompt">{question.prompt}</h2>}{choices.map((item, index) => <button className={value === index ? "active" : ""} key={`${index}-${item}`} onClick={() => void choose(index)}><b>{String.fromCharCode(65 + index)}</b><span>{item}</span></button>)}{managedFeedback && <p className="managed-question-feedback"><Lightbulb />{managedFeedback}</p>}</div>;
}

function MirrorActivation({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const [active, setActive] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const abilities = ["沟通能力", "抗压能力", "创新思维", "团队协作", "专业技能"];
  return <div className={`u02-console mirror-console ${active ? "activated" : ""}`}>
    <div className="mind-mirror"><div className="mirror-surface">{active && <><Image alt={`${evidence.role}职业镜像`} height={420} src={roleImage(evidence)} width={280} /><div className="mirror-ripples" />{abilities.map((item, index) => <span key={item} style={{ "--i": index } as React.CSSProperties}>{item}</span>)}</>}</div><Image alt="麦穗与电路纹理的心灵之镜" fill priority sizes="380px" src="/assets/unit-02/props/mind-mirror-frame-v001.png" /></div>
    {!active ? <button className="primary-button" onClick={() => setActive(true)}><Sparkles />启动岗位镜像</button> : <div className="u02-decision"><small>当前身份 · {evidence.role}</small><h2>你觉得这个岗位最需要什么能力？</h2><ChoiceButtons items={["沟通表达能力", "数据分析能力", "创意思维能力", "统筹管理能力"]} onChange={setChoice} value={choice} />{choice !== null && <><p className="safe-feedback">没有唯一答案。你的选择会成为后续自我分析的起点，而不是给你贴标签。</p><button className="primary-button" onClick={() => onComplete({ summary: { mirrorActivated: true, abilityTendency: ["communication", "analysis", "creative", "management"][choice], role: evidence.role ?? "助农电商主播", switches: 0 } })}>保存镜像观察<ChevronRight /></button></>}</div>}
  </div>;
}

function GrowthScroll({ onComplete }: Pick<Props, "onComplete">) {
  const tags = ["公众表达", "情绪管理", "时间规划", "耐心与毅力", "创意思维", "数据敏感度", "团队领导力", "抗压能力", "主动沟通", "细节把控"];
  const [growth, setGrowth] = useState<string[]>([]);
  const [dragged, setDragged] = useState("");
  const [recommended, setRecommended] = useState(false);
  const add = (tag: string) => setGrowth((items) => items.includes(tag) ? items.filter((item) => item !== tag) : items.length < 2 ? [...items, tag] : [items[1], tag]);
  return <div className="u02-console scroll-console"><div className="scroll-prop"><Image alt="成长卷轴" fill sizes="720px" src="/assets/unit-02/props/growth-scroll-v001.png" /><div className="scroll-columns"><section><span>我的闪光点</span><b>愿意完成真实操作</b><b>能根据反馈调整</b><b>已经建立职业方向</b></section><section onDragOver={(event) => event.preventDefault()} onDrop={() => dragged && add(dragged)}><span>我的成长空间</span>{growth.map((item) => <b key={item}>{item}<button aria-label={`移除${item}`} onClick={() => add(item)}>×</button></b>)}{growth.length < 2 && <i>把两个标签拖到这里</i>}</section></div></div><div className="growth-tag-bank">{tags.map((tag) => <button className={growth.includes(tag) ? "active" : ""} draggable key={tag} onClick={() => add(tag)} onDragStart={() => setDragged(tag)}>{tag}</button>)}</div><button className="text-button" onClick={() => { setRecommended(true); setGrowth(["情绪管理", "主动沟通"]); }}><Lightbulb />农小智推荐</button>{recommended && <p className="safe-feedback">推荐来自通用岗位能力模型，你可以继续替换，选择权属于你。</p>}<button className="primary-button" disabled={growth.length < 2} onClick={() => onComplete({ summary: { growthPlanCreated: true, growthCount: growth.length, recommendationUsed: recommended, contentLength: growth.join("").length, contentRef: "attempt-private-content", mode: "tags" }, privateContent: { growthAreas: growth } })}>保存成长计划<Check /></button></div>;
}

function SwotCompass({ onComplete }: Pick<Props, "onComplete">) {
  const quadrants = [{ key: "S", label: "优势", options: ["行动执行", "表达清楚", "学习速度"] }, { key: "W", label: "成长空间", options: ["压力调节", "时间规划", "主动沟通"] }, { key: "O", label: "机会", options: ["乡村振兴", "直播电商", "数字农业"] }, { key: "T", label: "挑战", options: ["技术更新", "市场波动", "协作复杂"] }] as const;
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);
  const [opportunity, setOpportunity] = useState(0);
  const complete = quadrants.every((item) => values[item.key]);
  return <div className="u02-console swot-console"><div className="swot-compass" style={{ "--turn": `${active * 90}deg` } as React.CSSProperties}><i /><b>{quadrants[active].key}</b>{quadrants.map((item, index) => <button className={values[item.key] ? "filled" : ""} key={item.key} onClick={() => setActive(index)}>{item.key}<small>{item.label}</small></button>)}</div><section><span>{quadrants[active].key} · {quadrants[active].label}</span><h2>选择最符合当前情况的一项</h2><div className="tag-row">{quadrants[active].options.map((option) => <button className={values[quadrants[active].key] === option ? "active" : ""} key={option} onClick={() => setValues((current) => ({ ...current, [quadrants[active].key]: option }))}>{option}</button>)}</div>{complete && <><label>当前岗位最主要的外部机会<select onChange={(event) => setOpportunity(Number(event.target.value))} value={opportunity}><option value={0}>国家乡村振兴政策支持</option><option value={1}>短视频和直播电商发展</option><option value={2}>绿色农产品需求增长</option><option value={3}>农业数字化人才缺口</option></select></label><div className="mini-radar" aria-label="五维策略雷达">{[72, 58, 81, 66, 74].map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}</div><button className="primary-button" onClick={() => onComplete({ summary: { swotCompleted: true, completeness: 4, opportunity: opportunity + 1, depth: Object.values(values).join("").length }, privateContent: { swot: Object.entries(values).map(([key, value]) => `${key}:${value}`) } })}>生成自我战略地图<Sparkles /></button></>}</section></div>;
}

function LiveCrisis({ onComplete }: Pick<Props, "onComplete">) {
  const [started, setStarted] = useState(false); const [viewers, setViewers] = useState(5000); const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => { if (!started || viewers <= 800) return; const timer = window.setInterval(() => setViewers((value) => Math.max(800, value - 420)), 150); return () => clearInterval(timer); }, [started, viewers]);
  const choices = ["关闭评论区，假装没看见", "深呼吸稳住情绪，诚恳回应", "回怼恶意评论", "大脑空白，不知道说什么"];
  return <div className={`u02-console live-crisis ${started ? "storm" : ""}`}><div className="live-room"><header><span>直播中</span><b>{viewers.toLocaleString()} 人在线</b></header><div className="barrage">{started ? ["退货！", "产品是真的吗？", "请拿出证据", "先听主播说明"].map((item, index) => <i key={item} style={{ "--i": index } as React.CSSProperties}>{item}</i>) : <p>稻田直播准备完成</p>}</div><HeartPulse className={started ? "pulse" : ""} /><strong>{started ? 126 : 78}<small> bpm · 情境模拟</small></strong></div>{!started ? <button className="primary-button" onClick={() => setStarted(true)}>开启直播情境<CirclePlay /></button> : viewers > 800 ? <p className="crisis-loading">评论风暴正在发生，先观察身体与场景变化…</p> : <div className="u02-decision"><h2>你的第一反应是？</h2><ChoiceButtons items={choices} onChange={setChoice} value={choice} />{choice !== null && <><p className="safe-feedback">{["回避是可以理解的本能，下一步可以从面对一条具体问题开始。", "先稳定自己再行动，是可迁移的积极应对。", "生气说明你在乎，延迟回应能保护你的专业表达。", "冻结反应并不等于软弱，预先准备一句开场回应会有帮助。"][choice]}</p><button className="primary-button" onClick={() => onComplete({ summary: { crisisViewed: true, firstReaction: ["avoid", "active", "fight", "freeze"][choice], viewerLow: viewers, simulatedHeartRate: 126 } })}>记录这次反应<ChevronRight /></button></>}</div>}</div>;
}

function EmotionDial({ onComplete }: Pick<Props, "onComplete">) {
  const emotions = [{ name: "愤怒", color: "#d84b46", signal: "肩颈紧、说话变快" }, { name: "沮丧", color: "#4c78b8", signal: "动作变慢、想退开" }, { name: "焦虑", color: "#dfae35", signal: "心跳加速、反复担心" }, { name: "恐惧", color: "#8666b5", signal: "身体后撤、注意力变窄" }];
  const [value, setValue] = useState(2); const [grounding, setGrounding] = useState(0);
  const item = emotions[value];
  return <div className="u02-console emotion-dial-console" style={{ "--emotion": item.color } as React.CSSProperties}><div className="emotion-dial"><div><b>{item.name}</b><small>{item.signal}</small></div><input aria-label="拖动选择情绪" max={3} min={0} onChange={(event) => setValue(Number(event.target.value))} type="range" value={value} /><div>{emotions.map((emotion) => <span key={emotion.name}>{emotion.name}</span>)}</div></div><section><h2>先命名，再决定下一步</h2><p>情绪本身没有好坏。准确说出感受，能为下一步行动留出空间。</p><button className="secondary-button" onClick={() => setGrounding((step) => Math.min(5, step + 1))}><Wind />{grounding ? `着陆练习 ${grounding}/5` : "体验 5-4-3-2-1 着陆法"}</button>{grounding > 0 && <p className="grounding-step">{["说出 5 样看到的东西", "留意 4 种听到的声音", "感受 3 处身体接触", "辨认 2 种气味", "做 1 次缓慢呼吸"][grounding - 1]}</p>}<button className="primary-button" onClick={() => onComplete({ summary: { emotionLabeled: true, emotion: ["anger", "sadness", "anxiety", "fear"][value], groundingCompleted: grounding === 5, dialValue: value } })}>完成情绪标注<Check /></button></section></div>;
}

function CopingToolbox({ onComplete }: Pick<Props, "onComplete">) {
  const methods = [{ name: "积极暗示", code: "affirmation", viewers: 1200, stars: 3 }, { name: "认知重评", code: "reframing", viewers: 2000, stars: 4 }, { name: "寻求支持", code: "support", viewers: 2800, stars: 4 }, { name: "问题解决", code: "problem-solving", viewers: 3500, stars: 5 }];
  const [open, setOpen] = useState(false); const [selected, setSelected] = useState<number | null>(null);
  return <div className={`u02-console toolbox-console ${open ? "open" : ""}`}><button className="toolbox-prop" aria-label="打开策略工具箱" onClick={() => setOpen(true)}><Image alt="四槽策略工具箱" fill sizes="420px" src="/assets/global/props/strategy-toolbox-v001.png" /></button>{!open ? <p>点击工具箱打开四种应对策略</p> : <div><div className="tool-slots">{methods.map((method, index) => <button className={selected === index ? "active" : ""} key={method.code} onClick={() => setSelected(index)}><ShieldCheck /><b>{method.name}</b></button>)}</div>{selected !== null && <div className="strategy-result"><span>策略演绎结果</span><strong>{methods[selected].viewers.toLocaleString()} 人回到直播间</strong><div>{"★".repeat(methods[selected].stars)}{"☆".repeat(5 - methods[selected].stars)}</div><p>{methods[selected].code === "problem-solving" ? "拿出检测证据逐条回应，信任恢复最快。" : "这个工具能帮助恢复行动力，也可以和问题解决组合使用。"}</p><button className="primary-button" onClick={() => onComplete({ summary: { strategyApplied: true, strategy: methods[selected].code, effectiveness: methods[selected].stars, recoveredViewers: methods[selected].viewers } })}>收入我的策略库<Check /></button></div>}</div>}</div>;
}

function PriorityCrisis({ onComplete }: Pick<Props, "onComplete">) {
  const initial = ["同步农场主当前进度", "排查温控设备并启用应急通风", "联系外部技术支持"];
  const [steps, setSteps] = useState(initial); const [choice, setChoice] = useState<number | null>(null);
  const move = (index: number, direction: -1 | 1) => { const next = [...steps]; const other = index + direction; if (other < 0 || other >= next.length) return; [next[index], next[other]] = [next[other], next[index]]; setSteps(next); };
  return <div className="u02-console priority-console"><div className="temperature-alarm"><span>棚内温度</span><strong>36.8℃</strong><i /><p>温控设备离线 · 精品果蔬风险上升</p></div><section><h2>先做什么，后做什么？</h2>{steps.map((step, index) => <div className="priority-step" key={step}><b>{index + 1}</b><span>{step}</span><button aria-label="上移" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></button><button aria-label="下移" disabled={index === steps.length - 1} onClick={() => move(index, 1)}><ArrowDown /></button></div>)}<h3>你的整体处置方式</h3><ChoiceButtons items={["先安抚农场主，再排查", "排查设备并同步进度", "停下来等明确指令", "全部交给外部人员"]} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { prioritySubmitted: true, approach: ["steady", "parallel", "freeze", "dependent"][choice], firstStep: steps[0], optimalOrder: steps[0].startsWith("排查") } })}>执行处置方案<ChevronRight /></button>}</section></div>;
}

function RejectionBranch({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const [choice, setChoice] = useState<number | null>(null);
  const results = ["当场解释让气氛继续紧张，专业内容暂时难被听见。", "会后获得具体修改意见，方案重新进入讨论。", "想法没有再次出现，但你可以从一次小范围沟通重新开始。", "离场让你暂时脱离压力，恢复后仍需要一个安全的沟通入口。"];
  return <div className="u02-console rejection-console"><div className="meeting-scene"><Image alt="品牌策划师" height={300} src={getCareerRoleAsset("brand", evidence.avatar?.endsWith("male") ? "male" : "female")} width={200} /><div><span>团队评审会</span><blockquote>“这套方案太文艺了，先说清楚它怎样帮助销售。”</blockquote><i>会议室短暂安静</i></div></div><ChoiceButtons items={["当场据理力争", "会后了解否定的具体原因", "以后不再主动提想法", "情绪上来后直接离场"]} onChange={setChoice} value={choice} />{choice !== null && <div className="branch-timeline"><b>{choice === 1 ? "会后 · 沟通重新开始" : "下一步 · 为自己留出恢复空间"}</b><p>{results[choice]}</p><button className="primary-button" onClick={() => onComplete({ summary: { rejectionHandled: true, response: ["confront", "strategic", "withdraw", "overwhelmed"][choice], guidanceViewed: true } })}>记录应对分支<Check /></button></div>}</div>;
}

const expressionSamples = [
  { id: "anger", label: "愤怒", image: "/assets/unit-02/expressions/anger-v001.webp" },
  { id: "anxiety", label: "焦虑", image: "/assets/unit-02/expressions/anxiety-v001.webp" },
  { id: "joy", label: "开心", image: "/assets/unit-02/expressions/joy-v001.webp" },
  { id: "sadness", label: "悲伤", image: "/assets/unit-02/expressions/sadness-v001.webp" },
  { id: "fear", label: "恐惧", image: "/assets/unit-02/expressions/fear-v001.webp" },
  { id: "surprise", label: "惊讶", image: "/assets/unit-02/expressions/surprise-v001.webp" },
] as const;

function ExpressionDecoder({ onComplete }: Pick<Props, "onComplete">) {
  const [selected, setSelected] = useState(""); const [matches, setMatches] = useState<Record<string, string>>({}); const [errors, setErrors] = useState(0);
  const match = (id: string, label = selected) => { if (!label) return; if (id !== label) { setErrors((v) => v + 1); return; } setMatches((items) => ({ ...items, [id]: label })); setSelected(""); };
  return <div className="u02-console decoder-console"><div className="expression-labels">{expressionSamples.map((item) => <button className={selected === item.id ? "active" : ""} draggable key={item.id} onClick={() => setSelected(item.id)} onDragStart={() => setSelected(item.id)}>{item.label}</button>)}</div><div className="expression-screens">{expressionSamples.map((item) => <button className={`${matches[item.id] ? "matched" : ""}`} key={item.id} onClick={() => match(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => match(item.id)}><Image alt="农村电商情绪识别教学样本" fill sizes="180px" src={item.image} />{matches[item.id] ? <span><Check />{item.label}</span> : <span>拖入标签</span>}</button>)}</div><p>先点击或拖动上方标签，再选择对应表情。错误只提供线索，可以继续修正。</p><button className="primary-button" disabled={Object.keys(matches).length < 6} onClick={() => onComplete({ summary: { expressionsDecoded: true, correctCount: 6, errorCount: errors, firstAccuracy: Math.round(600 / (6 + errors)) / 100 } })}>完成六屏解码<Sparkles /></button></div>;
}

function EmotionTranslator({ onComplete }: Pick<Props, "onComplete">) {
  const [mode, setMode] = useState<"you" | "i">("you"); const [feeling, setFeeling] = useState(""); const [reason, setReason] = useState(""); const [hope, setHope] = useState("");
  const sentence = mode === "you" ? "你总是临时改方案，根本不尊重别人。" : `我感到${feeling || "……"}，因为${reason || "……"}，我希望${hope || "……"}。`;
  return <div className="u02-console translator-console"><div className="typewriter-wrap"><Image alt="情绪翻译打字机" fill sizes="520px" src="/assets/global/props/typewriter-v001.png" /><p key={sentence}>{sentence}</p></div><div className="segmented"><button className={mode === "you" ? "active" : ""} onClick={() => setMode("you")}>指责式表达</button><button className={mode === "i" ? "active" : ""} onClick={() => setMode("i")}>I-message</button></div>{mode === "i" && <div className="translator-fields"><label>我感到<input value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="着急/失落/担心" /></label><label>因为<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="具体发生了什么" /></label><label>我希望<input value={hope} onChange={(e) => setHope(e.target.value)} placeholder="下一步可以怎么做" /></label></div>}<div className={`listener-reaction ${mode}`}><MessageCircleHeart /><span>{mode === "i" ? "对方从防御转为倾听" : "对方保持防御"}</span></div><button className="primary-button" disabled={mode !== "i" || [feeling, reason, hope].some((item) => item.trim().length < 2)} onClick={() => onComplete({ summary: { messageTranslated: true, mode: "i-message", contentLength: feeling.length + reason.length + hope.length, contentRef: "attempt-private-content" }, privateContent: { iMessage: sentence } })}>保存沟通表达<Check /></button></div>;
}

function TimedMethodExperience({ methods, seconds, minimum, actionKey, onComplete, evidenceKey }: { methods: readonly string[]; seconds: number; minimum: number; actionKey: string; evidenceKey: string; onComplete: Props["onComplete"] }) {
  const [active, setActive] = useState(""); const [remaining, setRemaining] = useState(seconds); const [paused, setPaused] = useState(false); const [completed, setCompleted] = useState<string[]>([]); const [top, setTop] = useState<string[]>([]); const [draggedTop, setDraggedTop] = useState(""); const [dragSorts, setDragSorts] = useState(0);
  useEffect(() => { if (!active || paused || completed.includes(active)) return; const timer = window.setTimeout(() => { if (remaining <= 1) { setCompleted((items) => [...items, active]); setTop((items) => items.length < 3 ? [...items, active] : items); setActive(""); setRemaining(seconds); } else setRemaining((value) => value - 1); }, 1000); return () => clearTimeout(timer); }, [active, paused, remaining, completed, seconds]);
  const choose = (method: string) => { if (completed.includes(method)) { setTop((items) => items.includes(method) ? items.filter((item) => item !== method) : items.length < 3 ? [...items, method] : items); return; } setActive(method); setRemaining(seconds); setPaused(false); };
  const reorder = (index: number, direction: -1 | 1) => { const next = [...top]; const other = index + direction; if (other < 0 || other >= next.length) return; [next[index], next[other]] = [next[other], next[index]]; setTop(next); };
  const dropTop = (target: string) => { if (!draggedTop || draggedTop === target) return; const next = [...top]; const from = next.indexOf(draggedTop); const to = next.indexOf(target); if (from < 0 || to < 0) return; next.splice(from, 1); next.splice(to, 0, draggedTop); setTop(next); setDragSorts((value) => value + 1); };
  return <div className="timed-methods"><div className="method-orbit">{methods.map((method, index) => <button className={`${active === method ? "active" : ""} ${completed.includes(method) ? "done" : ""}`} key={method} onClick={() => choose(method)} style={{ "--i": index } as React.CSSProperties}>{completed.includes(method) ? <Check /> : <Sparkles />}<span>{method}</span></button>)}</div>{active && <div className="method-experience"><div className="countdown-ring" style={{ "--progress": `${(seconds - remaining) / seconds * 100}%` } as React.CSSProperties}><strong>{remaining}</strong><small>秒</small></div><h2>{active}</h2><p>{active.includes("呼吸") ? "跟随光圈缓慢吸气、停顿、呼气。" : active.includes("运动") ? "跟随脚步节奏舒展肩颈和双臂。" : "观察念头，给自己一句具体、可行动的话。"}</p><button onClick={() => setPaused((value) => !value)}>{paused ? <CirclePlay /> : <CirclePause />}{paused ? "继续" : "暂停"}</button></div>}<section className="top-strategies"><span>我的 TOP3 · 可拖拽排序</span>{top.map((method, index) => <div draggable key={method} onDragOver={(event) => event.preventDefault()} onDragStart={() => setDraggedTop(method)} onDrop={() => dropTop(method)}><b>{index + 1}</b><span>{method}</span><button aria-label={`上移${method}`} onClick={() => reorder(index, -1)}><ArrowUp /></button><button aria-label={`下移${method}`} onClick={() => reorder(index, 1)}><ArrowDown /></button></div>)}<small>已体验 {completed.length} / {methods.length}；点击已完成工具可加入或移出 TOP3。</small></section><button className="primary-button" disabled={completed.length < minimum || top.length < Math.min(3, minimum)} onClick={() => onComplete({ summary: { [actionKey]: true, methodsExperienced: completed.length, preferred: top.join("|"), experienceSeconds: completed.length * seconds, dragSorts }, privateContent: { [evidenceKey]: top } })}>保存我的工具组合<Check /></button></div>;
}

function RegulationCabin({ onComplete }: Pick<Props, "onComplete">) {
  return <div className="u02-console regulation-console"><div className="cabin-rings"><i /><i /><i /></div><TimedMethodExperience actionKey="methodsCompleted" evidenceKey="regulationTop" methods={["深呼吸", "认知重评", "积极暗示", "运动释放", "情绪日记"]} minimum={5} onComplete={onComplete} seconds={10} /></div>;
}

function TeamRole({ onComplete }: Pick<Props, "onComplete">) {
  const roles = [{ name: "组长", detail: "协调目标", Icon: Crown }, { name: "创意", detail: "提出创意", Icon: Palette }, { name: "执行", detail: "推进落实", Icon: Rocket }, { name: "沟通", detail: "连接成员", Icon: MessagesSquare }, { name: "质检", detail: "检查质量", Icon: ScanSearch }]; const [role, setRole] = useState(""); const [choice, setChoice] = useState<number | null>(null); const [viewed, setViewed] = useState<string[]>([]);
  return <div className="u02-console team-role-console"><p className="shared-device"><Users />共享设备模式 · 讨论后由组长提交</p><div className="role-badges">{roles.map(({ name, detail, Icon }, index) => <button className={role === name ? "active" : ""} key={name} onClick={() => { setRole(name); setViewed((items) => items.includes(name) ? items : [...items, name]); }} style={{ "--i": index } as React.CSSProperties}><span><Icon aria-hidden="true" /></span><b>{name}</b><small>{detail}</small></button>)}</div>{role && <><h2>两位同学都想担任同一角色，你会怎么做？</h2><ChoiceButtons items={["谁声音大听谁的", "各自说明优势并协商分工", "干脆都不担任", "让组长直接指定且不解释"]} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" onClick={() => onComplete({ summary: { roleClaimed: true, teamRole: role, conflictApproach: ["compete", "negotiate", "withdraw", "assign"][choice], badgesViewed: viewed.length } })}>确认团队角色<Check /></button>}</>}</div>;
}

function TeamCommunication({ onComplete }: Pick<Props, "onComplete">) {
  const [temperature, setTemperature] = useState(50); const [notes, setNotes] = useState(""); const [choice, setChoice] = useState<number | null>(null);
  return <div className="u02-console communication-console"><p className="shared-device"><Users />共享设备讨论 · 不记录“谁没发言”等个体负面标签</p><div className="communication-meter"><span>回避</span><input max={100} min={0} onChange={(event) => setTemperature(Number(event.target.value))} type="range" value={temperature} /><span>过热</span><strong>{temperature < 35 ? "需要邀请更多观点" : temperature > 75 ? "先降温再聚焦" : "温度适中，可以推进"}</strong></div><label>共享讨论纪要<textarea maxLength={180} onChange={(event) => setNotes(event.target.value)} placeholder="我们已经达成的共识、仍需确认的问题……" value={notes} /></label><ChoiceButtons items={["立即投票，少数服从多数", "组长直接决定", "先邀请不同观点，再确定标准", "限定时间讨论后按共同标准决策"]} onChange={setChoice} value={choice} />{choice !== null && <button className="primary-button" disabled={notes.trim().length < 10} onClick={() => onComplete({ summary: { communicationPlanSubmitted: true, temperature, approach: ["vote", "leader", "invite", "criteria"][choice], contentLength: notes.length, contentRef: "attempt-private-content" }, privateContent: { teamNotes: notes } })}>提交沟通方案<Check /></button>}</div>;
}

function TeamShowcase({ onComplete }: Pick<Props, "onComplete">) {
  const options = { selling: ["高山日照充足", "当天采摘发货", "种植数据可追溯"], theme: ["田野清新", "科技可信", "丰收温暖"], line: ["看得见的新鲜", "每一口都有来源", "把高山阳光带回家"] } as const;
  const [selling, setSelling] = useState(""); const [theme, setTheme] = useState(""); const [line, setLine] = useState(""); const [submitted, setSubmitted] = useState(false);
  return <div className="u02-console showcase-console"><div className={`dynamic-poster theme-${options.theme.indexOf(theme as never)}`}><Image alt="高山番茄产品展示" height={230} src="/assets/global/props/tomato-display-v001.png" width={360} /><span>团队智慧农产品方案</span><h2>{line || "选择一句展示话术"}</h2><p>{selling || "选择一个真实产品卖点"}</p><b>{theme || "视觉主题待确定"}</b></div><section>{!submitted ? <>{Object.entries(options).map(([key, values]) => <div key={key}><span>{({ selling: "产品卖点", theme: "视觉主题", line: "展示话术" } as Record<string, string>)[key]}</span><div className="tag-row">{values.map((value) => <button className={({ selling, theme, line } as Record<string, string>)[key] === value ? "active" : ""} key={value} onClick={() => ({ selling: setSelling, theme: setTheme, line: setLine } as Record<string, (value: string) => void>)[key](value)}>{value}</button>)}</div></div>)}<p className="shared-device"><Users />组长提交后，系统使用固定安全模板模拟鲜花、点赞和建设性反馈。</p><button className="primary-button" disabled={!selling || !theme || !line} onClick={() => setSubmitted(true)}>组长提交成果<Sparkles /></button></> : <div className="showcase-feedback"><span className="feedback-flowers">✿ ✿ ✿ <b>18 个赞</b></span><h2>展示反馈已汇总</h2><p>卖点具体、来源清楚。下一轮可以让话术更突出受众需求。</p><div className="team-radar" aria-label="团队五维雷达">{[["目标", 88], ["创意", 84], ["执行", 91], ["沟通", 86], ["质量", 90]].map(([label, value]) => <div key={label}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>)}</div><button className="primary-button" onClick={() => onComplete({ summary: { showcaseSubmitted: true, completeness: 3, peerFeedback: "flower-like-constructive", teamScore: 88, contentLength: selling.length + theme.length + line.length, contentRef: "attempt-private-content" }, privateContent: { showcase: [selling, theme, line] } })}>确认反馈并保存<Check /></button></div>}</section></div>;
}

function GrowthTree({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const count = evidence.completedInteractionIds?.filter((id) => id.startsWith("u02-") && !id.includes("completion")).length ?? 0;
  const leaves = Array.from({ length: Math.max(8, count * 2) });
  return <div className="u02-console growth-tree-console"><div className="data-tree"><svg aria-label="由学习数据生成的成长树" viewBox="0 0 520 430"><path className="roots" d="M260 370 C190 390 140 410 70 418 M260 370 C330 390 385 405 455 414 M260 370 C235 402 220 420 195 426" /><path className="trunk" d="M250 374 C246 320 265 265 252 205 C243 160 260 112 270 55 M255 245 C210 210 172 175 135 130 M258 225 C306 197 350 155 380 115" />{leaves.map((_, index) => { const angle = index * 2.399; const radius = 45 + (index % 5) * 25; const x = 260 + Math.cos(angle) * radius; const y = 170 + Math.sin(angle) * radius * .65; return <circle className="leaf" cx={x} cy={y} key={index} r={8 + index % 4} style={{ "--i": index } as React.CSSProperties} />; })}</svg><div className="strategy-fruits">{["识别情绪", "表达需要", "调节能量", "协作沟通"].map((item, index) => <span className={count > index * 3 ? "grown" : ""} key={item}>{item}</span>)}</div></div><section><span>第二单元成长证据</span><h2>{count >= 14 ? "枝叶舒展，策略正在结果" : "每次练习都会长出新的枝叶"}</h2><p>已形成 {count} 项学习证据。树的形态来自完成记录和策略覆盖，不代表心理健康等级。</p><div className="growth-source"><b>心理韧性</b><span>基线 50 → 当前值由统一数据层计算</span><small>来源：simulation</small></div><button className="primary-button" onClick={() => onComplete({ summary: { growthTreeViewed: true, evidenceCount: count, badgeId: "u02-mind-growth", strategyCoverage: Math.min(5, Math.floor(count / 3)) } })}>领取心灵成长徽章<Sparkles /></button></section></div>;
}

function TreeholeWrite({ onComplete }: Pick<Props, "onComplete">) {
  const topics = ["任务压力", "沟通误会", "对失败的担心", "暂时说不清"]; const [topic, setTopic] = useState(""); const [text, setText] = useState(""); const [flying, setFlying] = useState(false);
  const submit = (skip = false) => { setFlying(true); window.setTimeout(() => onComplete({ summary: { concernProcessed: true, participated: !skip, broadTopic: skip ? "skip" : topic || "self-described", contentLength: skip ? 0 : text.length, contentRef: "attempt-private-content", mode: skip ? "skip" : "text" }, privateContent: skip ? undefined : { concern: text, topic } }), 700); };
  return <div className="u02-console treehole-write"><div className={`paper-plane ${flying ? "flying" : ""}`}><i /><span>只对自己可见</span></div><h2>你可以选一个词，也可以写一小段</h2><div className="tag-row">{topics.map((item) => <button className={topic === item ? "active" : ""} key={item} onClick={() => setTopic(item)}>{item}</button>)}</div><textarea maxLength={240} onChange={(event) => setText(event.target.value)} placeholder="愿意写多少都可以；这里不要求解释全部。" value={text} /><p className="privacy-note"><LockKeyhole />原文不会进入教师看板。需要帮助时，请联系你信任的老师、家长或学校心理支持渠道。</p><div><button className="secondary-button" disabled={flying} onClick={() => submit(true)}>现在暂时不说</button><button className="primary-button" disabled={flying || (!topic && text.trim().length < 2)} onClick={() => submit(false)}>折成纸飞机送出<ChevronRight /></button></div></div>;
}

function TreeholeRespond({ onComplete }: Pick<Props, "onComplete">) {
  const [note, setNote] = useState(0); const [response, setResponse] = useState(""); const notes = ["我第一次做直播时很紧张，总怕说错。", "小组讨论时，我的想法没有被听见。", "设备报警后，我一下子不知道先做什么。"];
  return <div className="u02-console treehole-respond"><div className="anonymous-note"><small>经过审核的匿名教学示例 {note + 1}/3</small><p>{notes[note]}</p><button onClick={() => setNote((value) => (value + 1) % notes.length)}>换一封</button></div><h2>选择一种不评判的回应</h2><div className="warmth-options">{[["陪伴", "我愿意听你慢慢说。"], ["肯定", "你已经在尝试面对它了。"], ["资源", "可以一起找老师或队友商量。"], ["静静陪伴", "先不急着给建议，我在这里。"]].map(([type, copy]) => <button className={response === type ? "active" : ""} key={type} onClick={() => setResponse(type)}><b>{type}</b><span>{copy}</span></button>)}</div><button className="primary-button" disabled={!response} onClick={() => onComplete({ summary: { warmthSent: true, responseType: response, noteIndex: note } })}>送出温暖纸飞机<MessageCircleHeart /></button></div>;
}

function TreeholeReceive({ onComplete }: Pick<Props, "onComplete">) {
  const letters = ["你不需要一次把所有事处理好，先完成最小的一步。", "紧张说明你在乎，准备一句开场话会让身体更安心。", "愿意求助和愿意独立一样，都是解决问题的能力。"]; const [opened, setOpened] = useState<number[]>([]);
  return <div className="u02-console receive-console"><div className="letter-garden">{letters.map((letter, index) => <button className={opened.includes(index) ? "opened" : ""} key={letter} onClick={() => setOpened((items) => items.includes(index) ? items : [...items, index])}>{opened.includes(index) ? <><Sprout /><p>{letter}</p></> : <><MessageCircleHeart /><b>温暖回信 {index + 1}</b></>}</button>)}</div><div className="flower-count">{"✿".repeat(opened.length)}<span>{opened.length === 3 ? "温暖花束已经组成" : "每打开一封，花束会多一朵花"}</span></div><button className="primary-button" disabled={opened.length < 1} onClick={() => onComplete({ summary: { warmthReceived: true, lettersOpened: opened.length, bouquetCompleted: opened.length === 3 } })}>把温暖收好<Check /></button></div>;
}

function EnergyCollect({ onComplete }: Pick<Props, "onComplete">) {
  const methods = ["腹式呼吸", "5-4-3-2-1 着陆", "认知重评", "积极暗示", "向同伴求助", "拆分问题", "散步舒展", "节奏运动", "情绪日记", "暂停十秒", "听舒缓声音", "列出可控事项"];
  return <div className="u02-console energy-collect"><Image alt="三槽策略收纳箱" height={210} src="/assets/global/props/strategy-case-v001.png" width={260} /><TimedMethodExperience actionKey="topStrategiesSelected" evidenceKey="energyTop" methods={methods} minimum={3} onComplete={onComplete} seconds={15} /></div>;
}

function EmergencyCard({ evidence, onComplete }: Pick<Props, "evidence" | "onComplete">) {
  const previous = evidence.latestByInteraction?.["u02-energy-01-collect"]?.preferred; const strategies = typeof previous === "string" ? previous.split("|") : ["腹式呼吸", "向同伴求助", "拆分问题"];
  const [trigger, setTrigger] = useState(""); const [signal, setSignal] = useState("");
  return <div className="u02-console emergency-card-console"><div className="emergency-card"><span>我的情绪急救卡</span><label>容易触发我的场景<input maxLength={60} onChange={(e) => setTrigger(e.target.value)} value={trigger} /></label><label>我最早能察觉的信号<input maxLength={60} onChange={(e) => setSignal(e.target.value)} value={signal} /></label><div><small>我的 TOP3</small>{strategies.slice(0, 3).map((item, index) => <b key={item}>{index + 1}. {item}</b>)}</div><footer>先照顾自己，再处理问题；需要时向可信任的人求助。</footer></div><p className="privacy-note"><LockKeyhole />触发场景和身体信号只保存到个人私密内容，教师端仅看到“已完成”。</p><button className="primary-button" disabled={trigger.trim().length < 3 || signal.trim().length < 3} onClick={() => onComplete({ summary: { emergencyCardCreated: true, strategyCount: strategies.slice(0, 3).length, contentLength: trigger.length + signal.length, contentRef: "attempt-private-content" }, privateContent: { trigger, earlySignal: signal, strategies: strategies.slice(0, 3) } })}>生成可打印急救卡<Check /></button></div>;
}

function StrategyPractice({ onComplete }: Pick<Props, "onComplete">) {
  const steps = [{ title: "识别", question: "设备连续报警、负责人催问时，你最接近哪种感受？", choices: ["焦虑", "开心", "无聊"], answer: 0 }, { title: "选择", question: "先用哪个策略为行动腾出空间？", choices: ["暂停呼吸并列出优先级", "假装没看到", "立刻责怪队友"], answer: 0 }, { title: "执行", question: "第一句行动指令是什么？", choices: ["先启用应急通风，同时同步进度", "大家随便做点什么", "等问题自己恢复"], answer: 0 }];
  const [step, setStep] = useState(0); const [retries, setRetries] = useState(0); const [feedback, setFeedback] = useState("");
  const choose = (index: number) => { if (index !== steps[step].answer) { setRetries((value) => value + 1); setFeedback("再找一个既能稳定自己、又能推进问题的选项。"); return; } setFeedback("这一步已经让可控范围变大。"); window.setTimeout(() => { setFeedback(""); if (step < 2) setStep((value) => value + 1); else onComplete({ summary: { practiceCompleted: true, stepsCompleted: 3, retries, recoveryValue: 100 } }); }, 500); };
  return <div className="u02-console practice-console"><div className="recovery-meter"><i style={{ width: `${step / 3 * 100}%` }} /><span>场景能量恢复 {Math.round(step / 3 * 100)}%</span></div><div className="practice-steps">{steps.map((item, index) => <span className={index < step ? "done" : index === step ? "active" : ""} key={item.title}>{index < step ? <Check /> : index + 1}{item.title}</span>)}</div><h2>{steps[step].question}</h2>{steps[step].choices.map((choice, index) => <button className="practice-choice" key={choice} onClick={() => choose(index)}>{choice}<ChevronRight /></button>)}{feedback && <p className="safe-feedback">{feedback}</p>}</div>;
}

export function UnitTwoOperation(props: Props) {
  const common = { onComplete: props.onComplete };
  switch (props.interaction.type) {
    case "mirror-activation": return <MirrorActivation evidence={props.evidence} {...common} />;
    case "growth-scroll": return <GrowthScroll {...common} />;
    case "swot-compass": return <SwotCompass {...common} />;
    case "live-crisis": return <LiveCrisis {...common} />;
    case "emotion-dial": return <EmotionDial {...common} />;
    case "coping-toolbox": return <CopingToolbox {...common} />;
    case "priority-crisis": return <PriorityCrisis {...common} />;
    case "rejection-branch": return <RejectionBranch evidence={props.evidence} {...common} />;
    case "expression-decoder": return <ExpressionDecoder {...common} />;
    case "emotion-translator": return <EmotionTranslator {...common} />;
    case "regulation-cabin": return <RegulationCabin {...common} />;
    case "team-role-claim": return <TeamRole {...common} />;
    case "team-communication": return <TeamCommunication {...common} />;
    case "team-showcase": return <TeamShowcase {...common} />;
    case "growth-tree": return <GrowthTree evidence={props.evidence} {...common} />;
    case "treehole-write": return <TreeholeWrite {...common} />;
    case "treehole-respond": return <TreeholeRespond {...common} />;
    case "treehole-receive": return <TreeholeReceive {...common} />;
    case "energy-collect": return <EnergyCollect {...common} />;
    case "emergency-card": return <EmergencyCard evidence={props.evidence} {...common} />;
    case "strategy-practice": return <StrategyPractice {...common} />;
    default: return <div className="u02-console"><p>互动配置不可用。</p></div>;
  }
}
