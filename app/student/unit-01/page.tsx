import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Compass, DoorOpen, LockKeyhole, Play, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { getUnitOneMap } from "@/lib/server/program";
import { CAREER_ROLE_ASSETS } from "@/lib/visual-assets";

export const dynamic = "force-dynamic";

const sections = [
  { name: "传统农业馆", subtitle: "第一站 · 人力驱动・靠天吃饭", image: "/assets/unit-01/scenes/traditional-hall-v001.webp", time: "1980s" },
  { name: "现代农业馆", subtitle: "第二站 · 机械驱动・规模生产", image: "/assets/unit-01/scenes/modern-hall-v001.webp", time: "2000s" },
  { name: "智慧农业馆", subtitle: "第三站 · 数据驱动・精准高效", image: "/assets/unit-01/scenes/smart-hall-v001.webp", time: "NOW" },
  { name: "五岗位试岗", subtitle: "五个体验舱 · 找到真实工作感觉", image: "/assets/unit-01/scenes/career-hub-v001.webp", time: "CAREER" },
  { name: "职业测评", subtitle: "12 题测评 · 报告 · 角色卡", image: "/assets/global/scenes/project-home-v001.webp", time: "PROFILE" },
] as const;

const careerRoles = [
  ["助农主播", CAREER_ROLE_ASSETS.anchor.female],
  ["农场运营", CAREER_ROLE_ASSETS.farm.male],
  ["品牌策划", CAREER_ROLE_ASSETS.brand.female],
  ["电商运营", CAREER_ROLE_ASSETS.ops.male],
  ["新农人创业", CAREER_ROLE_ASSETS.founder.female],
] as const;

export default async function UnitOnePage() {
  const { student, unit, interactions, byInteraction, nextRoute } = await getUnitOneMap();
  const completed = (id: string) => byInteraction[id]?.status === "COMPLETED";
  const entryDone = completed("u01-entry-invitation");
  const sectionState = sections.map((section, sectionIndex) => {
    const items = interactions.filter((item) => item.section === section.name);
    const completedCount = items.filter((item) => completed(item.id)).length;
    const precedingComplete = sections.slice(0, sectionIndex).every((preceding) => {
      const precedingItems = interactions.filter((item) => item.section === preceding.name);
      return precedingItems.every((item) => completed(item.id));
    });
    const open = entryDone && precedingComplete;
    return { ...section, items, completedCount, open };
  });
  const mainComplete = sectionState.every((section) => section.completedCount === section.items.length);
  const sideSections = ["新农人故事馆", "职业初印象墙"].map((name) => ({ name, items: interactions.filter((item) => item.section === name) }));

  return <main className="page-shell unit-one-map"><AppHeader />
    <section className="unit-banner unit-one-banner"><Image src="/assets/unit-01/scenes/entry-hall-v001.webp" alt="第一单元时代展厅" fill priority sizes="100vw" /><div className="unit-banner-shade" /><div><span className="eyebrow"><Compass size={16} />第一单元 · 时代之门</span><h1>时代导航 生涯筑梦</h1><p>{student.displayName}，穿越农业发展的三个时代，完成五岗位试岗，并建立第一份职业角色卡。</p><Link className="primary-button compact" href={nextRoute}>{unit.status === "NOT_STARTED" ? "开始单元" : mainComplete ? "查看结业成果" : "继续当前任务"}<ArrowRight size={17} /></Link></div><div className="unit-progress-ring" style={{ "--progress": `${unit.progressPercent}%` } as React.CSSProperties}><strong>{unit.progressPercent}</strong><span>主线进度 %</span></div></section>
    <section className="era-route" aria-label="第一单元主线">
      <article className={`entry-route-row ${entryDone ? "done" : "active"}`}><span className="route-node"><DoorOpen size={21} /></span><div><span>序章</span><h2>智慧农业元宇宙邀请函</h2><p>与农小智会合，打开邀请函并进入时代展厅。</p></div><b>{entryDone ? <><CheckCircle2 size={16} />已进入</> : "等待进入"}</b><Link href="/student/unit-01/entry">{entryDone ? "再次查看" : "进入"}<ArrowRight size={16} /></Link></article>
      {sectionState.map((section) => <article className={`era-hall ${section.open ? "open" : "locked"}`} key={section.name}>
        <div className="era-hall-visual"><Image src={section.image} alt={section.name} fill sizes="(max-width: 800px) 100vw, 35vw" /><span>{section.time}</span></div>
        <div className="era-hall-content"><div className="era-hall-heading"><div><span>{section.subtitle}</span><h2>{section.name}</h2></div><b>{section.completedCount} / {section.items.length} 完成</b></div>
          {section.name === "五岗位试岗" && <div className="career-role-strip" aria-label="五个智慧农业职业形象">{careerRoles.map(([label, asset]) => <figure key={label}><Image alt={`${label}职业形象`} height={150} src={asset} width={100} /><figcaption>{label}</figcaption></figure>)}</div>}
          {section.open ? <div className="hall-interactions">{section.items.map((item) => { const isDone = completed(item.id); return <div className={isDone ? "done" : ""} key={item.id}><span className="interaction-icon">{isDone ? <CheckCircle2 size={19} /> : item.section === "五岗位试岗" ? <BriefcaseBusiness size={19} /> : <Sparkles size={19} />}</span><div><h3>{item.title}</h3><p>{item.type.replaceAll("-", " ")}</p><small><Clock3 size={13} />约 2-4 分钟{isDone ? " · 已形成学习证据" : ""}</small></div><Link aria-label={`进入${item.title}`} href={item.route}>{isDone ? <CheckCircle2 size={19} /> : <Play size={19} />}</Link></div>; })}</div>
          : <div className="hall-lock-message"><LockKeyhole /><b>完成上一模块后解锁</b><p>已完成的数据会自动保留，不需要重复操作。</p></div>}
        </div>
      </article>)}
      {mainComplete && <article className="unit-graduation"><div className="graduation-visual"><Image className="nxz-portrait" alt="农小智鼓励完成第一单元" height={175} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={166} /><span className="graduation-badge"><Image alt="" height={132} src="/assets/global/badges/base.svg" width={120} /><Image alt="时代认知徽章" height={132} src="/assets/unit-01/ui/badge-era-v001.svg" width={120} /></span></div><div><span>第一单元结业</span><h2>时代认知勋章</h2><p>你已完成三个时代馆、五岗位试岗和职业角色卡，主线学习证据已汇总。</p><Link className="primary-button compact" href="/student/progress">查看成长档案<ArrowRight size={17} /></Link></div><b><Sparkles />时代认知</b></article>}
    </section>
    <section className="unit-side-quests"><div className="section-title"><div><span>支线任务</span><h2>故事与认知变化</h2></div><b>不影响主线解锁</b></div><div>{sideSections.map((section) => <article key={section.name}><span>{section.name}</span><h3>{section.items.filter((item) => completed(item.id)).length} / {section.items.length} 完成</h3>{section.items.map((item, index) => { const compareLocked = item.id === "u01-impression-03-compare" && !mainComplete; return <div key={item.id}><b>{index + 1}</b><span>{item.title}</span>{compareLocked ? <LockKeyhole size={17} /> : <Link href={item.route}>{completed(item.id) ? <CheckCircle2 /> : <ArrowRight />}</Link>}</div>; })}</article>)}</div></section>
  </main>;
}
