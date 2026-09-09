"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, MonitorPlay, Plus, Radio, UsersRound } from "lucide-react";
import { CLASSROOM_STAGES, LESSON_STATUS_LABEL, type LessonListItem } from "@/lib/classroom";

type LobbyData = { classes: Array<{ id: string; name: string }>; lessons: LessonListItem[] };
export function ClassroomLobby({ initial, teacher }: { initial: LobbyData; teacher: boolean }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [classId, setClassId] = useState(initial.classes[0]?.id ?? "");
  const [rehearsal, setRehearsal] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/classroom?view=${teacher ? "teacher" : "student"}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error();
        const next = await response.json() as LobbyData;
        if (!stopped) { setData(next); setOffline(false); }
      } catch { if (!stopped) setOffline(true); }
      if (!stopped) timer = setTimeout(refresh, 3000);
    };
    void refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, [teacher]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch("/api/classroom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, rehearsal }), signal: AbortSignal.timeout(10_000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(`/teacher/classroom/${result.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "创建失败，请重试"); setPending(false); }
  }
  const active = data.lessons.filter(item => item.status !== "ENDED");
  const ended = data.lessons.filter(item => item.status === "ENDED");
  return <main className="classroom-lobby">
    <header className="classroom-heading"><span className="classroom-eyebrow"><Radio size={17} />第五单元 · 面对行业变化</span><h1>{teacher ? "课堂控制台" : "进入课堂"}</h1><p>{teacher ? "从一次共同的观察开始，带领全班读懂变化、寻找方向。" : "找到老师开启的课堂，和同学一起准备迎接新的挑战。"}</p></header>
    {offline && <p role="status" className="classroom-notice">暂时无法连接，正在重试。课堂列表可能不是最新状态。</p>}
    {teacher && <form className="classroom-create" onSubmit={create}><div className="classroom-create-icon"><MonitorPlay /></div><div><h2>开启一节新课堂</h2><p>选好班级后，学生即可从自己的课堂入口加入。</p></div><label>授课班级<select value={classId} onChange={e => setClassId(e.target.value)} required><option value="" disabled>选择班级</option>{data.classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>课堂类型<select value={rehearsal ? "rehearsal" : "formal"} onChange={e => setRehearsal(e.target.value === "rehearsal")}><option value="rehearsal">演练课堂</option><option value="formal">正式课堂</option></select></label><button className="classroom-primary" disabled={pending || !classId || offline}><Plus size={18} />{pending ? "正在创建…" : "创建课堂"}</button></form>}
    {error && <p className="classroom-error" role="alert">{error}</p>}
    <div className="classroom-section-heading"><h2>当前课堂</h2><span>{active.length} 节开放中 · 自动更新</span></div>
    {active.length ? <div className="classroom-cards">{active.map(item => <LessonCard key={item.id} item={item} teacher={teacher} />)}</div> : <div className="classroom-empty"><UsersRound size={38} /><h3>{teacher ? "还没有开放的课堂" : "等待老师开启课堂"}</h3><p>{teacher ? "创建后可查看学生到场情况，再开始授课。" : "老师开课后会自动出现在这里，不需要完成前面的自主关卡。"}</p><span className="classroom-pulse" />{!data.classes.length && <p>当前账号尚未关联有效班级，请联系教师。</p>}</div>}
    <section className="classroom-outline"><span className="classroom-eyebrow">这节课，我们将一起经历</span><div>{CLASSROOM_STAGES.map((stage, index) => <article key={stage.key}><b>0{index + 1}</b><strong>{stage.title}</strong><small>{stage.subtitle}</small></article>)}</div></section>
    {!!ended.length && <><div className="classroom-section-heading"><h2>最近结束的课堂</h2><span>记录已保留</span></div><div className="classroom-cards">{ended.map(item => <LessonCard key={item.id} item={item} teacher={teacher} />)}</div></>}
    <p className="classroom-footnote">当前开放课堂候场、阶段同步、行业冲击、班级观察统计与三条路径参考。角色决策与协作任务将按后续步骤开放。</p>
  </main>;
}
function LessonCard({ item, teacher }: { item: LessonListItem; teacher: boolean }) {
  return <article className={`classroom-card ${item.status === "ENDED" ? "is-ended" : ""}`}><div className="classroom-card-top"><span className="classroom-tag">{item.rehearsal ? "演练课堂" : "正式课堂"}</span><span>{LESSON_STATUS_LABEL[item.status]}</span></div><h3>面对行业变化</h3><p>{item.className}</p><small>{new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false })} · {CLASSROOM_STAGES[item.stage].title}</small><Link className="classroom-card-link" href={`/${teacher ? "teacher" : "student"}/classroom/${item.id}`}>{item.status === "ENDED" ? "查看课堂" : teacher ? "进入控制台" : "进入课堂"}<ArrowRight size={18} /></Link></article>;
}
