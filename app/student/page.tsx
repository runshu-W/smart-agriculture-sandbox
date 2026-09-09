import { PLATFORM_NAME } from "@/lib/brand";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, LineChart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { UnitOverviewList } from "@/components/unit-overview-list";
import { getProgramOverview } from "@/lib/server/program";

export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const overview = await getProgramOverview();
  const openUnit = overview.units.find((unit) => unit.published && unit.status !== "COMPLETED") ?? [...overview.units].reverse().find((unit) => unit.published);
  return (
    <main className="page-shell student-map-page project-home">
      <AppHeader />
      <section className="project-hero">
        <Image className="project-hero-bg" src="/assets/global/scenes/project-home-v001.webp" alt="温室、田野、学习中心与智能设备构成的智慧农业全景" fill priority sizes="100vw" />
        <div className="project-hero-shade" />
        <div className="project-hero-inner">
          <div className="project-intro">
            <span className="eyebrow"><Sparkles size={16} />智慧农业 · 五单元沉浸式学习</span>
            <h1>{PLATFORM_NAME}</h1>
            <p>跟随农小智，从时代认知、自我探索到沟通协作、终身学习和生涯规划，在五个单元中完成一段可记录、可成长的智慧农业职业旅程。</p>
            <div className="entry-actions"><Link className="primary-button" href={overview.nextRoute}><BookOpenCheck size={18} />{overview.nextLabel}<ArrowRight size={18} /></Link><Link className="secondary-button" href="/student/progress"><LineChart size={18} />查看成长档案</Link></div>
            <div className="project-facts"><span><b>5</b>成长单元</span><span><b>{openUnit?.progressPercent ?? 0}%</b>{openUnit?.title ?? "当前学习"}</span><span><b>{overview.student.displayName}</b>学习档案</span></div>
          </div>
          <div className="home-guide">
            <div className="guide-callout"><span>农小智</span><strong>{overview.student.displayName}，欢迎回来</strong><p>我会陪你认识行业、理解自己，并把每一次操作变成成长证据。</p></div>
            <Image className="nxz-portrait" src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智学习导师" width={776} height={817} priority />
          </div>
        </div>
      </section>
      <section className="unit-overview-section">
        <div className="section-heading"><span>课程地图</span><h2>五个成长单元</h2><p>五个成长单元均已开放；学习证据会持续汇入成长档案和教师聚合看板。</p></div>
        <UnitOverviewList units={overview.units} />
      </section>
    </main>
  );
}
