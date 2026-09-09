import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, HeartHandshake, Leaf, LockKeyhole, MessageCircleHeart, Play, ShieldCheck, Sparkles, Sprout, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { getUnitTwoMap } from "@/lib/server/program";
import { getUnitTwoEvidence } from "@/lib/server/unit-two";
import { getCareerRoleAsset } from "@/lib/visual-assets";

export const dynamic = "force-dynamic";

const sections = [
  { name: "自我认知镜像屋", subtitle: "看见闪光点与成长空间", image: "/assets/unit-02/scenes/mirror-house-v001.webp", icon: BrainCircuit },
  { name: "挫折模拟田野", subtitle: "从情绪涌现走向有效行动", image: "/assets/unit-02/scenes/frustration-field-v001.webp", icon: ShieldCheck },
  { name: "情绪管理实验室", subtitle: "识别、表达与调节", image: "/assets/unit-02/scenes/emotion-lab-v001.webp", icon: HeartHandshake },
  { name: "青春花园", subtitle: "共享设备协作与成果展评", image: "/assets/unit-02/scenes/youth-garden-v001.webp", icon: Users },
  { name: "成长之树", subtitle: "用真实数据生成成长总结", image: "/assets/unit-02/scenes/youth-garden-v001.webp", icon: Sprout },
] as const;

export default async function UnitTwoPage() {
  const [map, evidence] = await Promise.all([getUnitTwoMap(), getUnitTwoEvidence()]);
  const completed = new Set(evidence.completedInteractionIds);
  const mainInteractions = map.interactions.filter((item) => item.main);
  const mainComplete = mainInteractions.every((item) => completed.has(item.id));
  const roleParts = evidence.avatar.split("-");
  const avatar = getCareerRoleAsset(roleParts[0], roleParts[1] === "male" ? "male" : "female");
  const sectionState = sections.map((section, sectionIndex) => {
    const items = map.interactions.filter((item) => item.section === section.name && item.main);
    const precedingComplete = sections.slice(0, sectionIndex).every((preceding) => map.interactions.filter((item) => item.section === preceding.name && item.main).every((item) => completed.has(item.id)));
    return { ...section, items, open: precedingComplete, completedCount: items.filter((item) => completed.has(item.id)).length };
  });
  const nextRoute = mainInteractions.find((item) => !completed.has(item.id))?.route ?? "/student/unit-02";
  const sideSections = [{ name: "心灵树洞", image: "/assets/unit-02/scenes/tree-hole-v001.webp", icon: MessageCircleHeart }, { name: "情绪能量站", image: "/assets/unit-02/scenes/energy-station-v001.webp", icon: Sparkles }] as const;

  return <main className="page-shell unit-two-map"><AppHeader />
    <section className="unit-banner unit-two-banner"><Image alt="第二单元自我探索中心" fill priority sizes="100vw" src="/assets/unit-02/scenes/mirror-house-v001.webp" /><div className="unit-banner-shade" /><div className="u02-banner-copy"><span className="eyebrow"><HeartHandshake />第二单元 · 自我探索</span><h1>认识自我 健康成长</h1><p>{map.student.displayName}，以{evidence.role}身份认识自己的闪光点，练习面对挫折、表达情绪并与伙伴协作。</p><Link className="primary-button compact" href={nextRoute}>{map.unit.status === "NOT_STARTED" ? "开始镜像探索" : mainComplete ? "查看成长之树" : "继续当前任务"}<ArrowRight /></Link></div><div className="u02-role-mirror"><Image alt={`${evidence.role}职业形象`} height={300} src={avatar} width={190} /><span>{evidence.role}</span></div><div className="unit-progress-ring" style={{ "--progress": `${map.unit.progressPercent}%` } as React.CSSProperties}><strong>{map.unit.progressPercent}</strong><span>主线进度 %</span></div></section>
    <section className="u02-route"><div className="section-title"><div><span>主关卡</span><h2>自我探索 · 心灵成长</h2></div><b>15 个主线交互</b></div>{sectionState.map((section, sectionIndex) => { const Icon = section.icon; return <article className={`u02-zone ${section.open ? "open" : "locked"}`} key={section.name}><div className="u02-zone-scene"><Image alt={section.name} fill sizes="(max-width: 800px) 100vw, 34vw" src={section.image} /><span>0{sectionIndex + 1}</span></div><div className="u02-zone-content"><header><Icon /><div><span>{section.subtitle}</span><h2>{section.name}</h2></div><b>{section.completedCount} / {section.items.length}</b></header>{section.open ? <div className="u02-interactions">{section.items.map((item, itemIndex) => { const done = completed.has(item.id); const itemOpen = section.items.slice(0, itemIndex).every((before) => completed.has(before.id)); return <div className={done ? "done" : itemOpen ? "current" : "locked"} key={item.id}><b>{done ? <CheckCircle2 /> : itemOpen ? <Play /> : <LockKeyhole />}</b><span><strong>{item.title}</strong><small>{item.type.replaceAll("-", " ")}</small></span>{itemOpen ? <Link aria-label={`进入${item.title}`} href={item.route}><ArrowRight /></Link> : <LockKeyhole />}</div>; })}</div> : <div className="hall-lock-message"><LockKeyhole /><b>完成上一场景后解锁</b><p>已有学习证据会自动保留。</p></div>}</div></article>; })}
      {mainComplete && <article className="u02-graduation"><Image className="nxz-portrait" alt="农小智祝贺完成第二单元" height={177} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={168} /><div><span>第二单元结业</span><h2>心灵成长徽章</h2><p>你已经完成自我认识、挫折应对、情绪管理和团队协作主线。徽章表示练习完成，不是心理健康等级。</p><Link className="primary-button compact" href="/student/progress">查看成长档案<ArrowRight /></Link></div><Leaf /></article>}
    </section>
    <section className="u02-side-quests"><div className="section-title"><div><span>自主支线</span><h2>树洞与能量工具</h2></div><b>不影响主线结业 · 可随时体验</b></div><div>{sideSections.map((section) => { const Icon = section.icon; const items = map.interactions.filter((item) => item.section === section.name); return <article key={section.name}><Image alt="" fill sizes="(max-width: 700px) 100vw, 45vw" src={section.image} /><div className="side-scene-shade" /><header><Icon /><div><span>自主选择</span><h3>{section.name}</h3></div><b>{items.filter((item) => completed.has(item.id)).length}/{items.length}</b></header>{items.map((item, index) => { const open = items.slice(0, index).every((before) => completed.has(before.id)); return <div key={item.id}><span>{index + 1}</span><b>{item.title}</b>{open ? <Link href={item.route}>{completed.has(item.id) ? <CheckCircle2 /> : <ArrowRight />}</Link> : <LockKeyhole />}</div>; })}</article>; })}</div></section>
  </main>;
}
