"use client";
import { activityElapsed } from "@/lib/classroom-completion";
import { ClassroomMap } from "@/components/classroom-map";
import { ClassroomVote } from "@/components/classroom-vote";
import { useChangeMapDraft } from "@/components/change-map-draft";
import { ClassroomSummary } from "@/components/classroom-summary";
import { ClassroomFramework } from "@/components/classroom-framework";
import { ClassroomPaths } from "@/components/classroom-paths";
import { ClassroomDecision, DecisionReceipt, DecisionDistribution } from "@/components/classroom-decision";
import { ClassroomImpact } from "@/components/classroom-impact";
import { useImpactObservations } from "@/components/impact-observations";
import { impactTime } from "@/lib/classroom-impact";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Expand, LockKeyhole, MonitorPlay, Pause, Play, Radio, RotateCcw, Square, UsersRound, Wifi, WifiOff } from "lucide-react";
import { CLASSROOM_STAGES, LESSON_STATUS_LABEL, clockText, remainingTime, type LessonCommand, type LessonSnapshot } from "@/lib/classroom";
type View = "teacher" | "student" | "screen";

function useClassroom(initial: LessonSnapshot, view: View) {
  const [data, setData] = useState(initial);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(initial.serverNow);
  const [accessError, setAccessError] = useState("");
  const offset = useRef(0);
  const lastMessage = useRef(0);
  const apply = useCallback((snapshot: LessonSnapshot) => {
    offset.current = snapshot.serverNow - Date.now(); lastMessage.current = Date.now();
    setData(previous => snapshot.version >= previous.version ? snapshot : previous);
    setConnected(true); setAccessError("");
  }, []);
  const refresh = useCallback(async () => {
    const response = await fetch(`/api/classroom/${initial.id}?view=${view}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const value = await response.json();
    if (!response.ok) { if (response.status === 403 || response.status === 404) setAccessError(value.error); throw new Error(value.error); }
    apply(value);
  }, [initial.id, view, apply]);
  useEffect(() => {
    let stopped = false;
    offset.current = initial.serverNow - Date.now();
    const stream = new EventSource(`/api/classroom/${initial.id}/stream?view=${view}`);
    stream.onmessage = event => { if (!stopped) { try { apply(JSON.parse(event.data)); } catch { setConnected(false); } } };
    stream.onerror = () => { if (!stopped) { setConnected(false); void refresh().catch(() => {}); } };
    const offline = () => setConnected(false);
    const online = () => { void refresh().catch(() => {}); };
    window.addEventListener("offline", offline); window.addEventListener("online", online);
    const timer = setInterval(() => {
      setNow(Date.now() + offset.current);
      if (Date.now() - lastMessage.current > 5000) setConnected(false);
    }, 250);
    return () => { stopped = true; stream.close(); clearInterval(timer); window.removeEventListener("offline", offline); window.removeEventListener("online", online); };
  }, [initial.id, initial.serverNow, view, apply, refresh]);
  useEffect(() => {
    if (view !== "student" || !data.ownJoined || data.status === "ENDED") return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const heartbeat = async () => {
      try {
        const response = await fetch(`/api/classroom/${initial.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "presence" }), signal: AbortSignal.timeout(6000) });
        if (!response.ok && !stopped) setConnected(false);
      } catch { if (!stopped) setConnected(false); }
      if (!stopped) timer = setTimeout(heartbeat, 8000);
    };
    void heartbeat();
    return () => { stopped = true; clearTimeout(timer); };
  }, [initial.id, view, data.ownJoined, data.status]);
  return { data, connected, now, refresh, accessError };
}

