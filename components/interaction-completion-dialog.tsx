import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function InteractionCompletionDialog({
  title,
  nextRoute,
  mapRoute,
  eyebrow = "学习证据已写入",
  description = "本次操作过程、分支、完成状态和用时已保存。",
}: {
  title: string;
  nextRoute: string;
  mapRoute: string;
  eyebrow?: string;
  description?: string;
}) {
  const headingId = `completion-${title.replaceAll(" ", "-")}`;

  return (
    <div className="interaction-completion-backdrop">
      <section aria-labelledby={headingId} aria-modal="true" className="interaction-completion-dialog" role="dialog">
        <CheckCircle2 aria-hidden="true" size={42} />
        <span className="eyebrow">{eyebrow}</span>
        <h2 id={headingId}>{title}完成</h2>
        <p>{description}</p>
        <div>
          <Link className="primary-button" href={nextRoute}>继续下一项<ArrowRight size={17} /></Link>
          <Link className="secondary-button" href={mapRoute}>返回单元地图</Link>
        </div>
      </section>
    </div>
  );
}
