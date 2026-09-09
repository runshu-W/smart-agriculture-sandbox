"use client";
import { CountdownSound } from "@/components/countdown-sound";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Check, CheckCircle2, Clock3, LockKeyhole, Volume2, VolumeX } from "lucide-react";
import { clockText, type LessonSnapshot } from "@/lib/classroom";
import { DECISION_CHOICES, DECISION_MS, decisionElapsed, type DecisionChoice, type DecisionReport, type DecisionTrace, type DecisionStats } from "@/lib/classroom-decision";
const subscribeDraft = (callback: () => void) => { window.addEventListener("decision-draft", callback); return () => window.removeEventListener("decision-draft", callback); };
function readDraft(key: string | null) { try { return key ? sessionStorage.getItem(key) : null; } catch { return null; } }
function parseDraft(raw: string | null): { choice: DecisionChoice; trace: DecisionTrace[] } | null {
  try { const saved = JSON.parse(raw || "null"); return saved && DECISION_CHOICES.some(item => item.key === saved.choice) && Array.isArray(saved.trace) ? saved : null; } catch { return null; }
}

export function ClassroomDecision({ data, now, view, connected, onSaved }: { data: LessonSnapshot; now: number; view: "student" | "teacher" | "screen"; connected: boolean; onSaved: () => Promise<void> }) {
  const elapsed = decisionElapsed(data.decision, now);
  const remaining = DECISION_MS - elapsed;
  const open = data.decision.startedAt !== null && data.decision.closedAt === null && remaining > 0;
  const canSelect = view === "student" && connected && data.ownJoined && !!data.ownDecision?.entered && data.ownPathsViewed.length === 3 && open && data.status === "RUNNING" && !data.ownDecision?.reason;
  const [draftChoice, setChoice] = useState<DecisionChoice | null>(null);
  const trace = useRef<DecisionTrace[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  const storageKey = data.ownSessionId ? `classroom-decision:${data.ownSessionId}` : null;
  const stored = useSyncExternalStore(subscribeDraft, () => readDraft(storageKey), () => null);
  const saved = parseDraft(stored);
  const choice = draftChoice ?? saved?.choice ?? null;
  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    if (!sound || !open || data.status !== "RUNNING" || !connected) player.pause();
    else if (!player.ended) void player.play().catch(() => setAudioError("声音未能播放，可点击重播；文字情境仍可阅读。"));
  }, [sound, open, data.status, connected]);
  function select(value: DecisionChoice) {
    if (!canSelect || pending) return;
    setChoice(value);
    if (!trace.current.length && saved) trace.current = saved.trace;
    if (trace.current.at(-1)?.choice !== value && trace.current.length < 300) trace.current.push({ choice: value, atMs: Math.floor(elapsed) });
    if (storageKey) try { sessionStorage.setItem(storageKey, JSON.stringify({ choice: value, trace: trace.current })); window.dispatchEvent(new Event("decision-draft")); } catch { /* Submission does not depend on local storage. */ }
  }
  async function submit() {
    if (!canSelect || !choice || pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/classroom/${data.id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ choice, trace: trace.current.length ? trace.current : saved?.trace ?? [] }), signal: AbortSignal.timeout(10000) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      if (storageKey) try { sessionStorage.removeItem(storageKey); } catch { /* Saved server result is authoritative. */ }
      await onSaved(); setConfirm(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "提交未确认，请查看最新状态后重试"); void onSaved().catch(() => {}); }
    finally { setPending(false); }
  }
  const selected = DECISION_CHOICES.find(item => item.key === choice);
  return <div className="decision-room">
    <div className="decision-top"><div><span className="decision-kicker">角色升级 · 现在由你做决定</span><h3>从运营助理，到核心运营负责人</h3><p>西瓜等着卖，团队等着你。面对行业变化，你准备怎么做？</p></div><div className={`decision-countdown ${open && remaining <= 30000 && data.status === "RUNNING" ? "urgent" : ""}`}><Clock3 size={19} /><strong data-testid="decision-clock">{clockText(remaining)}</strong><span>{data.decision.closedAt ? "决策已收束" : !data.decision.startedAt ? "等待老师发起" : data.status === "PAUSED" ? "决策计时已暂停" : "决策剩余时间"}</span></div></div>
    {!data.decision.closedAt && <CountdownSound remaining={remaining} running={open && data.status === "RUNNING" && connected} />}
    <div className="decision-situation"><div className="decision-farmer"><span>张大叔 · 合作农户</span><blockquote>“我花钱托付你们运营直播，流量被AI分走，几十亩西瓜销路你们要给个说法！”</blockquote><audio ref={audio} src="/assets/unit-05/audio/farmer-decision-v001.mp3" preload="metadata" /><div className="decision-audio"><button disabled={!open || data.status !== "RUNNING" || !connected} onClick={() => { setAudioError(""); setSound(value => !value); }}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}{sound ? "关闭情境声音" : "开启情境声音"}</button>{sound && <button disabled={!open || data.status !== "RUNNING" || !connected} onClick={() => { if (audio.current) { audio.current.currentTime = 0; void audio.current.play().catch(() => setAudioError("声音暂时无法播放，请阅读文字情境。")); } }}>重播来电</button>}</div>{audioError && <small role="status">{audioError}</small>}</div><div className="decision-team"><span>团队群聊 · 两种声音</span><p>“赶紧上AI替代真人！”</p><p>“AI没有人情味，西瓜卖的是故事和信任！”</p><small>听见不同立场，也看见每条路的代价。</small></div></div>
    {view === "student" ? <>
      {data.ownDecision?.reason ? <DecisionReceipt data={data} /> : <>
        <div className="decision-question"><h3>你的决策是？</h3><span>选中后，还需确认提交</span></div>
        <div className="decision-options" role="group" aria-label="选择决策方案">{DECISION_CHOICES.map(item => <button key={item.key} style={{ "--choice-color": item.color } as CSSProperties} aria-pressed={choice === item.key} disabled={!canSelect || pending} className={choice === item.key ? "selected" : ""} onClick={() => select(item.key)}><span className="decision-letter">{item.key}</span><div><strong>{item.title}</strong><p>{item.description}</p></div><span className="decision-check">{choice === item.key && <Check size={18} />}</span></button>)}</div>
        <div className="decision-submit"><p aria-live="polite">{!data.ownJoined ? "请先加入本次课堂。" : data.decision.closedAt ? "本次决策已结束。你在结束后加入，未计入本次决策统计。" : !data.decision.startedAt ? "先阅读参考路径，等待老师发起 3 分钟决策。" : !remaining ? "时间已到，正在同步最终结果。未确认的选择不会自动提交。" : data.status === "PAUSED" ? "课堂已暂停，等待老师继续。" : data.ownPathsViewed.length < 3 ? `还需阅读 ${3 - data.ownPathsViewed.length} 条参考路径，读完后即可作答。` : "确认后不能修改；请为自己的选择做好解释。"}</p><button className="classroom-primary" disabled={!canSelect || !choice || pending} onClick={() => setConfirm(true)}><CheckCircle2 size={17} />确认我的选择</button></div>
      </>}
      {error && <p className="classroom-error" role="alert">{error}</p>}
      {confirm && selected && <DecisionConfirm title={`${selected.key} · ${selected.title}`} pending={pending} disabled={!canSelect} onCancel={() => setConfirm(false)} onSubmit={() => void submit()} />}
    </> : data.decisionStats && <DecisionDistribution stats={data.decisionStats} closed={!!data.decision.closedAt} started={!!data.decision.startedAt} />}
  </div>;
}

