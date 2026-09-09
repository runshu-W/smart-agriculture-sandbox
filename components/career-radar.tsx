"use client";

import ReactECharts from "echarts-for-react";
import type { CareerProfile } from "@/lib/game/career-assessment";

export function CareerRadar({ dimensions }: { dimensions: CareerProfile["dimensions"] }) {
  return <ReactECharts notMerge opts={{ renderer: "svg" }} option={{
    animationDuration: 700,
    color: ["#2c8c52"],
    radar: {
      radius: "65%",
      indicator: [{ name: "兴趣", max: 100 }, { name: "性格", max: 100 }, { name: "能力", max: 100 }],
      axisName: { color: "#31443a", fontSize: 13 },
      splitArea: { areaStyle: { color: ["#f4f8f5", "#e6f1e9"] } },
      splitLine: { lineStyle: { color: "#c9d9ce" } },
      axisLine: { lineStyle: { color: "#afc7b7" } },
    },
    series: [{ type: "radar", data: [{ value: [dimensions.interest, dimensions.personality, dimensions.ability], areaStyle: { opacity: .28 }, symbolSize: 7 }] }],
  }} style={{ height: 280, width: "100%" }} />;
}
