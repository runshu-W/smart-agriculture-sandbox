import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, Compass, Flag, HeartHandshake, LockKeyhole, Play, Route } from "lucide-react";
import type { UnitStatus } from "@/lib/curriculum";

type UnitItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  route: string;
  status: UnitStatus;
  progressPercent: number;
};

const icons = [Compass, BrainCircuit, HeartHandshake, Route, Flag];
const statusLabel: Record<UnitStatus, string> = {
  LOCKED: "未开放",
  NOT_STARTED: "未开始",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
};

export function UnitOverviewList({ units, compact = false }: { units: UnitItem[]; compact?: boolean }) {
  return (
    <div className={`program-units ${compact ? "compact" : ""}`}>
      {units.map((unit, index) => {
        const Icon = icons[index] ?? Compass;
        const locked = unit.status === "LOCKED";
        return (
          <article className={`program-unit status-${unit.status.toLowerCase()}`} key={unit.id}>
            <div className="unit-number"><span>{unit.number}</span><Icon size={21} /></div>
            <div className="unit-overview-copy">
              <div className="unit-title-line"><span>第{["一", "二", "三", "四", "五"][index]}单元</span><b>{statusLabel[unit.status]}</b></div>
              <h2>{unit.title}</h2>
              <p>{unit.description}</p>
            </div>
            <div className="unit-overview-progress">
              <div><span>完成进度</span><strong>{unit.progressPercent}%</strong></div>
              <div className="meter"><i style={{ width: `${unit.progressPercent}%` }} /></div>
            </div>
            {locked ? (
              <span className="unit-locked"><LockKeyhole size={17} />待解锁</span>
            ) : (
              <Link className="unit-enter" href={unit.route}>
                {unit.status === "COMPLETED" ? <Check size={18} /> : <Play size={18} />}
                {unit.status === "NOT_STARTED" ? "进入单元" : unit.status === "COMPLETED" ? "回顾单元" : "继续学习"}
                <ArrowRight size={17} />
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
