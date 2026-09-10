"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDownRight, BellRing, Check, ChevronRight, Eye, MessageCircle, Phone, Radio, Sprout, Volume2, VolumeX, X } from "lucide-react";
import { IMPACT_REGIONS, IMPACT_SCRIPT, impactScene, impactTime, type ImpactRegion } from "@/lib/classroom-impact";
import type { LessonSnapshot } from "@/lib/classroom";
import type { useImpactObservations } from "@/components/impact-observations";

export function ClassroomImpact({ data, now, view, connected, tracking }: { data: LessonSnapshot; now: number; view: "student" | "teacher" | "screen"; connected: boolean; tracking: ReturnType<typeof useImpactObservations> }) {
  const elapsed = impactTime(data.impact, now);
  const started = data.impact.startedAt !== null;
  const running = data.status === "RUNNING" && connected && data.impactClosedAt === null;
  const scene = impactScene(elapsed, started);
  const [selected, setSelected] = useState<ImpactRegion | null>(null);
  const [viewed, setViewed] = useState<ImpactRegion[]>([]);
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState("");
  useEffect(() => {
    if (!data.ownSessionId) return;
    const timer = setTimeout(() => { try { const items = JSON.parse(localStorage.getItem(`impact-viewed:${data.ownSessionId}`) || "[]"); if (Array.isArray(items)) setViewed(items.filter(item => typeof item === "string" && item in IMPACT_REGIONS)); } catch {} }, 0);
    return () => clearTimeout(timer);
  }, [data.ownSessionId]);
  const audio = useRef<HTMLAudioElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const cue = useRef({ news: false, farmer: false });
  const voicePlaying = sound && running && scene.speaking;
  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    if (!voicePlaying) { element.pause(); return; }
    const expected = Math.max(0, (elapsed - 13200) / 1000);
    if (Number.isFinite(element.duration) && expected >= element.duration) { element.pause(); return; }
    if (Math.abs(element.currentTime - expected) > 0.65) element.currentTime = expected;
    if (element.paused) void element.play().catch(() => setSoundError("声音未能播放，请点击声音按钮重试；字幕始终可读。"));
  }, [voicePlaying, elapsed]);
  useEffect(() => {
    const context = audioContext.current;
    function tone(frequency: number, delay: number) {
      if (!context) return;
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.frequency.value = frequency; oscillator.connect(gain); gain.connect(context.destination);
      const start = context.currentTime + delay;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.06, start + .02); gain.gain.exponentialRampToValueAtTime(.001, start + .25);
      oscillator.start(start); oscillator.stop(start + .3);
    }
    if (sound && running && scene.news && !cue.current.news && elapsed < 1500) { tone(880, 0); tone(1174, .15); }
    if (sound && running && scene.calling && !cue.current.farmer) { tone(660, 0); tone(880, .3); tone(660, .6); }
    cue.current = { news: scene.news, farmer: scene.farmer };
  }, [sound, running, scene.news, scene.calling, scene.farmer, elapsed]);
  useEffect(() => { const element = audio.current; return () => { element?.pause(); void audioContext.current?.close(); }; }, []);
  async function toggleSound() {
    if (sound) { setSound(false); audio.current?.pause(); return; }
    try {
      audioContext.current ??= new AudioContext();
      await audioContext.current.resume();
      const element = audio.current;
      if (element) { element.muted = true; await element.play(); element.pause(); element.currentTime = 0; element.muted = false; }
      setSound(true); setSoundError("");
    } catch { setSoundError("当前设备暂不能播放声音，请重试；可继续阅读同步字幕。"); }
  }
  function open(region: ImpactRegion) {
    tracking.view(region); tracking.enter(region); setSelected(region);
    const next = viewed.includes(region) ? viewed : [...viewed, region];
    setViewed(next);
    try { if (data.ownSessionId) localStorage.setItem(`impact-viewed:${data.ownSessionId}`, JSON.stringify(next)); } catch {}
  }
  function focusProps(region: ImpactRegion) {
    return { onPointerEnter: () => tracking.enter(region), onPointerLeave: tracking.leave, onFocus: () => tracking.enter(region), onBlur: tracking.leave, onClick: () => open(region) };
  }
  return <section className={`impact-experience ${running ? "" : "impact-paused"}`} aria-label="行业冲击情境">
    <audio ref={audio} src="/assets/unit-05/audio/farmer-impact-v001.mp3" preload="auto" onError={() => setSoundError("配音加载失败，可继续阅读字幕并重试加载。")} />
    <div className="impact-toolbar"><span><Radio size={15} />云禾助农直播间 <em>教学情境</em></span><button onClick={() => void toggleSound()} aria-pressed={sound}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}{sound ? "关闭声音" : "开启声音"}</button></div>
    {soundError && <p className="impact-audio-error" role="status">{soundError}</p>}
    <div className="impact-stage" data-testid="impact-scene" data-moment={scene.observing ? "observing" : scene.team ? "team" : scene.farmer ? "farmer" : scene.falling ? "falling" : started ? "news" : "idle"}>
      <div className="impact-broadcast">
        <div className="impact-camera">
          <div className="impact-studio"><Image src="/assets/unit-05/scenes/impact-live-studio-v002.webp" alt="助农主播在田野旁的直播工作台展示西瓜，身旁是瓜筐、打包箱、手机支架和补光灯" fill sizes="(max-width: 800px) 100vw, (max-width: 1400px) 65vw, 55vw" priority /><div className="impact-studio-shade" /></div>
          <button className={`impact-audience ${scene.falling ? "falling" : ""} ${started && elapsed >= 10000 && elapsed < 11500 ? "impact-flash" : ""}`} {...focusProps("audience")} aria-label="查看直播间人数变化">
            <span><i />直播间人数<ChevronRight size={13} /></span>
            <div className="impact-audience-value"><strong data-testid="impact-audience">{scene.audience.toLocaleString("en-US")}</strong><AudienceTrend elapsed={started ? elapsed : 0} /></div>
            <small>{scene.falling ? <><ArrowDownRight size={13} />较开始减少 {(3000 - scene.audience).toLocaleString("en-US")} 人</> : "直播中 · 云禾助农"}</small>
          </button>
          <div className="impact-comments" key={scene.falling ? "negative" : "positive"} aria-label="直播间弹幕">
            <p><b>小满</b>{scene.falling ? "隔壁 AI 直播间还在发优惠！" : "支持助农，西瓜看着真新鲜！"}</p>
            <p><b>田野</b>{scene.falling ? "怎么一下子少了这么多人？" : "去年买过，沙瓤特别甜。"}</p>
            <p><b>小夏</b>{scene.falling ? "我先去别的直播间看看……" : "主播讲讲种瓜的故事吧！"}</p>
          </div>
          {started && !running && <div className="impact-pause-label">{data.status === "ENDED" ? "课堂已结束 · 情境记录保留" : !connected ? "正在恢复同步" : data.impactClosedAt !== null ? "观察已结束 · 跟随老师讨论" : "情境已暂停 · 跟随老师安排"}</div>}
        </div>
        <div className="impact-product">
          <Image src="/assets/unit-05/props/watermelon-v002.webp" alt="蜜沙瓤西瓜产品情境图" width={64} height={64} />
          <div><small>今日助农好物</small><b>本地蜜沙瓤西瓜</b><span>产地直发 · 产品情境图</span></div>
          <p>“咱们本地的蜜沙瓤西瓜，<br />现摘现发，甜到心里！”</p>
        </div>
      </div>
      <div className="impact-event-stack" aria-label="运营消息">
        {!started && <div className="impact-waiting"><Sprout size={32} /><span>你的身份</span><h3>云禾助农直播团队<br />运营助理</h3><p>{data.status === "WAITING" ? "准备好，一起走进今天的直播现场。" : "直播正在进行，等待老师点击“开始冲击”。"}</p><div><Eye size={17} /><span>留意人数、消息和团队声音<br />点击出现的事件，查看变化</span></div></div>}
        {scene.news && <button className="impact-news impact-appear" {...focusProps("news")}>
          <span><BellRing size={18} />行业快讯 <em>情境模拟新闻</em></span>
          <div className="impact-news-image"><Image src="/assets/unit-05/scenes/ai-host-news-v002.webp" alt="AI数字主播演播室情境配图" fill sizes="(max-width: 800px) 90vw, 400px" /></div>
          <h3>AI 数字主播全面上线</h3><p>{IMPACT_SCRIPT.news}</p><small>查看这条变化信号 <ChevronRight size={14} /></small>
        </button>}
        {scene.farmer && <button className={`impact-call impact-appear ${scene.calling ? "ringing" : ""} ${scene.speaking ? "speaking" : ""}`} {...focusProps("farmer")}>
          <span className="impact-contact">张</span><div><h3>张大叔 <small>合作瓜农</small></h3><span>{scene.calling ? "语音来电 · 即将接通" : scene.speaking ? "通话中 · 同步字幕" : "通话记录 · 点击回看"}</span></div><span className="impact-phone-icon"><Phone size={19} /></span>
          {!scene.calling && <p>{IMPACT_SCRIPT.farmer}</p>}
          <span className="impact-wave" aria-hidden="true">{Array.from({ length: 19 }, (_, i) => <i key={i} style={{ height: `${[5, 9, 17, 8, 13, 21, 10][i % 7]}px`, animationDelay: `${i * -.11}s` }} />)}</span>
        </button>}
        {scene.team && <button className="impact-chat impact-appear" {...focusProps("team")}><span><MessageCircle size={18} />云禾运营团队 <em>{scene.secondMessage ? "2" : "1"} 条新消息</em></span><p><b>李</b><span><small>小李</small>{IMPACT_SCRIPT.team[0]}</span></p>{scene.secondMessage && <p className="impact-appear"><b>陈</b><span><small>团队成员</small>{IMPACT_SCRIPT.team[1]}</span></p>}</button>}
      </div>
    </div>
    <div className="impact-guide"><Image src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={64} height={68} /><div><b>{scene.observing ? "先看清变化，再思考怎么办" : "农小智陪你观察"}</b><p>{scene.observing ? "请观察你的直播间发生了什么。点击上方事件回看：哪一个变化最让你在意？" : "留意直播间的人数、消息和团队声音。你可以点击已经出现的事件，查看发生了什么。"}</p></div>{scene.observing && <Eye size={22} />}</div>
    {view === "student" && <div className="impact-observation"><div>{(Object.keys(IMPACT_REGIONS) as ImpactRegion[]).map(region => <span key={region} className={viewed.includes(region) ? "viewed" : ""}>{viewed.includes(region) && <Check size={12} />}{IMPACT_REGIONS[region]}</span>)}</div><small role="status">{data.impactClosedAt !== null && data.ownImpactSynced ? "观察记录已汇总，跟随老师讨论" : data.ownJoined ? tracking.saveStatus : "加入课堂后可记录观察"} · 只记录操作关注，不代表真实视线或心理测评</small></div>}
    {view === "teacher" && <p className="impact-teacher-note"><Activity size={15} />学生观察记录自动保存；情境结束后可查看班级数据。</p>}
    {selected && <ImpactDetail region={selected} onAttend={() => tracking.enter(selected)} onLeave={tracking.leave} onClose={() => { tracking.leave(); setSelected(null); }} audience={scene.audience} />}
  </section>;
}
function ImpactDetail({ region, onClose, onAttend, onLeave, audience }: { region: ImpactRegion; onClose: () => void; onAttend: () => void; onLeave: () => void; audience: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className="impact-detail" aria-labelledby="impact-detail-title" onFocus={onAttend} onPointerEnter={onAttend} onPointerLeave={onLeave} onCancel={event => { event.preventDefault(); onClose(); }}><button className="impact-detail-close" aria-label="关闭事件详情" onClick={onClose}><X /></button><span>观察事件 · 教学情境</span><h2 id="impact-detail-title">{IMPACT_REGIONS[region]}</h2>{region === "audience" ? <><strong>{audience.toLocaleString("en-US")} 人</strong><p>直播开始时有 3,000 人在线。请留意人数的变化，想一想，它可能与哪些事件有关？</p></> : region === "team" ? IMPACT_SCRIPT.team.map((text, index) => <p key={text}><b>{index ? "团队成员" : "小李"}：</b>{text}</p>) : <p>{IMPACT_SCRIPT[region]}</p>}<div className="impact-detail-question">这个变化，可能给团队带来什么影响？先留住你的观察，稍后一起讨论。</div><button className="classroom-primary" onClick={onClose}>继续观察</button></dialog>;
}
function AudienceTrend({ elapsed }: { elapsed: number }) {
  const duration = Math.min(elapsed, 10000);
  const times = [0, 2000, 3000, 4400, 5800, 7200, 8600, 10000].filter(time => time < duration);
  times.push(duration);
  const points = times.map(time => `${4 + time / 10000 * 66},${5 + (3000 - impactScene(time).audience) / 2800 * 28}`).join(" ");
  const lastY = 5 + (3000 - impactScene(duration).audience) / 2800 * 28;
  return <svg className="impact-trend" viewBox="0 0 76 40" aria-hidden="true"><path d="M4 36H72" stroke="currentColor" opacity=".2" /><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /><circle cx={4 + duration / 10000 * 66} cy={lastY} r="3" fill="currentColor" /></svg>;
}
