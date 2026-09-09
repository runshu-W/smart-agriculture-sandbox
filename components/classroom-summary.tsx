"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, Eye, Info, UsersRound, X } from "lucide-react";
import { IMPACT_REGIONS } from "@/lib/classroom-impact";
import type { ImpactSummary } from "@/lib/impact-summary";
export function ClassroomSummary({ lessonId, view }: { lessonId: string; view: "teacher" | "screen" }) {
  const [data, setData] = useState<ImpactSummary | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const update = async () => {
      try {
        const response = await fetch(`/api/classroom/${lessonId}/impact?view=${view}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error();
        const value = await response.json(); if (!stopped) { setData(value); setError(""); }
      } catch { if (!stopped) setError("暂时无法更新，保留上次结果，正在重试。"); }
      if (!stopped) timer = setTimeout(update, 2000);
    };
    void update(); return () => { stopped = true; clearTimeout(timer); };
  }, [lessonId, view]);
  const person = data?.details?.find(item => item.id === selected);
  return <section className="impact-summary" aria-label="班级观察数据">
    <header><div><span>从观察走向讨论</span><h2>刚才，大家关注了什么？</h2><p>同样的变化，可以有不同的观察起点。</p></div><Eye size={31} /></header>
    {error && <p role="alert" className="classroom-notice">{error}</p>}
    {!data ? <p role="status">正在读取本次课堂的观察记录…</p> : <>
      <div className="summary-coverage"><UsersRound size={17} /><b data-testid="impact-uploaded">{data.uploaded} / {data.total}</b><span>人已完成上传</span>{data.missing > 0 ? <em>{data.missing} 人待补传，统计将自动更新</em> : <em><CheckCircle2 size={14} />{data.total ? "记录已汇齐" : "暂无参与学生"}</em>}</div>
      <div className="summary-metrics"><article><div><span>情绪波动指数</span><em>教学模拟</em></div><Ring value={data.average === null ? null : data.average * 10} label={data.average?.toFixed(1) ?? "—"} unit="/ 10" warm={(data.average ?? 0) >= 6} /><p>根据操作节奏模拟，<b>不代表真实心理状态</b></p><small>{data.samples} 人有效样本</small></article><article><div><span>持续观察比例</span><Clock3 size={16} /></div><Ring value={data.waitRate} label={data.waitRate === null ? "—" : `${data.waitRate}`} unit="%" /><p>首次点击前等待超过 5 秒<br />包含完整上传后仍未点击的记录</p><small>{data.waiting} / {data.samples} 人 · 未上传者不计入</small></article></div>
      <section className="summary-top"><header><h3>最关注事件 TOP 3</h3><span>按关注人数排序 · 可关注多个事件</span></header>{data.uploaded === 0 ? <p className="summary-empty">等待学生记录上传后显示，不使用预置数据。</p> : data.top.map((item, index) => <div className="summary-bar-row" key={item.region}><span>0{index + 1}</span><div><div><b>{item.label}</b><small>{item.count} 人 / {data.uploaded} 人</small></div><div className="summary-bar"><i style={{ width: `${item.percent}%` }} /></div></div><strong>{item.percent}%</strong></div>)}</section>
      <div className="summary-guide"><Image src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={65} height={68} /><p><b>先理解各自的观察，再讨论应对的方向。</b><span>有人先看数据，有人先在意农户，也有人关注团队。接下来，比较转型、坚守和升级三条路径。</span></p></div>
      <details className="summary-method"><summary><Info size={15} />如何理解这些数据</summary><p>关注来自点击、键盘操作或指针停留，并非眼动追踪。关注比例以完成上传的人数为分母，同一人对同一事件只计一次。无点击不等于焦虑，长时间思考也可能是慎重观察。</p><p>模拟指数规则 v1：1 + 重复点击项（1 秒内同事件重复点击，每次 0.5，最多 3）+ 跨事件切换项（每次 0.3，最多 3）+ 等待项（每 5 秒 1，最多 3）。范围 1–10，仅用于教学讨论，不用于评分或心理判断。</p><p>等待从情境播完或本人晚到时开始，取较晚者。未点击只表示等待时长下界；观察窗口不足 5 秒且未点击不参与均值与比例。后台补传会更新统计。</p></details>
      {view === "teacher" && <section className="summary-people"><h3>个人观察明细 <small>仅教师可见</small></h3><div>{data.details?.map(item => <button key={item.id} onClick={() => setSelected(item.id)} aria-label={`查看${item.name}观察明细`}><span>{item.name.slice(-2)}</span><div><b>{item.name}</b><small>{!item.synced ? "待补传" : !item.sample ? "观察窗口不足" : `模拟 ${item.emotion?.toFixed(1)} · ${item.waiting ? "持续观察" : "已开始查看"}`}</small></div><ArrowUpRight size={16} /></button>)}</div></section>}
      {person && <div className="summary-person-detail" role="region" aria-label={`${person.name}的观察明细`}><button onClick={() => setSelected(null)} aria-label="关闭个人明细"><X size={18} /></button><h3>{person.name}的观察记录</h3><p>模拟指数：{person.emotion?.toFixed(1) ?? "暂无有效样本"}；等待：{person.waitSeconds === null ? "暂无有效样本" : `${person.lowerBound ? "至少 " : ""}${person.waitSeconds.toFixed(1)} 秒`}</p><p>查看顺序：{person.order.length ? person.order.slice(0, 60).map(key => IMPACT_REGIONS[key]).join(" → ") : "暂无点击记录"}</p><div>{Object.entries(person.dwell).map(([key, value]) => <span key={key}>{IMPACT_REGIONS[key as keyof typeof IMPACT_REGIONS]}<b>{value.toFixed(1)} 秒</b></span>)}</div><small>重复点击 {person.repeatClicks} 次 · 跨事件切换 {person.switches} 次 · 合并重复停留区间，暂停与后台时间不计入</small></div>}
    </>}
  </section>;
}
function Ring({ value, label, unit, warm = false }: { value: number | null; label: string; unit: string; warm?: boolean }) {
  return <div className={`summary-ring ${warm ? "warm" : ""}`} style={{ background: `conic-gradient(${warm ? "#cb8747" : "#4d9270"} ${value ?? 0}%, #eef2e9 0)` }}><div><strong>{label}</strong><span>{unit}</span></div></div>;
}
