import { ClipboardCheck, Clock3, MessageCircleQuestion, MousePointerClick, TrendingDown, TrendingUp } from "lucide-react";

type ActivityMetric = { key: string; label: string; current: number; previous: number; change: number | null; unit: string };

const icons = { duration: Clock3, sessions: MousePointerClick, answers: MessageCircleQuestion, tasks: ClipboardCheck } as const;

export function TeacherLearningActivity({ metrics }: { metrics: ActivityMetric[] }) {
  return <section className="weekly-activity-overview"><header><div><span>近 7 天</span><h2>学习活动总览</h2></div><p>与此前 7 天的同口径数据对比</p></header><div>{metrics.map((metric) => {
    const Icon = icons[metric.key as keyof typeof icons] ?? MousePointerClick;
    const rising = metric.change !== null && metric.change >= 0;
    return <article key={metric.key}><span><Icon /></span><div><small>{metric.label}</small><strong>{metric.current.toLocaleString("zh-CN")}<i>{metric.unit}</i></strong><p>此前 7 天 {metric.previous.toLocaleString("zh-CN")} {metric.unit}</p></div><em className={rising ? "up" : "down"}>{metric.change === null ? "本周新增" : <>{rising ? <TrendingUp /> : <TrendingDown />}{rising ? "+" : ""}{metric.change}%</>}</em></article>;
  })}</div></section>;
}
