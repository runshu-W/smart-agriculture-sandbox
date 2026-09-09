"use client";

import type { EChartsOption } from "echarts";
import { DashboardChart } from "@/components/dashboard-chart";

type Analytics = {
  lessons: number[];
  psychological: { resilience: number[]; frustration: number[]; strategyDistribution: number[]; anxiety: number[]; coping: { active: number[]; adjust: number[]; avoid: number[] } };
  career: { radar: Array<{ key: string; baseline: number; current: number }>; planQuality: number[]; compliance: number[]; preview: number[]; decisions: Array<{ quality: number; latency: number; student: string | null }> };
  values: { rural: number[]; youth: number[]; service: Array<{ student: string | null; value: number }>; ideology: number[]; teamwork: { active: number[]; passive: number[]; none: number[] } };
};

const axis = (lessons: number[]) => lessons.map((item) => `第${item}课`);
const grid = { left: 45, right: 22, top: 30, bottom: 38 };
const tooltip = { trigger: "axis" as const };
const line = (name: string, data: number[], color = "#258b5b", area = false) => ({ name, type: "line" as const, smooth: true, data, symbolSize: 6, lineStyle: { width: 3 }, itemStyle: { color }, ...(area ? { areaStyle: { color: `${color}22` } } : {}) });
const stackedBars = (items: Array<{ name: string; data: number[]; color: string }>, stack: string) =>
  items.map((item) => ({
    name: item.name,
    type: "bar" as const,
    stack,
    data: item.data,
    itemStyle: { color: item.color },
  }));