type Confirmation = { command: LessonCommand; version: number; title: string; detail: string };
export function ClassroomRoom({ initial, view }: { initial: LessonSnapshot; view: View }) {
  const { data, connected, now, refresh, accessError } = useClassroom(initial, view);
  const mapDraft = useChangeMapDraft(data.id, view === "student" ? data.ownSessionId : undefined, data.completion.ownMap, connected, data.stage === 4 && data.status === "RUNNING" && !data.completion.map.closedAt && activityElapsed(data.completion.map, now) < 600000);
  const impactTracking = useImpactObservations(data.id, view === "student" ? data.ownSessionId : undefined, data.stage === 0 && data.status === "RUNNING" && connected && data.ownJoined && data.impact.startedAt !== null && data.impactClosedAt === null, impactTime(data.impact, now), data.impactClosedAt, data.ownImpactSynced);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [filter, setFilter] = useState("");
  const [reviewSummary, setReviewSummary] = useState(false);
  const [reviewDecision, setReviewDecision] = useState(false);
  const [reviewFramework, setReviewFramework] = useState(false);
  const remaining = remainingTime(data, now);
  const disabled = pending || !connected || !!accessError || data.status === "ENDED";
  async function send(command: LessonCommand | { action: "join" | "ready" }, version = data.version) {
    if (disabled) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/classroom/${data.id}`, { method: view === "teacher" ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...command, version }), signal: AbortSignal.timeout(10_000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "操作未确认，请检查最新状态后重试"); void refresh().catch(() => {}); }
    finally { setPending(false); setConfirmation(null); }
  }
  const decisionWarning = data.decision.startedAt && !data.decision.closedAt ? " 本次决策将立即收束，尚未提交的学生记为未作答。" : "";
  const confirmStage = (index: number) => setConfirmation({ command: { action: "stage", stage: index }, version: data.version, title: `切换到「${CLASSROOM_STAGES[index].title}」？`, detail: `全班和大屏将同步切换，并重新计算该阶段时间。已有记录会保留。${decisionWarning}` });
  return <main className={`classroom-room classroom-${view} classroom-stage-${data.stage}`}>
    <header className="classroom-room-header"><div>{view !== "screen" && <Link className="classroom-back" href={`/${view}/classroom`} aria-label="返回课堂列表"><ArrowLeft size={19} /></Link>}<div><span className="classroom-eyebrow">第五单元 · 面对行业变化</span><h1>{view === "teacher" ? "课堂控制台" : data.className}</h1></div></div><div className="classroom-header-tools"><span className="classroom-tag">{data.rehearsal ? "演练课堂" : "正式课堂"}</span><span role="status" className={`classroom-connection ${connected ? "connected" : ""}`}>{connected ? <Wifi size={15} /> : <WifiOff size={15} />}{connected ? "同步正常" : "重新连接中"}</span>{view === "teacher" && <a className="classroom-secondary" href={`/classroom/${data.id}/screen`} target="_blank" rel="noopener noreferrer"><MonitorPlay size={17} />打开大屏</a>}{view === "screen" && <button className="classroom-fullscreen" aria-label="切换全屏" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => setError("请使用浏览器全屏功能")); }}><Expand /></button>}</div></header>
    {(!connected || accessError) && <div className="classroom-notice" role="alert">{accessError || "连接暂时中断，正在恢复。页面保留上次状态，恢复后会自动跟随老师。"}</div>}
    {error && <div className="classroom-error" role="alert">{error}</div>}
    <div className="classroom-stage-track" aria-label="课堂六阶段">{CLASSROOM_STAGES.map((item, index) => {
      const current = index === data.stage;
      return <button key={item.key} className={`${current ? "current" : ""} ${index < data.stage ? "past" : ""}`} disabled={view !== "teacher" || disabled || data.status === "WAITING" || current} onClick={() => confirmStage(index)} aria-current={current ? "step" : undefined}><span>{index < data.stage ? <Check size={15} /> : `0${index + 1}`}</span><b>{item.title}</b>{view !== "teacher" && index > data.stage && <LockKeyhole size={13} />}</button>;
    })}</div>
    <div className="classroom-body">
      <section className="classroom-stage-panel" aria-label="当前课堂阶段">
        {data.stage === 0 ? <><div className="impact-class-heading"><div><span className={`classroom-status status-${data.status.toLowerCase()}`}><i />{LESSON_STATUS_LABEL[data.status]}</span><h2 data-testid="current-stage">行业冲击</h2></div><div><b data-testid="lesson-clock">{clockText(remaining)}</b><small>{data.status === "PAUSED" ? "课堂已暂停" : remaining === 0 ? "时间已到，等待老师推进" : "本阶段剩余时间"}</small></div></div>{data.impactResultsVisible && view !== "student" ? <ClassroomSummary lessonId={data.id} view={view} /> : <ClassroomImpact data={data} now={now} view={view} connected={connected} tracking={impactTracking} />}</> : data.stage === 1 ? <><div className="impact-class-heading"><div><span className="classroom-status"><i />{LESSON_STATUS_LABEL[data.status]}</span><h2 data-testid="current-stage">路径参考</h2></div><div><b data-testid="lesson-clock">{clockText(remaining)}</b><small>本阶段剩余时间</small></div></div><ClassroomPaths data={data} view={view} connected={connected} onSaved={refresh} /></> : data.stage === 2 ? <><div className="impact-class-heading"><div><span className="classroom-status"><i />{LESSON_STATUS_LABEL[data.status]}</span><h2 data-testid="current-stage">角色决策</h2></div><div><b data-testid="lesson-clock">{clockText(remaining)}</b><small>本阶段剩余时间 · 决策独立计时</small></div></div><ClassroomDecision key={data.id} data={data} now={now} view={view} connected={connected} onSaved={refresh} /></> : data.stage === 3 ? <><div className="impact-class-heading"><div><span className="classroom-status"><i />{LESSON_STATUS_LABEL[data.status]}</span><h2 data-testid="current-stage">三层变化识别</h2></div><div><b data-testid="lesson-clock">{clockText(remaining)}</b><small>本阶段剩余时间</small></div></div><ClassroomFramework key={data.id} data={data} view={view} connected={connected} onSaved={refresh} /></> : <><div className="impact-class-heading"><div><span className="classroom-status"><i />{LESSON_STATUS_LABEL[data.status]}</span><h2 data-testid="current-stage">{CLASSROOM_STAGES[data.stage].title}</h2></div><div><b data-testid="lesson-clock">{clockText(remaining)}</b><small>本阶段剩余时间 · 活动独立计时</small></div></div>{data.stage === 4 ? <ClassroomMap data={data} now={now} view={view} connected={connected} draft={mapDraft} onSaved={refresh} /> : <ClassroomVote data={data} now={now} view={view} connected={connected} onSaved={refresh} />}</>}
        {view === "student" && data.status !== "ENDED" && <div className="classroom-student-actions">{!data.ownJoined ? <button className="classroom-primary" disabled={disabled} onClick={() => void send({ action: "join" })}><UsersRound size={18} />加入本次课堂</button> : <button className={`classroom-primary ${data.ownReady ? "ready" : ""}`} disabled={disabled || data.ownReady} onClick={() => void send({ action: "ready" })}><CheckCircle2 size={18} />{data.ownReady ? "已准备好，等待老师安排" : "我准备好了"}</button>}<span>{data.ownJoined ? "你已加入课堂，刷新后会恢复当前进度。" : "加入后，老师就能看到你的到场状态。"}</span></div>}
      </section>
      {view === "teacher" ? <aside className="classroom-control-panel"><div className="classroom-panel-heading"><h2>授课节奏</h2><span>{data.className}</span></div><p>老师控制阶段，学生端自动跟随。</p><div className="classroom-controls">
        {data.status === "WAITING" && <button className="classroom-primary" disabled={disabled} onClick={() => void send({ action: "start" })}><Play size={18} />开始课堂</button>}
        {data.status === "RUNNING" && <button className="classroom-primary" disabled={disabled} onClick={() => void send({ action: "pause" })}><Pause size={18} />暂停课堂</button>}
        {data.status === "PAUSED" && <button className="classroom-primary" disabled={disabled || !remaining} onClick={() => void send({ action: "resume" })}><Play size={18} />继续课堂</button>}
        {data.stage === 0 && <button className="impact-start-button" disabled={disabled || data.status !== "RUNNING" || data.impact.startedAt !== null} onClick={() => setConfirmation({ command: { action: "impact-start" }, version: data.version, title: "开始行业冲击？", detail: "新闻、人数骤降、来电和群聊将按顺序同步播放。请先提醒各设备开启声音；暂停课堂可暂停情境。" })}><Radio size={17} />{data.impact.startedAt === null ? "开始冲击" : "冲击已发起"}</button>}
        {data.stage === 2 && <button className="impact-start-button" disabled={disabled || data.status !== "RUNNING" || data.decision.startedAt !== null} onClick={() => setConfirmation({ command: { action: "decision-start" }, version: data.version, title: "发起 3 分钟角色决策？", detail: `目前 ${data.pathsReadyCount} / ${data.joined} 位到场学生已读完三条路径。发起后，全班共用 3 分钟；未读完的同学需先补读。到时未确认的记录为未作答。暂停课堂也会暂停决策。` })}>{data.decision.startedAt ? "本次决策已发起" : "发起3分钟决策"}</button>}
        {data.stage === 4 && <button className="impact-start-button" disabled={disabled || data.status !== "RUNNING" || data.completion.map.startedAt !== null} onClick={() => void send({ action: "map-start" })}>{data.completion.map.startedAt ? "变化地图已开始" : "开始变化地图 · 12分钟"}</button>}
        {data.stage === 5 && <button className="impact-start-button" disabled={disabled || data.status !== "RUNNING" || data.completion.vote.startedAt !== null} onClick={() => void send({ action: "vote-start" })}>{data.completion.vote.startedAt ? "投票已发起" : "发起10秒投票"}</button>}
        {data.stage === 5 && data.completion.vote.closedAt && !data.completion.signalsVisible && <button className="classroom-secondary" disabled={disabled || data.status !== "RUNNING"} onClick={() => void send({ action: "signals-show" })}>展示调整三信号</button>}
        {data.status === "ENDED" && <Link className="classroom-primary" href="/teacher/classroom">返回列表，新建课堂<ArrowRight size={18} /></Link>}
        {data.stage === 0 && data.impact.startedAt !== null && <button className="classroom-secondary" disabled={disabled || impactTime(data.impact, now) < 26000} onClick={() => data.impactResultsVisible ? void send({ action: "impact-scene" }) : setConfirmation({ command: { action: "impact-results" }, version: data.version, title: "结束观察并查看班级数据？", detail: "停止采集新的操作，通知学生补传记录。已上传的数据将用于课堂讨论，缺失记录会单独提示。" })}>{data.impactResultsVisible ? "返回情境回看" : "查看班级数据"}</button>}
        <button className="classroom-secondary" disabled={disabled || data.status === "WAITING" || data.stage === 5} onClick={() => confirmStage(data.stage + 1)}>下一阶段<ArrowRight size={18} /></button>
      </div><TimerEditor key={`${data.stage}-${data.durationMs}`} durationMs={data.durationMs} disabled={disabled} onReset={minutes => setConfirmation({ command: { action: "reset", minutes }, version: data.version, title: `将当前阶段重置为 ${minutes} 分钟？`, detail: "只重置本阶段计时，决策、变化地图和投票的独立计时及学习记录均保留。" })} />
        <div className="classroom-attendance-summary"><span>已到场<b data-testid="joined-count">{data.joined}<small>/{data.total}</small></b></span><span>当前在线<b data-testid="online-count">{data.online}</b></span><span>准备就绪<b data-testid="ready-count">{data.ready}</b></span></div><p className="classroom-small-note">离开或断线约 20 秒后显示离线；到场记录保留。</p>
        <button className="classroom-end" disabled={disabled} onClick={() => setConfirmation({ command: { action: "end" }, version: data.version, title: "结束本次课堂？", detail: `所有学生和大屏会显示课堂已结束。记录保留，本节课不能重新开启；演练请创建新课堂。${decisionWarning}` })}><Square size={15} />结束课堂</button>
      </aside> : <aside className="classroom-attendance-card"><UsersRound /><span>我们一起出发</span><strong>{data.joined}<small> / {data.total}</small></strong><p>位同学已到场</p><div><span>当前在线<b>{data.online}</b></span><span>准备就绪<b>{data.ready}</b></span></div><small>{data.teacherName} · {data.className}</small></aside>}
    </div>
    {view === "teacher" && <section className="classroom-roster"><div className="classroom-section-heading"><div><h2>学生到场情况</h2><span>名单仅教师可见，大屏只展示汇总</span></div><input aria-label="查找学生" placeholder="查找学生姓名" value={filter} onChange={event => setFilter(event.target.value)} /></div><div className="classroom-roster-grid">{data.roster?.filter(item => item.name.includes(filter)).map(item => <article key={item.id} className={item.online ? "is-online" : ""}><span>{item.name.slice(-2)}</span><div><b>{item.name}</b>{data.stage >= 1 && <small>路径已读 {item.pathsViewed.length} / 3</small>}<small>{!item.joined ? "尚未到场" : data.status === "ENDED" ? "已参加" : item.online ? "在线" : "已到场 · 暂时离线"}</small></div>{item.ready && <CheckCircle2 size={18} aria-label="准备就绪" />}</article>)}</div>{!data.roster?.length && <p>班级暂无有效学生，请先在班级管理中添加成员。</p>}</section>}
    {view === "student" && data.stage === 2 && data.ownPathsViewed.length < 3 && <div className="classroom-path-recap"><p className="classroom-notice">先补读三条参考路径，再参加后续决策。</p><ClassroomPaths data={data} view={view} connected={connected} onSaved={refresh} /></div>}
    {view === "teacher" && data.impactClosedAt !== null && (data.stage !== 0 || data.status === "ENDED") && <section className="classroom-summary-review"><button className="classroom-secondary" onClick={() => setReviewSummary(value => !value)}>{reviewSummary ? "收起观察汇总" : "查看本次观察汇总"}</button>{reviewSummary && <ClassroomSummary lessonId={data.id} view="teacher" />}</section>}
    {data.stage !== 2 && view === "student" && data.ownDecision?.reason && <DecisionReceipt key={data.id} data={data} />}
    {data.stage !== 2 && view === "teacher" && data.decision.closedAt && data.decisionStats && <section className="decision-review"><button className="classroom-secondary" onClick={() => setReviewDecision(value => !value)}>{reviewDecision ? "收起决策分布" : "查看本次决策分布"}</button>{reviewDecision && <DecisionDistribution stats={data.decisionStats} closed started />}</section>}
    {data.stage !== 3 && view !== "screen" && (view === "student" ? Object.keys(data.ownFramework ?? {}).length > 0 : (data.frameworkStats?.attempted ?? 0) > 0) && <section className="framework-review"><button className="classroom-secondary" onClick={() => setReviewFramework(value => !value)}>{reviewFramework ? "收起框架学习记录" : "查看本次框架学习"}</button>{reviewFramework && <ClassroomFramework key={data.id} data={data} view={view} connected={connected} onSaved={refresh} />}</section>}
    {view !== "screen" && (view === "teacher" || data.ownJoined) && <section className="classroom-export-bar"><div><h3>本次课堂档案</h3><p>{view === "student" ? "回看自己的变化地图与学习过程，可下载留存。" : "导出班级汇总与变化地图，个人决策和答题明细仅学生本人可见。"}</p></div><a className="classroom-secondary" href={`/api/classroom/${data.id}/archive?format=html`} target="_blank" rel="noopener noreferrer">预览 / 打印档案</a><a className="classroom-secondary" href={`/api/classroom/${data.id}/archive?format=json`}>下载课堂记录</a>{view === "student" && <Link href="/student/progress" className="classroom-secondary">我的成长档案</Link>}</section>}
    {confirmation && <ConfirmationDialog confirmation={confirmation} pending={pending} onClose={() => setConfirmation(null)} onConfirm={() => void send(confirmation.command, confirmation.version)} />}
  </main>;
}
function TimerEditor({ durationMs, disabled, onReset }: { durationMs: number; disabled: boolean; onReset: (minutes: number) => void }) {
  const [minutes, setMinutes] = useState(Math.round(durationMs / 60000));
  return <form className="classroom-timer-form" onSubmit={event => { event.preventDefault(); onReset(minutes); }}><label htmlFor="lesson-minutes">设置当前阶段时长</label><div><input id="lesson-minutes" type="number" min={1} max={60} step={1} value={minutes} disabled={disabled} onChange={event => setMinutes(Number(event.target.value))} required /><span>分钟</span><button className="classroom-icon-button" aria-label="重置计时" disabled={disabled}><RotateCcw size={18} /></button></div><small>时间到后等待老师切换；暂停时切换阶段仍保持暂停。</small></form>;
}
function ConfirmationDialog({ confirmation, pending, onClose, onConfirm }: { confirmation: Confirmation; pending: boolean; onClose: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className="classroom-confirm" onCancel={event => { event.preventDefault(); if (!pending) onClose(); }} aria-labelledby="classroom-confirm-title"><h2 id="classroom-confirm-title">{confirmation.title}</h2><p>{confirmation.detail}</p><div><button className="classroom-secondary" disabled={pending} onClick={onClose}>取消</button><button className="classroom-primary" disabled={pending} onClick={onConfirm}>{pending ? "正在同步…" : "确认"}</button></div></dialog>;
}
