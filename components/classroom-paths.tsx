"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Check, CheckCircle2, Compass, ShieldCheck, Sprout } from "lucide-react";
import { PATH_REFERENCES, type ReferenceId } from "@/lib/classroom-references";
import type { LessonSnapshot } from "@/lib/classroom";
export function ClassroomPaths({ data, view, connected, onSaved }: { data: LessonSnapshot; view: "student" | "teacher" | "screen"; connected: boolean; onSaved: () => Promise<void> }) {
  const [selected, setSelected] = useState<ReferenceId | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [localRead, setLocalRead] = useState<string[]>([]);
  const read = new Set([...data.ownPathsViewed, ...localRead]);
  async function mark(path: ReferenceId) {
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/classroom/${data.id}/paths`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }), signal: AbortSignal.timeout(8000) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setLocalRead(previous => previous.includes(path) ? previous : [...previous, path]); await onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "保存失败，请重试"); }
    finally { setPending(false); }
  }
  const active = PATH_REFERENCES.find(item => item.id === selected);
  const icons = [Compass, ShieldCheck, Sprout];
  return <section className="classroom-paths" aria-label="三条路径参考"><header><span>先比较，再决定</span><h2>面对变化，你可以怎样走？</h2><p>三条路都有机会与风险。读懂它们，再结合自己的条件思考。</p></header>
    {error && <p role="alert" className="classroom-error">{error}</p>}
    <div className="path-reference-cards">{PATH_REFERENCES.map((item, index) => { const Icon = icons[index]; return <button key={item.id} className={`path-reference-card path-${item.id} ${selected === item.id ? "selected" : ""}`} onClick={() => setSelected(item.id)} aria-expanded={selected === item.id} aria-label={`阅读${item.title}路径`}><div><Icon size={27} /><span>0{index + 1}</span></div><h3>{item.title}</h3><b>{item.subtitle}</b><p>{item.direction}</p>{view !== "student" && <div className="path-screen-detail"><p><strong>机会</strong>{item.opportunity}</p><p><strong>风险</strong>{item.risk}</p></div>}<footer>{view === "student" && read.has(item.id) ? <><Check size={15} />已阅读</> : <>展开参考<ArrowUpRight size={16} /></>}</footer></button>; })}</div>
    {active && <article className="path-reference-detail"><div><span>路径参考 · {active.title}</span><h3>{active.subtitle}</h3><p>{active.example}</p></div><div className="path-opportunities"><p><b>可能的机会</b>{active.opportunity}</p><p><b>需要考虑的风险</b>{active.risk}</p></div><p className="path-question">想一想：{active.question}</p>{view === "student" && <button className="classroom-primary" disabled={pending || !connected || !data.ownJoined || data.status === "ENDED" || read.has(active.id)} onClick={() => void mark(active.id)}>{read.has(active.id) ? <><CheckCircle2 size={17} />这条路径已阅读</> : pending ? "正在保存…" : "标记这条路径已阅读"}</button>}</article>}
    <div className="path-reference-progress"><CheckCircle2 size={20} /><div><b data-testid="paths-progress">{view === "student" ? `已阅读 ${read.size} / 3 条路径` : `${data.pathsReadyCount} / ${data.joined} 人已阅读全部路径`}</b><p>{view === "student" ? read.size === 3 ? "三条路径已读完，等待老师发起下一阶段决策。" : "逐条展开并标记已阅读，进度会保存到本次课堂。" : "学生读完三条路径后，具备下一阶段决策的阅读条件。"}</p></div></div>
    <div className="path-mentor"><Image src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={65} height={68} /><p>每种选择都有道理，关键是：你是否具备应对变化的能力？<b>让学习力，成为你走向下一程的底气。</b></p></div>
  </section>;
}
