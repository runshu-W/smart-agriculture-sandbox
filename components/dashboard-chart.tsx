"use client";

import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Download, LoaderCircle } from "lucide-react";
import type { EChartsOption } from "echarts";
import type { DataSource } from "@/generated/prisma/client";
import { SOURCE_META } from "@/lib/metrics";

export function DashboardChart({ title, subtitle, sources, option, downloadable = true, className = "" }: { title: string; subtitle?: string; sources: DataSource[]; option: EChartsOption; downloadable?: boolean; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<ReactECharts>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = host.current; if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "160px" });
    observer.observe(node); return () => observer.disconnect();
  }, []);
  function download() {
    const url = chart.current?.getEchartsInstance().getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#ffffff" });
    if (!url) return;
    const link = document.createElement("a"); link.href = url; link.download = `${title}.png`; link.click();
  }
  return <article className={`dashboard-chart ${className}`} ref={host}>
    <header><div className="source-tags">{sources.map((source) => <span key={source} style={{ "--source": SOURCE_META[source].color } as React.CSSProperties}>{SOURCE_META[source].label}</span>)}</div>{downloadable && <button aria-label={`下载${title}图表`} onClick={download} title="下载图表"><Download /></button>}</header>
    <h3>{title}</h3>{subtitle && <p>{subtitle}</p>}
    <div className="chart-canvas">{visible ? <ReactECharts notMerge option={option} ref={chart} style={{ height: "100%", width: "100%" }} /> : <span className="chart-loading"><LoaderCircle />载入图表</span>}</div>
  </article>;
}
