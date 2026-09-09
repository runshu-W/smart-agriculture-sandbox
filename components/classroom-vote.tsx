"use client";
import { CountdownSound } from "@/components/countdown-sound";
import Image from "next/image";
import { useState } from "react";
import { activityElapsed, CHANGE_SIGNALS, TIMING_OPTIONS, type TimingChoice } from "@/lib/classroom-completion";
import { clockText, type LessonSnapshot } from "@/lib/classroom";
export function ClassroomVote({ data, now, view, connected, onSaved }: { data: LessonSnapshot; now: number; view: "student" | "teacher" | "screen"; connected: boolean; onSaved: () => Promise<void> }) {
  const info = data.completion, elapsed = activityElapsed(info.vote, now, 10000), remaining = 10000 - elapsed;
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const open = info.vote.startedAt !== null && info.vote.closedAt === null && remaining > 0 && data.stage === 5 && data.status === "RUNNING";
  const own = info.ownVote, chosen = TIMING_OPTIONS.find(option => option.key === own?.choice), stats = info.voteStats;
  const signals = info.ownMap?.signals ?? [], urgent = signals.filter(signal => signal.priority === "now").length;
  async function vote(choice: TimingChoice) {
    if (!open || !own?.entered || own.reason || !connected || pending) return;
    setPending(true); setError("");
    try { const response = await fetch(`/api/classroom/${data.id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ choice }), signal: AbortSignal.timeout(10000) }); const value = await response.json(); if (!response.ok) throw new Error(value.error); await onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "投票未确认，请刷新结果后重试"); void onSaved().catch(() => {}); }
    finally { setPending(false); }
  }
  return <section className="timing-vote"><div className="vote-heading"><div><span>把观察转化为行动</span><h3>现在，需要调整职业规划吗？</h3><p>对照你的变化地图，有多少处变化信号提示你需要立刻调整职业规划？</p></div><div className={`vote-countdown ${open ? "active" : ""}`}><b data-testid="vote-clock">{clockText(remaining)}</b><small>{!info.vote.startedAt ? "等待老师发起" : info.vote.closedAt ? "本轮投票已结束" : data.status === "PAUSED" ? "投票已暂停" : "投票剩余时间"}</small></div></div>
    {!info.vote.closedAt && <CountdownSound remaining={remaining} running={open && connected} />}
    <div className="vote-participation"><b data-testid="vote-count">{stats?.voted ?? 0} / {stats?.total ?? 0}</b><span>人已投票</span>{info.vote.closedAt && <small>未投票 {stats?.noAnswer ?? 0} 人</small>}</div>
    {view === "student" && <><div className="vote-map-hint">{signals.length ? <>你的地图共 {signals.length} 条信号，其中 <b>{urgent} 条</b>标记“立即调整”。请结合自己的判断投票。</> : "你还没有保存变化信号，可以根据本次课堂讨论作出判断。"}</div>{own?.reason ? <p className="vote-receipt" role="status">{chosen ? `已投票：${chosen.key} · ${chosen.title} → ${chosen.text}` : "本轮未投票，记录已保留。"}</p> : <div className="vote-options">{TIMING_OPTIONS.map(option => <button key={option.key} disabled={!open || !connected || !own?.entered || pending} style={{ borderColor: option.color }} onClick={() => void vote(option.key)}><span style={{ color: option.color }}>{option.key}</span><strong>{option.title}</strong><b>{option.text}</b><small>点击即提交，不可更改</small></button>)}</div>}{!own?.reason && !open && <p className="completion-note">{!data.ownJoined ? "请先加入本次课堂。" : info.vote.closedAt ? "你未参加本轮投票，已结束的投票不能补投。" : data.status === "PAUSED" ? "等待老师继续投票。" : "老师发起后，全班共用10秒作答。"}</p>}</>}
    {info.vote.closedAt && stats && <section className="vote-results" aria-label="调整时机投票结果"><h4>全班怎样判断？</h4>{TIMING_OPTIONS.map(option => { const result = stats.options.find(item => item.key === option.key); return <div className="vote-result-row" key={option.key}><span>{option.key} · {option.text}</span><div><i style={{ width: `${result?.percent ?? 0}%`, background: option.color }} /></div><b>{result?.count ?? 0} 人 <small>{result?.percent ?? 0}%</small></b></div>; })}<p>比例以 {stats.voted} 份有效投票为分母；未投票不归入任何选项。</p>{stats.majorityImmediate && <div className="vote-majority">超过半数有效投票选择“立即调整”。一起讨论：哪些变化需要行动，第一步可以怎样开始？</div>}</section>}
    {info.signalsVisible && <section className="change-signals"><h4>职业规划调整的三种信号</h4><div>{CHANGE_SIGNALS.map((signal, index) => <article key={signal.type}><span>信号 0{index + 1}</span><h5>{signal.title}</h5><strong>{signal.type}</strong><p>{signal.person}：“{signal.quote}”</p></article>)}</div><small>人物与原话来自手册情境，用于教学讨论。</small></section>}
    {error && <p className="classroom-error" role="alert">{error}</p>}<div className="completion-mentor"><Image src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={62} height={66} /><div><b>规划可以调整，方向需要思考</b><p>看见外部变化，也看见自己的成长。带着依据，选择一个可以开始的小行动。</p></div></div>
  </section>;
}
