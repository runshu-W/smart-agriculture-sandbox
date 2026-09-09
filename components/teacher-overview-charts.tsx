"use client";

import type { EChartsOption } from "echarts";
import { DashboardChart } from "@/components/dashboard-chart";

type SourceCount = { source: "SIMULATION" | "XUEXITONG" | "NATIONAL_PLATFORM" | "TEACHER_UPLOAD"; count: number };
type UnitPerformance = { id: string; label: string; title: string; completion: number; averageScore: number };

export function TeacherOverviewCharts({ literacy, activity, sources, units, roles, resilience, careerAbility }: {
  literacy: Array<{ label: string; baseline: number; current: number }>;
  activity: Array<{ label: string; active: number; minutes: number }>;
  sources: SourceCount[];
  units: UnitPerformance[];
  roles: Array<{ label: string; count: number }>;
  resilience: Array<{ lesson: number; value: number }>;
  careerAbility: Array<{ key: string; label: string; value: number }>;
}) {
  const unitPerformance: EChartsOption = { tooltip: { trigger: "axis" }, legend: { bottom: 0 }, grid: { left: 44, right: 44, top: 28, bottom: 54 }, xAxis: { type: "category", data: units.map((item) => item.label), axisLabel: { interval: 0 } }, yAxis: [{ type: "value", name: "完成率", min: 0, max: 100, axisLabel: { formatter: "{value}%" } }, { type: "value", name: "平均分", min: 0, max: 100 }], series: [{ name: "完成率", type: "bar", data: units.map((item) => item.completion), barMaxWidth: 30, itemStyle: { color: "#2b9464", borderRadius: [3, 3, 0, 0] } }, { name: "平均得分", type: "line", yAxisIndex: 1, smooth: true, symbolSize: 8, data: units.map((item) => item.averageScore), lineStyle: { width: 3, color: "#477bd1" }, itemStyle: { color: "#477bd1" } }] };
  const roleDistribution: EChartsOption = roles.length ? { tooltip: { trigger: "item", formatter: "{b}<br/>{c} 人（{d}%）" }, legend: { type: "scroll", bottom: 0 }, series: [{ type: "pie", radius: ["43%", "69%"], center: ["50%", "44%"], label: { formatter: "{b}\n{d}%" }, data: roles.map((item) => ({ name: item.label, value: item.count })) }] } : { title: { text: "暂无岗位选择数据", left: "center", top: "43%", textStyle: { color: "#7c8a82", fontSize: 13, fontWeight: 500 } }, series: [] };
  const resilienceTrend: EChartsOption = { tooltip: { trigger: "axis" }, grid: { left: 42, right: 18, top: 24, bottom: 35 }, xAxis: { type: "category", name: "课时", data: resilience.map((item) => item.lesson) }, yAxis: { type: "value", min: 0, max: 100 }, series: [{ name: "班级平均心理韧性", type: "line", smooth: true, symbolSize: 6, data: resilience.map((item) => item.value), lineStyle: { width: 3, color: "#2b9464" }, areaStyle: { color: "rgba(43,148,100,.12)" }, itemStyle: { color: "#2b9464" } }] };
  const careerRadar: EChartsOption = { tooltip: { trigger: "item" }, radar: { indicator: careerAbility.map((item) => ({ name: item.label, max: 100 })), radius: "66%", center: ["50%", "52%"] }, series: [{ type: "radar", data: [{ name: "班级平均", value: careerAbility.map((item) => item.value), areaStyle: { color: "rgba(39,128,89,.22)" }, lineStyle: { color: "#278059", width: 3 }, itemStyle: { color: "#278059" } }] }] };
  const radar: EChartsOption = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, radar: { indicator: literacy.map((item) => ({ name: item.label, max: 100 })), radius: "62%" }, series: [{ type: "radar", data: [{ name: "入学基线", value: literacy.map((item) => item.baseline), lineStyle: { type: "dashed", color: "#8a9690" } }, { name: "当前值", value: literacy.map((item) => item.current), areaStyle: { color: "rgba(36,139,91,.2)" }, lineStyle: { color: "#248b5b", width: 3 } }] }] };
  const trend: EChartsOption = { tooltip: { trigger: "axis" }, legend: { bottom: 0 }, grid: { left: 40, right: 42, top: 16, bottom: 46 }, xAxis: { type: "category", data: activity.map((item) => item.label) }, yAxis: [{ type: "value", name: "人数" }, { type: "value", name: "分钟" }], series: [{ name: "活跃人数", type: "line", smooth: true, data: activity.map((item) => item.active), color: "#258c5c" }, { name: "学习分钟", type: "bar", yAxisIndex: 1, data: activity.map((item) => item.minutes), color: "#4e82c5", barMaxWidth: 24 }] };
  const source: EChartsOption = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["44%", "70%"], label: { formatter: "{b}\n{d}%" }, data: sources.map((item) => ({ name: ({ SIMULATION: "沙盘", XUEXITONG: "学习通", NATIONAL_PLATFORM: "国家职教平台", TEACHER_UPLOAD: "教师上传" } as const)[item.source], value: item.count })) }] };
  return <section className="teacher-overview-feature-charts">
      <DashboardChart className="unit-performance-chart" option={unitPerformance} sources={["SIMULATION"]} subtitle="完成率与平均得分按五个单元对照" title="各单元完成情况" />
      <DashboardChart downloadable={false} option={roleDistribution} sources={["SIMULATION"]} subtitle="来自学生最近一次职业角色卡选择" title="岗位选择分布" />
      <DashboardChart option={resilienceTrend} sources={["SIMULATION", "XUEXITONG"]} subtitle="第 1 至第 15 课班级均值" title="心理韧性趋势" />
      <DashboardChart downloadable={false} option={careerRadar} sources={["SIMULATION", "XUEXITONG"]} subtitle="五项职业能力当前班级均值" title="职业能力雷达图" />
      <DashboardChart downloadable={false} option={radar} sources={["SIMULATION", "XUEXITONG"]} subtitle="五维素养基线与当前均值" title="班级素养增值" /><DashboardChart option={trend} sources={["SIMULATION"]} subtitle="最近 7 天有效活动" title="学习活跃趋势" /><DashboardChart downloadable={false} option={source} sources={sources.map((item) => item.source)} subtitle="每条记录均可追溯来源" title="数据来源构成" />
    </section>;
}
