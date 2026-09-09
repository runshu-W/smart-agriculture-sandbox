"use client";

import { useState } from "react";
import { Award, Gauge, ShieldCheck } from "lucide-react";
import type { EChartsOption } from "echarts";
import { DashboardChart } from "@/components/dashboard-chart";
import { LITERACY_DIMENSIONS } from "@/lib/metrics";

type Literacy = { key: string; label: string; baseline: number; current: number };
type Curve = { lesson: number; values: Record<string, number> }[];
type RankItem = { userId: string; name: string; literacy: number; completion: number; duration: number; badges: number; rank: number };

const colors = ["#23835a", "#3677c8", "#d0a23a", "#c55b48", "#6558a8"];

export function StudentDashboardVisuals({ literacy, curve, rankings, ownId }: { literacy: Literacy[]; curve: Curve; rankings: { literacy: RankItem[]; speed: RankItem[]; badges: RankItem[] }; ownId: string }) {
  const [rankMode, setRankMode] = useState<keyof typeof rankings>("literacy");
  const [enabled, setEnabled] = useState<string[]>(LITERACY_DIMENSIONS.map((item) => item.key));
  const radarOption: EChartsOption = { tooltip: { trigger: "item" }, legend: { bottom: 0, data: ["入学基线", "当前值"] }, radar: { radius: "62%", indicator: literacy.map((item) => ({ name: item.label, max: 100 })), splitArea: { areaStyle: { color: ["#fbfdfb", "#eef6f1"] } } }, series: [{ type: "radar", data: [{ name: "入学基线", value: literacy.map((item) => item.baseline), lineStyle: { type: "dashed", color: "#8b9790" }, areaStyle: { color: "rgba(139,151,144,.08)" } }, { name: "当前值", value: literacy.map((item) => item.current), lineStyle: { color: "#23835a", width: 3 }, areaStyle: { color: "rgba(35,131,90,.2)" } }] }] };
  const lineOption: EChartsOption = { tooltip: { trigger: "axis" }, legend: { show: false }, grid: { left: 40, right: 18, top: 20, bottom: 38 }, xAxis: { type: "category", data: curve.map((item) => `第${item.lesson}课`) }, yAxis: { type: "value", min: 0, max: 100 }, series: LITERACY_DIMENSIONS.filter((item) => enabled.includes(item.key)).map((item, index) => ({ name: item.label, type: "line", smooth: true, symbolSize: 6, data: curve.map((point) => point.values[item.key] ?? 0), lineStyle: { width: 3 }, color: colors[index] })) };
  return <>
    <section className="student-chart-grid">
      <DashboardChart className="student-radar-chart" downloadable={false} option={radarOption} sources={["SIMULATION", "XUEXITONG"]} subtitle="入学基线与当前学习证据叠加" title="我的素养画像" />
      <div className="growth-chart-wrap"><div className="dimension-toggles">{LITERACY_DIMENSIONS.map((item, index) => <button className={enabled.includes(item.key) ? "active" : ""} key={item.key} onClick={() => setEnabled((current) => current.includes(item.key) ? current.filter((key) => key !== item.key) : [...current, item.key])}><i style={{ background: colors[index] }} />{item.label}</button>)}</div><DashboardChart downloadable={false} option={lineOption} sources={["SIMULATION", "XUEXITONG", "NATIONAL_PLATFORM", "TEACHER_UPLOAD"]} subtitle="第 1 至第 15 课，可切换维度" title="我的成长曲线" /></div>
    </section>
    <section className="leaderboard-panel"><header><div><span className="eyebrow"><ShieldCheck />隐私保护排名</span><h2>云禾英雄榜</h2><p>只显示本人及相邻名次，完成速度以完成率优先计算。</p></div><div className="rank-tabs"><button className={rankMode === "literacy" ? "active" : ""} onClick={() => setRankMode("literacy")}><Gauge />综合素养</button><button className={rankMode === "speed" ? "active" : ""} onClick={() => setRankMode("speed")}>完成速度</button><button className={rankMode === "badges" ? "active" : ""} onClick={() => setRankMode("badges")}><Award />徽章数量</button></div></header><div className="rank-list">{rankings[rankMode].map((item) => <div className={item.userId === ownId ? "self" : ""} key={item.userId}><b>{item.rank}</b><span>{item.name}{item.userId === ownId && <small>本人</small>}</span><strong>{rankMode === "literacy" ? `${item.literacy} 分` : rankMode === "badges" ? `${item.badges} 枚` : `${item.completion}% · ${Math.round(item.duration / 60_000)} 分钟`}</strong></div>)}</div></section>
  </>;
}
