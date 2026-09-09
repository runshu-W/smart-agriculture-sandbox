"use client";
import { useFrameworkSound } from "@/components/framework-sound";
import Image from "next/image";
import { Check, CheckCircle2, ArrowRight, Layers3 } from "lucide-react";
import { useRef, useState } from "react";
import { FRAMEWORK_EVENTS, FRAMEWORK_LAYERS, type FrameworkEvent, type FrameworkLayer, type FrameworkProgress, type FrameworkStats } from "@/lib/classroom-framework";
import type { LessonSnapshot } from "@/lib/classroom";

const FEEDBACK = { ai: "这是技术迭代引发的时代变化，先把视野放到更大的环境。", farmer: "这是直播业态变化带来的合作关系与服务责任调整。", hesitation: "这是角色面对变化时的情绪调适，需要向内觉察与调整。" };
export function ClassroomFramework({ data, view, connected, onSaved }: { data: LessonSnapshot; view: "student" | "teacher" | "screen"; connected: boolean; onSaved: () => Promise<void> }) {
  const feedbackSound = useFrameworkSound();
  const [event, setEvent] = useState<FrameworkEvent>("ai");
  const [layer, setLayer] = useState<FrameworkLayer | null>(null);
  const [local, setLocal] = useState<FrameworkProgress>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<{ attemptId: string; event: FrameworkEvent; layer: FrameworkLayer } | null>(null);
  const progress: FrameworkProgress = {};
  for (const item of FRAMEWORK_EVENTS) {
    const server = data.ownFramework?.[item.id], optimistic = local[item.id];
    const answer = (optimistic?.attempts ?? 0) > (server?.attempts ?? 0) ? optimistic : server;
    if (answer) progress[item.id] = answer;
  }
  const current = FRAMEWORK_EVENTS.find(item => item.id === event)!;
  const answer = progress[event];
  const solved = FRAMEWORK_EVENTS.filter(item => progress[item.id]?.solved);
  const complete = solved.length === 3;
  const active = data.stage === 3 && data.status === "RUNNING" && connected && data.ownJoined;
  const canAnswer = view === "student" && active && !answer?.solved && !pending;
  const selected = layer ?? answer?.lastLayer ?? null;
  const selectedLayer = FRAMEWORK_LAYERS.find(item => item.id === selected);
  function chooseEvent(value: FrameworkEvent) { if (pending) return; setEvent(value); setLayer(null); setError(""); }
  async function submit() {
    if (!selected || !canAnswer) return;
    if (request.current?.event !== event || request.current?.layer !== selected) request.current = { attemptId: crypto.randomUUID(), event, layer: selected };
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/classroom/${data.id}/framework`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request.current), signal: AbortSignal.timeout(10000) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setLocal(result.progress); request.current = null;
      if (!result.duplicate) feedbackSound.play(!!result.progress[event]?.solved);
      await onSaved().catch(() => {});
    } catch (reason) { setError(reason instanceof Error ? reason.message : "提交未确认，请重试"); void onSaved().catch(() => {}); }
    finally { setPending(false); }
  }
  return <section className={`framework-room ${complete ? "framework-complete" : ""} ${data.status === "PAUSED" ? "framework-paused" : ""}`} aria-label="三层变化识别互动">
    <div className="framework-heading"><div><span>看见变化来自哪里</span><h3>从一件事，看见三个层次</h3><p>{view === "student" ? "选一件沙盘事件，点击对应圆环，再确认你的映射。" : "从时代、行业到自身，带领全班辨认变化的来源。点击圆环可查看层级说明。"}</p></div><div className="framework-progress"><Layers3 size={19} /><b data-testid="framework-progress">{view === "student" ? `${solved.length} / 3` : `${data.frameworkStats?.completed ?? 0} / ${data.frameworkStats?.total ?? 0}`}</b><span>{view === "student" ? "已正确映射" : "三题全对 / 参与人数"}</span></div></div>
    {view === "student" && <div className="countdown-sound"><button className="classroom-secondary" aria-pressed={feedbackSound.enabled} onClick={() => void feedbackSound.toggle()}>{feedbackSound.enabled ? "关闭映射反馈音" : "开启映射反馈音"}</button>{feedbackSound.error && <small role="status">{feedbackSound.error}</small>}</div>}
    <div className="framework-workspace">
      <div className="framework-model"><ConcentricFramework selected={selected} solvedLayers={solved.map(item => progress[item.id]!.lastLayer)} disabled={view === "student" && !canAnswer} onSelect={setLayer} /><div className="framework-layer-detail" aria-live="polite">{selectedLayer ? <><strong style={{ color: selectedLayer.color }}>{selectedLayer.position} · {selectedLayer.name}</strong><p>{selectedLayer.examples}</p><small>{selectedLayer.direction}</small></> : <><strong>由外向内，逐层辨认</strong><p>宏观环境 → 微观环境 → 自身条件</p><small>圆环支持点击、触屏和键盘选择</small></>}</div></div>
      {view === "student" ? <div className="framework-task"><div className="framework-task-heading"><span>沙盘事件 · 依次探索</span><small>允许重试，不限次数</small></div><div className="framework-event-list" role="group" aria-label="选择映射事件">{FRAMEWORK_EVENTS.map((item, index) => <button key={item.id} className={`${item.id === event ? "selected" : ""} ${progress[item.id]?.solved ? "solved" : ""}`} aria-pressed={item.id === event} disabled={pending} onClick={() => chooseEvent(item.id)}><span>{progress[item.id]?.solved ? <Check size={17} /> : `0${index + 1}`}</span><div><strong>{item.title}</strong><small>{progress[item.id]?.solved ? "映射正确" : progress[item.id] ? "再试一次" : "等待映射"}</small></div><ArrowRight size={16} /></button>)}</div><div className="framework-active-event"><span>当前事件</span><h4>{current.title}</h4><p>{current.description}</p><div className="framework-selected-layer">{selectedLayer ? <>你的映射：<b style={{ color: selectedLayer.color }}>{selectedLayer.name}</b></> : "请点击左侧或上方的对应圆环"}</div>
        {answer && <div key={`${event}-${answer.attempts}`} className={`framework-feedback ${answer.solved ? "correct" : "retry"}`} role="status">{answer.solved ? <><CheckCircle2 size={20} /><div><strong>映射正确</strong><p>{FEEDBACK[event]}</p></div></> : <><span>↻</span><div><strong>再想想</strong><p>变化首先发生在哪里：时代与技术、行业与合作关系，还是角色自身？</p></div></>}</div>}
        {!answer?.solved ? <button className="classroom-primary framework-submit" disabled={!canAnswer || !selected} onClick={() => void submit()}>{pending ? "正在确认…" : "确认映射"}</button> : !complete ? <button className="classroom-secondary framework-submit" disabled={pending} onClick={() => chooseEvent(FRAMEWORK_EVENTS.find(item => !progress[item.id]?.solved)!.id)}>继续下一事件<ArrowRight size={16} /></button> : null}
        {!active && <p className="framework-status" role="status">{!data.ownJoined ? "请先加入本次课堂。" : !connected ? "正在恢复连接，请稍后提交。" : data.status === "PAUSED" ? "课堂已暂停，已有结果会保留。" : "本阶段已收束，你可以回看自己的映射记录。"}</p>}
        {error && <p className="classroom-error" role="alert">{error}；已收到的结果会保留。</p>}
      </div></div> : data.frameworkStats && <FrameworkStatistics stats={data.frameworkStats} />}
    </div>
    <div className={`framework-mentor ${complete ? "celebrate" : ""}`} data-testid="framework-mentor"><Image src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={78} height={83} /><div><span>{complete && view === "student" ? "三题全对 · 框架已点亮" : "农小智 · 变化识别提示"}</span><h4>{complete || view !== "student" ? "向外读懂时代，中间看清行业，向内认清自我" : "先找到变化的来源，再决定怎样应对"}</h4><p>{complete ? "你已把三件事件放进对应层级。带着这个框架，继续观察下一次变化。" : "同一件事可能带来多层影响；这次先辨认每件沙盘事件最直接对应的变化。"}</p></div>{complete && <CheckCircle2 size={30} />}</div>
  </section>;
}

function ConcentricFramework({ selected, solvedLayers, disabled, onSelect }: { selected: FrameworkLayer | null; solvedLayers: FrameworkLayer[]; disabled: boolean; onSelect: (layer: FrameworkLayer) => void }) {
  return <svg className="framework-rings" viewBox="0 0 520 520" aria-label="三层同心圆：宏观环境、微观环境、自身条件">{FRAMEWORK_LAYERS.map((layer, index) => {
    const done = solvedLayers.includes(layer.id), chosen = selected === layer.id;
    const radius = [244, 170, 94][index], titleY = [56, 138, 250][index];
    return <g key={layer.id} className={`framework-ring ring-${layer.id} ${chosen ? "chosen" : ""} ${done ? "correct" : ""}`} role="button" tabIndex={disabled ? -1 : 0} aria-label={`映射到${layer.name}`} aria-pressed={chosen} aria-disabled={disabled} onClick={() => { if (!disabled) onSelect(layer.id); }} onKeyDown={event => { if (!disabled && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(layer.id); } }}>
      <circle cx="260" cy="260" r={radius} fill={["#E7F1FA", "#E5F2E9", "#FFF0DE"][index]} stroke={done ? "#279466" : layer.color} strokeWidth={chosen || done ? 4 : 1.5} />
      <text x="260" y={titleY} textAnchor="middle" fill={layer.color} className="framework-ring-title">{done ? "✓ " : ""}{layer.name}</text>
      <text x="260" y={titleY + 24} textAnchor="middle" fill={layer.color} className="framework-ring-caption">{layer.position} · {layer.direction}</text>
      {chosen && <text x="260" y={index === 2 ? 298 : 260 + radius - 20} textAnchor="middle" fill={layer.color} className="framework-ring-selected">{done ? "已正确映射" : "已选中"}</text>}
    </g>;
  })}</svg>;
}

function FrameworkStatistics({ stats }: { stats: FrameworkStats }) {
  return <section className="framework-statistics" aria-label="班级映射汇总"><div className="framework-task-heading"><span>全班理解情况</span><small>只展示汇总，不公开个人对错</small></div><div className="framework-stats-counts"><div><b data-testid="framework-attempted">{stats.attempted}<small> / {stats.total}</small></b><span>已尝试 / 已加入</span></div><div><b data-testid="framework-completed">{stats.completed}</b><span>三题全对</span></div><div><b>{stats.untouched}</b><span>尚未尝试</span></div></div>{stats.events.map((event, index) => <article key={event.id} data-testid={`framework-stat-${event.id}`}><div><h4><span>0{index + 1}</span>{FRAMEWORK_EVENTS[index].title}</h4><b>{event.masteryRate === null ? "暂无作答" : `${event.masteryRate}%`}</b></div><div className="framework-stat-track"><i style={{ width: `${event.masteryRate ?? 0}%` }} /></div><p>已答对 {event.solved} / 已尝试 {event.attempted} 人<span>尚未尝试 {event.pending} 人</span></p><small>首次正确率：{event.firstCorrectRate === null ? "暂无样本" : `${event.firstCorrectRate}%`}</small></article>)}<p className="framework-stat-note">掌握率按已尝试人数计算，答错后重试成功也算掌握。首次正确率保留初次理解情况；未尝试不算答错。</p></section>;
}
