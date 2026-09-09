import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartHandshake, LockKeyhole, MessageCircleHeart, Play, Scale, Sparkles, Sprout, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { getUnitThreeMap } from "@/lib/server/program";
import { getUnitThreeEvidence } from "@/lib/server/unit-three";

export const dynamic = "force-dynamic";

const sections = [
  { name: "职场沟通大厅", subtitle: "与上级、同事和客户有效沟通", image: "/assets/unit-03/scenes/communication-hall-v001.webp", icon: MessageCircleHeart },
  { name: "丰收节协作广场", subtitle: "共享设备分工、依赖协作与冲突整合", image: "/assets/unit-03/scenes/harvest-festival-v001.webp", icon: Users },
  { name: "矛盾调解室", subtitle: "在连续案情中练习原则与公正", image: "/assets/unit-03/scenes/mediation-room-v001.webp", icon: Scale },
  { name: "感恩之墙", subtitle: "书写、赠送并回应真实温暖", image: "/assets/unit-03/scenes/gratitude-wall-v001.webp", icon: HeartHandshake },
  { name: "和谐之门", subtitle: "由四类真实学习证据生成结业门", image: "/assets/unit-03/scenes/gratitude-wall-v001.webp", icon: Sparkles },
] as const;

export default async function UnitThreePage() {
  const [map, evidence] = await Promise.all([getUnitThreeMap(), getUnitThreeEvidence()]);
  const completed = new Set(evidence.completedInteractionIds);
  const mainInteractions = map.interactions.filter((item) => item.main);
  const mainComplete = mainInteractions.every((item) => completed.has(item.id));
  const sectionState = sections.map((section, sectionIndex) => {
    const items = map.interactions.filter((item) => item.section === section.name && item.main);
    const precedingComplete = sections.slice(0, sectionIndex).every((preceding) => map.interactions.filter((item) => item.section === preceding.name && item.main).every((item) => completed.has(item.id)));
    return { ...section, items, open: precedingComplete, completedCount: items.filter((item) => completed.has(item.id)).length };
  });
  const sideSections = [
    { name: "关系图谱花园", subtitle: "种植关系、分析风格、制定计划", image: "/assets/unit-03/scenes/relationship-garden-v001.webp", icon: Sprout },
    { name: "同理心剧场", subtitle: "翻牌选角、舞台演绎与导演复盘", image: "/assets/unit-03/scenes/empathy-theater-v001.webp", icon: MessageCircleHeart },
  ] as const;
  const nextRoute = mainInteractions.find((item) => !completed.has(item.id))?.route ?? "/student/unit-03";

  return <main className="page-shell unit-three-map"><AppHeader />
    <section className="unit-banner unit-three-banner"><Image alt="第三单元职场沟通大厅" fill priority sizes="100vw" src="/assets/unit-03/scenes/communication-hall-v001.webp" /><div className="unit-banner-shade" /><div className="u03-banner-copy"><span className="eyebrow"><HeartHandshake />第三单元 · 和谐职场</span><h1>和谐交往 快乐生活</h1><p>{map.student.displayName}，与农小智一起练习倾听、协作、调解与感恩，让能力和关系共同成长。</p><Link className="primary-button compact" href={nextRoute}>{map.unit.status === "NOT_STARTED" ? "进入沟通大厅" : mainComplete ? "查看和谐之门" : "继续当前任务"}<ArrowRight /></Link></div><Image className="u03-guide nxz-portrait" alt="农小智沟通教练" height={225} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={214} /><div className="unit-progress-ring" style={{ "--progress": `${map.unit.progressPercent}%` } as React.CSSProperties}><strong>{map.unit.progressPercent}</strong><span>主线进度 %</span></div></section>
    <section className="u03-route"><div className="section-title"><div><span>主关卡</span><h2>和谐职场 · 携手同行</h2></div><b>14 个主线交互</b></div>{sectionState.map((section, sectionIndex) => { const Icon = section.icon; return <article className={`u03-zone ${section.open ? "open" : "locked"}`} key={section.name}><div className="u03-zone-scene"><Image alt={section.name} fill sizes="(max-width: 800px) 100vw, 38vw" src={section.image} /><span>0{sectionIndex + 1}</span></div><div className="u03-zone-content"><header><Icon /><div><span>{section.subtitle}</span><h2>{section.name}</h2></div><b>{section.completedCount} / {section.items.length}</b></header>{section.open ? <div className="u03-interactions">{section.items.map((item, itemIndex) => { const done = completed.has(item.id); const itemOpen = section.items.slice(0, itemIndex).every((before) => completed.has(before.id)); return <div className={done ? "done" : itemOpen ? "current" : "locked"} key={item.id}><b>{done ? <CheckCircle2 /> : itemOpen ? <Play /> : <LockKeyhole />}</b><span><strong>{item.title}</strong><small>{item.type.replaceAll("-", " ")}</small></span>{itemOpen ? <Link aria-label={`进入${item.title}`} href={item.route}><ArrowRight /></Link> : <LockKeyhole />}</div>; })}</div> : <div className="hall-lock-message"><LockKeyhole /><b>完成上一场景后解锁</b><p>已有学习证据会自动保留。</p></div>}</div></article>; })}
      {mainComplete && <article className="u03-graduation"><Image className="nxz-portrait" alt="农小智祝贺完成第三单元" height={177} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={168} /><div><span>第三单元结业</span><h2>和谐使者徽章</h2><p>你已经完成沟通、协作、调解和感恩主线。关系能力来自一次次具体行动，不由单一选择贴标签。</p><Link className="primary-button compact" href="/student/progress">查看成长档案<ArrowRight /></Link></div><HeartHandshake /></article>}
    </section>
    <section className="u03-side-quests"><div className="section-title"><div><span>自主支线</span><h2>关系花园与同理心剧场</h2></div><b>不影响主线结业 · 可随时体验</b></div><div>{sideSections.map((section) => { const Icon = section.icon; const items = map.interactions.filter((item) => item.section === section.name); return <article key={section.name}><Image alt="" fill sizes="(max-width: 700px) 100vw, 45vw" src={section.image} /><div className="side-scene-shade" /><header><Icon /><div><span>{section.subtitle}</span><h3>{section.name}</h3></div><b>{items.filter((item) => completed.has(item.id)).length}/{items.length}</b></header>{items.map((item, index) => { const open = items.slice(0, index).every((before) => completed.has(before.id)); return <div key={item.id}><span>{index + 1}</span><b>{item.title}</b>{open ? <Link href={item.route}>{completed.has(item.id) ? <CheckCircle2 /> : <ArrowRight />}</Link> : <LockKeyhole />}</div>; })}</article>; })}</div></section>
  </main>;
}