export function TeacherAnalyticsCharts({ data }: { data: Analytics }) {
  const labels = axis(data.lessons);
  const resilience: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", min: 0, max: 100 }, series: [{ ...line("班级均值", data.psychological.resilience), markLine: { lineStyle: { type: "dashed", color: "#8b9690" }, data: [{ name: "入学基线", yAxis: data.psychological.resilience[0] ?? 0 }] } }] };
  const frustration: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: [{ name: "完成率", type: "bar", data: data.psychological.frustration, itemStyle: { color: "#3b9d70" }, barMaxWidth: 28 }] };
  const strategy: EChartsOption = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["42%", "70%"], data: ["0 种", "1-2 种", "3 种以上"].map((name, index) => ({ name, value: data.psychological.strategyDistribution[index] ?? 0 })) }] };
  const anxiety: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", min: 0, max: 10 }, series: [{ ...line("焦虑自评均分", data.psychological.anxiety, "#d1a43b"), markLine: { data: [{ name: "教学关注线", yAxis: 5 }], lineStyle: { color: "#d95f45", type: "dashed" } } }] };
  const coping: EChartsOption = { tooltip, legend: { bottom: 0 }, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: stackedBars([{ name: "主动求助", data: data.psychological.coping.active, color: "#288c5e" }, { name: "自我调适", data: data.psychological.coping.adjust, color: "#4c80c5" }, { name: "放弃/逃避", data: data.psychological.coping.avoid, color: "#d56d55" }], "coping") };
  const careerLabels = ["专业认同", "岗位认知", "工匠精神", "合规意识", "行动力"];
  const careerRadar: EChartsOption = { tooltip: { trigger: "item" }, legend: { bottom: 0 }, radar: { indicator: careerLabels.map((name) => ({ name, max: 100 })) }, series: [{ type: "radar", data: [{ name: "入学基线", value: data.career.radar.map((item) => item.baseline), lineStyle: { type: "dashed" } }, { name: "当前值", value: data.career.radar.map((item) => item.current), areaStyle: { color: "rgba(37,139,91,.2)" } }] }] };
  const planQuality: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: ["未达标", "达标", "良好", "优秀"] }, yAxis: { type: "value", minInterval: 1 }, series: [{ name: "当前人数", type: "bar", data: data.career.planQuality, itemStyle: { color: "#d18e3f" }, barMaxWidth: 42 }] };
  const compliance: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: [line("识别正确率", data.career.compliance)] };
  const decisions: EChartsOption = { tooltip: { trigger: "item", formatter: (params: unknown) => { const item = params as { value?: [number, number, string] }; return `${item.value?.[2] ?? "学生"}<br/>响应 ${item.value?.[0] ?? 0} 秒<br/>质量 ${item.value?.[1] ?? 0}`; } }, grid, xAxis: { type: "value", name: "响应时间（秒）", inverse: true }, yAxis: { type: "value", name: "决策质量", max: 100 }, series: [{ type: "scatter", symbolSize: 10, data: data.career.decisions.map((item) => [item.latency, item.quality, item.student ?? "学生"]) }] };
  const preview: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: [line("预习完成率", data.career.preview, "#3c79c5", true)] };
  const rural: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: [{ ...line("价值认同率", data.values.rural), markLine: { data: [{ name: "学期目标", yAxis: 85 }], lineStyle: { type: "dashed", color: "#d2a339" } } }] };
  const youth: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: [{ ...line("参与率", data.values.youth, "#4b7fc4"), markLine: { data: [{ name: "目标", yAxis: 100 }], lineStyle: { type: "dashed", color: "#d95f45" } } }] };
  const teamwork: EChartsOption = { tooltip, legend: { bottom: 0 }, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: stackedBars([{ name: "主动担当", data: data.values.teamwork.active, color: "#288c5e" }, { name: "被动参与", data: data.values.teamwork.passive, color: "#d0a33c" }, { name: "未参与", data: data.values.teamwork.none, color: "#a6afa9" }], "team") };
  const service = [...data.values.service].sort((a, b) => b.value - a.value).slice(0, 12);
  const serviceHours: EChartsOption = { tooltip, grid: { left: 78, right: 20, top: 15, bottom: 30 }, xAxis: { type: "value", name: "小时" }, yAxis: { type: "category", inverse: true, data: service.map((item) => (item.student ?? "学生").replace("student-", "学员")) }, series: [{ type: "bar", data: service.map((item) => item.value), itemStyle: { color: "#d58d3e" } }] };
  const ideology: EChartsOption = { tooltip, grid, xAxis: { type: "category", data: labels }, yAxis: { type: "value", max: 100 }, series: [line("完成度", data.values.ideology, "#c8a12e", true)] };
  return <div className="analytics-sections">
    <section><header><span>板块一</span><h2>砺心提质</h2><p>心理韧性、情绪管理与抗挫能力</p></header><div className="analytics-grid"><DashboardChart option={resilience} sources={["SIMULATION", "XUEXITONG"]} title="班级心理韧性增值曲线" /><DashboardChart option={frustration} sources={["SIMULATION"]} title="挫折情境任务完成率" /><DashboardChart downloadable={false} option={strategy} sources={["SIMULATION", "XUEXITONG"]} title="情绪调节策略掌握分布" /><DashboardChart option={anxiety} sources={["SIMULATION", "XUEXITONG"]} subtitle="≥ 5.0 仅作为教学关注提示" title="焦虑自评均分趋势" /><DashboardChart option={coping} sources={["SIMULATION"]} title="应对行为类型占比" /></div></section>
    <section><header><span>板块二</span><h2>明职定向</h2><p>职业认同、规划能力与法治观念</p></header><div className="analytics-grid"><DashboardChart downloadable={false} option={careerRadar} sources={["SIMULATION", "XUEXITONG"]} title="职业认同度增值雷达" /><DashboardChart option={planQuality} sources={["TEACHER_UPLOAD"]} title="规划书质量分布" /><DashboardChart option={compliance} sources={["SIMULATION"]} title="合规风险识别正确率" /><DashboardChart downloadable={false} option={decisions} sources={["SIMULATION"]} title="闯关决策路径分析" /><DashboardChart option={preview} sources={["NATIONAL_PLATFORM", "XUEXITONG"]} title="预习任务完成度趋势" /></div></section>
    <section><header><span>板块三</span><h2>筑基强责</h2><p>政治认同、公共参与与责任担当</p></header><div className="analytics-grid"><DashboardChart option={rural} sources={["SIMULATION", "XUEXITONG"]} title="乡村振兴价值认同率" /><DashboardChart option={youth} sources={["TEACHER_UPLOAD"]} title="青年大学习参与率" /><DashboardChart option={teamwork} sources={["SIMULATION"]} title="团队协作主动担当率" /><DashboardChart option={serviceHours} sources={["TEACHER_UPLOAD"]} title="实践服务时长分布" /><DashboardChart option={ideology} sources={["NATIONAL_PLATFORM"]} title="思政资源学习完成度" /></div></section>
  </div>;
}