function DecisionConfirm({ title, pending, disabled, onCancel, onSubmit }: { title: string; pending: boolean; disabled: boolean; onCancel: () => void; onSubmit: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className="classroom-confirm" aria-labelledby="decision-confirm-title" onCancel={event => { event.preventDefault(); if (!pending) onCancel(); }}><h2 id="decision-confirm-title">确认提交这个决策？</h2><p><b>{title}</b></p><p>提交后不能修改。不同方案都值得讨论，请准备说明你的考虑。</p>{disabled && <p>当前已暂停或决策结束，请返回查看最新状态。</p>}<div><button className="classroom-secondary" disabled={pending} onClick={onCancel}>再想一想</button><button className="classroom-primary" disabled={disabled || pending} onClick={onSubmit}>{pending ? "正在提交…" : "确认提交"}</button></div></dialog>;
}

export function DecisionDistribution({ stats, closed, started }: { stats: DecisionStats; closed: boolean; started: boolean }) {
  return <section className="decision-distribution" aria-label="班级决策分布"><div className="decision-question"><h3>{closed ? "这一次，大家怎样选择？" : "班级决策 · 实时分布"}</h3><span>{!started ? "等待发起" : closed ? "本次结果已保留" : "仅统计已确认的选择"}</span></div><div className="decision-metrics"><div><b data-testid="decision-submitted">{stats.submitted}<small> / {stats.total}</small></b><span>已提交 / 参与人数</span></div><div><b data-testid="decision-pending">{stats.pending}</b><span>尚未提交</span></div><div><b data-testid="decision-unanswered">{stats.noAnswer}</b><span>未作答</span></div><div><b data-testid="decision-cd">{stats.cdPercent}%</b><span>C + D 占有效提交</span></div></div><div className="decision-charts"><div><h4>方案选择分布</h4>{stats.choices.map(item => { const option = DECISION_CHOICES.find(option => option.key === item.key)!; return <div className="decision-bar-row" key={item.key}><span>{item.key} · {option.title}</span><div className="decision-bar-track"><i style={{ width: `${item.percent}%`, background: option.color }} /></div><b>{item.count} 人 <small>{item.percent}%</small></b></div>; })}<p>比例以 {stats.submitted} 份有效提交为分母；未作答不归入 A–D。</p></div><div className="decision-timing"><h4>决策用时分布</h4><div className="decision-histogram">{stats.bins.map(bin => <div key={bin.label}><b>{bin.count}</b><div><i style={{ height: `${bin.count / Math.max(1, ...stats.bins.map(item => item.count)) * 100}%` }} /></div><span>{bin.label}</span></div>)}</div><p>从决策发起到提交，扣除暂停；迟到学生共用截止时间。</p></div></div><div className="decision-discussion"><strong>把选择变成讨论</strong><p>C + D 共 {stats.cd} 人，占参与人数 {stats.cdCohortPercent}%。每种方案考虑了什么，又可能忽略什么？</p><small>这些选择用于课堂讨论，不代表能力高低或心理测评结果。</small></div></section>;
}

export function DecisionReceipt({ data }: { data: LessonSnapshot }) {
  const [show, setShow] = useState(false);
  const [report, setReport] = useState<DecisionReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const outcome = data.ownDecision;
  const option = DECISION_CHOICES.find(item => item.key === outcome?.choice);
  async function openReport() {
    setShow(true); setLoading(true); setError("");
    try { const response = await fetch(`/api/classroom/${data.id}/decision`, { cache: "no-store", signal: AbortSignal.timeout(10000) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setReport(result); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "报告暂时无法加载，请重试"); }
    finally { setLoading(false); }
  }
  if (!outcome?.reason) return null;
  return <section className="decision-receipt" aria-label="我的决策结果"><div className="decision-receipt-heading"><CheckCircle2 /><div><h3>{option ? `已提交 ${option.key} · ${option.title}` : "本次决策：未作答"}</h3><p>{option ? `你的选择已保留 · 决策用时 ${clockText(outcome.elapsedMs ?? 0)}` : outcome.reason === "timeout" ? "3 分钟已到，未确认的选择没有自动提交。" : "老师已收束本轮，未提交的记录保留为未作答。"}</p></div></div><button className="classroom-secondary" disabled={loading} onClick={() => show ? setShow(false) : void openReport()}><LockKeyhole size={16} />{loading ? "正在生成报告…" : show ? "收起个人报告" : "查看我的个人报告"}</button>{show && <div className="decision-personal-report"><div className="decision-question"><h3>我的决策回顾</h3><span><LockKeyhole size={14} />仅本人可见</span></div>{error && <p role="alert">{error}<button onClick={() => void openReport()}>重新加载</button></p>}{report && <><div className="decision-report-label"><strong>{option?.label ?? "留一点时间，继续思考"}</strong><span>{option ? "本次选择的课堂观察标签" : "未作答不生成类型标签"}</span></div><div className="decision-curve"><h4>情绪变化 · 教学模拟示意</h4><p>由已记录的查看与选项切换节奏生成，不是你的真实情绪测量或心理评分。两段独立展示，缺失部分不补画。</p><div className="decision-curve-parts"><TracePlot title="行业冲击 · 查看节奏" points={report.impact} /> <TracePlot title="角色决策 · 选择节奏" points={report.trace.map((item, index) => ({ atMs: item.atMs, value: Math.min(10, 1 + index * 0.8) }))} /></div><small>{report.impactSynced ? "行业冲击记录已同步。" : "行业冲击记录尚未完整同步，仅展示已收到的操作。"} 示意值随重复查看和切换增加；虚线仅连接 10 秒内相邻操作，不推断空白时段的情绪。</small></div><div className="decision-mentor"><Image src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={90} height={95} /><div><strong>农小智想对你说</strong><p>{option?.comment ?? "暂时没有做出选择，也可以成为讨论的起点。试着说出最让你犹豫的一条信息，再和同伴一起寻找下一步。"}</p><small>面对变化，重要的是看见依据，并愿意继续调整。</small></div></div></>}</div>}</section>;
}
function TracePlot({ title, points }: { title: string; points: { atMs: number; value: number }[] }) {
  const max = Math.max(1, ...points.map(point => point.atMs));
  const x = (point: { atMs: number }) => 30 + point.atMs / max * 310;
  const y = (point: { value: number }) => 108 - point.value / 10 * 94;
  return <section><h5>{title}</h5>{points.length ? <><svg viewBox="0 0 360 135" role="img" aria-label={`${title}，共 ${points.length} 条实际操作记录，纵轴为教学模拟示意值`}><path d="M28 10V108H348" fill="none" stroke="#cad8d4" /><text x="3" y="16">10</text><text x="10" y="108">0</text>{points.map((point, index) => index > 0 && point.atMs - points[index - 1].atMs <= 10000 ? <line key={index} x1={x(points[index - 1])} y1={y(points[index - 1])} x2={x(point)} y2={y(point)} stroke="#8ab7a8" strokeDasharray="3 4" /> : null)}{points.map((point, index) => <circle key={index} cx={x(point)} cy={y(point)} r="4" fill="#267f69"><title>{clockText(point.atMs)} · 示意值 {point.value}</title></circle>)}<text x="26" y="128">0 秒</text><text x="300" y="128">{Math.ceil(max / 1000)} 秒</text></svg><small>{points.length} 条记录 · 仅标记实际操作时点</small></> : <div className="decision-no-trace">没有可用的操作记录<br /><small>此段留空，不生成模拟数值</small></div>}</section>;
}
