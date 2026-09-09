"use client";

import type { EChartsOption } from "echarts";
import { DashboardChart } from "@/components/dashboard-chart";

export function UnitAnalysisCharts({ tasks }: { tasks: Array<{ title: string; completion: number; accuracy: number; retryRate: number }> }) {
  const completion: EChartsOption = { tooltip: { trigger: "axis" }, legend: { bottom: 0 }, grid: { left: 110, right: 24, top: 18, bottom: 42 }, xAxis: { type: "value", max: 100 }, yAxis: { type: "category", data: tasks.map((item) => item.title) }, series: [{ name: "完成率", type: "bar", data: tasks.map((item) => item.completion), itemStyle: { color: "#288c5e" } }] };
  const quality: EChartsOption = { tooltip: { trigger: "axis" }, legend: { bottom: 0 }, grid: { left: 110, right: 24, top: 18, bottom: 42 }, xAxis: { type: "value", max: 100 }, yAxis: { type: "category", data: tasks.map((item) => item.title) }, series: [{ name: "正确率", type: "bar", data: tasks.map((item) => item.accuracy), itemStyle: { color: "#4a7fc4" } }, { name: "重试率", type: "bar", data: tasks.map((item) => item.retryRate), itemStyle: { color: "#d5a039" } }] };
  return <section className="unit-analysis-chart-grid"><DashboardChart option={completion} sources={["SIMULATION"]} title="任务与互动完成率" /><DashboardChart option={quality} sources={["SIMULATION"]} title="作答质量与重试情况" /></section>;
}
