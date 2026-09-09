"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Check, ChevronLeft, ChevronRight, CircleStop, Droplets, Gauge, Heart, Leaf, LoaderCircle, Mic, Pause, Play, Radio, ScanLine, Send, Sprout, ThermometerSun, Truck, Wind } from "lucide-react";
import type { UnitOneInteraction } from "@/lib/curriculum";
import { calculateCareerProfile, CAREER_QUESTIONS } from "@/lib/game/career-assessment";
import { CareerRadar } from "@/components/career-radar";
import { DISEASE_SAMPLE_ASSETS, getCareerRoleAsset, type CareerAvatarGender, type CareerRoleId } from "@/lib/visual-assets";

export type OperationResult = {
  summary: Record<string, boolean | number | string>;
  privateContent?: Record<string, string | string[]>;
};

type Props = {
  interaction: UnitOneInteraction;
  evidence: Record<string, unknown>;
  onComplete: (result: OperationResult) => void | Promise<void>;
  pending?: boolean;
};

function CareerRoleVisual({ roleId, gender, label, product = false }: { roleId: CareerRoleId; gender: CareerAvatarGender; label: string; product?: boolean }) {
  return <figure className="job-role-visual">
    <Image alt={`${label}标准形象`} height={420} src={getCareerRoleAsset(roleId, gender)} width={280} />
    <figcaption><small>本岗位标准形象</small><strong>{label}</strong></figcaption>
    {product && <Image alt="高山番茄产品展示" className="job-product-visual" height={210} src="/assets/global/props/tomato-display-v001.png" width={360} />}
  </figure>;
}

export function UnitOneOperation(props: Props) {
  switch (props.interaction.type) {
    case "harvester-simulation": return <HarvesterOperation {...props} />;
    case "greenhouse-control": return <GreenhouseOperation {...props} />;
    case "irrigation-control": return <IrrigationOperation {...props} />;
    case "drone-flight": return <DroneOperation {...props} />;
    case "sensor-console": return <SensorOperation {...props} />;
    case "ai-scan": return <AiScanOperation {...props} />;
    case "live-pitch": return <LivePitchOperation {...props} />;
    case "farm-operator": return <FarmOperatorOperation {...props} />;
    case "brand-slogan": return <BrandOperation {...props} />;
    case "order-fulfillment": return <CommerceOperation {...props} />;
    case "venture-choice": return <FounderOperation {...props} />;
    case "career-assessment": return <AssessmentOperation {...props} />;
    case "career-report": return <ReportOperation {...props} />;
    case "role-card": return <RoleCardOperation {...props} />;
    case "story-selection": return <StorySelectionOperation {...props} />;
    case "story-media": return <StoryMediaOperation {...props} />;
    case "reflection-card": return <ReflectionOperation {...props} />;
    case "original-notes": return <OriginalNotesOperation {...props} />;
    case "impression-wall": return <ImpressionWallOperation {...props} />;
    case "impression-compare": return <ImpressionCompareOperation {...props} />;
    default: return null;
  }
}

function HarvesterOperation({ onComplete }: Props) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  return <div className="operation-panel harvester-console">
    <div className={`harvester-field ${running ? "running" : ""} ${done ? "done" : ""}`}><div className="crop-before" /><div className="crop-after" /><div className="harvester-machine"><Image alt="联合收割机" height={750} priority src="/assets/global/props/harvester-v001.png" width={1517} /></div></div>
    <div className="operation-readouts"><span><b>{done ? "10.0" : running ? "作业中" : "0.0"}</b>亩</span><span><b>{running || done ? "10" : "0"}</b>亩/小时</span><span><b>{done ? "3" : running ? "同步" : "0"}</b>道工序</span></div>
    <button className="primary-button" disabled={running || done} onClick={() => setRunning(true)}>{running ? "联合收割作业中…" : "启动联合收割机"}<Play size={17} /></button>
    {running && <div className="harvester-timer" onAnimationEnd={() => { setRunning(false); setDone(true); }} />}
    {done && <button className="primary-button" onClick={() => onComplete({ summary: { animationCompleted: true, acres: 10, processes: 3 } })}>查看作业讲解<ChevronRight size={17} /></button>}
  </div>;
}

function GreenhouseOperation({ onComplete }: Props) {
  const [temperature, setTemperature] = useState(18);
  const [ventilation, setVentilation] = useState(25);
  const [changes, setChanges] = useState(0);
  const healthy = temperature >= 20 && temperature <= 30 && ventilation >= 40 && ventilation <= 80;
  return <div className="operation-panel greenhouse-console">
    <div className={`digital-plant ${healthy ? "healthy" : ""}`}><Sprout /><i /><i /><i /></div>
    <label><span><ThermometerSun size={17} />温度<b>{temperature}℃</b></span><input max="35" min="15" onChange={(event) => { setTemperature(Number(event.target.value)); setChanges((value) => value + 1); }} type="range" value={temperature} /></label>
    <label><span><Wind size={17} />通风量<b>{ventilation}%</b></span><input max="100" min="0" onChange={(event) => { setVentilation(Number(event.target.value)); setChanges((value) => value + 1); }} type="range" value={ventilation} /></label>
    <div className={`parameter-status ${healthy ? "valid" : ""}`}><i />{healthy ? "环境参数正常，叶片舒展" : "继续调节至适宜区间"}</div>
    <button className="primary-button" disabled={!changes} onClick={() => onComplete({ summary: { adjusted: true, parametersInRange: healthy, temperature, ventilation, adjustmentCount: changes } })}>提交控制参数<ChevronRight size={17} /></button>
  </div>;
}

function IrrigationOperation({ onComplete }: Props) {
  const [flowing, setFlowing] = useState(false);
  const [ready, setReady] = useState(false);
  function openValve() { setFlowing(true); window.setTimeout(() => setReady(true), 2600); }
  return <div className="operation-panel irrigation-console">
    <div className={`pipe-system ${flowing ? "flowing" : ""}`}><button aria-label="开启水肥阀门" className="valve" disabled={flowing} onClick={openValve}><i /><b /></button><div className="pipe"><i /><i /><i /><i /></div><div className="root-zone"><Sprout /><Droplets /></div></div>
    <div className="water-compare"><span>传统漫灌<strong>500<small>吨</small></strong></span><i><b style={{ width: flowing ? "20%" : "100%" }} /></i><span>精准滴灌<strong>{flowing ? 100 : 0}<small>吨</small></strong></span></div>
    {!flowing && <p>旋转阀门，启动根区精准供给。</p>}
    {ready && <button className="primary-button" onClick={() => onComplete({ summary: { valveOpened: true, waterBefore: 500, waterAfter: 100, savingPercent: 80 } })}>查看节水讲解<ChevronRight size={17} /></button>}
  </div>;
}

function DroneOperation({ onComplete }: Props) {
  const [flying, setFlying] = useState(false);
  const [done, setDone] = useState(false);
  return <div className="operation-panel drone-console">
    <div className="drone-map"><svg aria-hidden="true" viewBox="0 0 600 240"><path d="M45 185 C120 30 225 35 280 142 S470 235 555 55" /></svg><div className={`code-drone ${flying ? "flying" : ""}`} onAnimationEnd={() => { setFlying(false); setDone(true); }}><Image alt="植保无人机" height={832} priority src="/assets/global/props/drone-v001.png" width={1458} /></div>{flying && <div className="spray-trail" />}</div>
    <div className="operation-readouts"><span><b>{done ? "100" : "--"}</b>亩/小时</span><span><b>{done ? "90" : "--"}</b>% 利用率</span><span><b>{done ? "完成" : flying ? "飞行中" : "待起飞"}</b>航线</span></div>
    {!done ? <button className="primary-button" disabled={flying} onClick={() => setFlying(true)}>{flying ? "按预设航线喷洒中…" : "起飞并执行航线"}<Play size={17} /></button> : <button className="primary-button" onClick={() => onComplete({ summary: { flightCompleted: true, acresPerHour: 100, utilizationRate: 90, parametersViewed: true } })}>查看智慧植保讲解<ChevronRight size={17} /></button>}
  </div>;
}

function SensorOperation({ onComplete }: Props) {
  const [connected, setConnected] = useState(false);
  const [viewed, setViewed] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => { if (!connected) return; const timer = window.setInterval(() => setTick((value) => value + 1), 5000); return () => window.clearInterval(timer); }, [connected]);
  const data = [{ id: "climate", label: "温湿度", value: `${23 + tick % 2}℃ · ${61 + tick % 3}%` }, { id: "nutrient", label: "氮磷钾", value: `${42 + tick}/${28 + tick}/${36 - tick % 2}` }, { id: "ph", label: "pH", value: (6.4 + tick % 2 * .1).toFixed(1) }];
  function view(id: string) { setViewed((items) => items.includes(id) ? items : [...items, id]); }
  return <div className="operation-panel sensor-console">
    <button className={`soil-probe ${connected ? "connected" : ""}`} onClick={() => setConnected(true)}><Image alt="田间土壤传感器" height={1354} priority src="/assets/global/props/soil-sensor-v001.png" width={465} /><span><Radio size={17} />{connected ? "传感器已连接" : "点击连接土壤传感器"}</span></button>
    <div className="sensor-link"><i /></div>
    <div className="sensor-screen"><header><Activity size={17} />田间数据终端<small>每 5 秒更新</small></header><nav>{data.map((item) => <button className={viewed.includes(item.id) ? "viewed" : ""} disabled={!connected} key={item.id} onClick={() => view(item.id)}>{item.label}</button>)}</nav><strong>{connected ? data.find((item) => item.id === viewed.at(-1))?.value ?? "选择数据" : "等待连接"}</strong></div>
    <button className="primary-button" disabled={viewed.length < 2} onClick={() => onComplete({ summary: { datasetsViewed: viewed.length >= 2, datasetCount: viewed.length, updateCycles: tick } })}>完成数据巡检<ChevronRight size={17} /></button>
  </div>;
}

function AiScanOperation({ onComplete }: Props) {
  const samples = [{ id: "leaf-spot", label: "番茄叶斑", asset: DISEASE_SAMPLE_ASSETS["leaf-spot"] }, { id: "powdery", label: "黄瓜白粉", asset: DISEASE_SAMPLE_ASSETS.powdery }, { id: "rust", label: "小麦锈病", asset: DISEASE_SAMPLE_ASSETS.rust }];
  const [selected, setSelected] = useState(samples[0]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(false);
  function scan() { setScanning(true); setResult(false); window.setTimeout(() => { setScanning(false); setResult(true); }, 3000); }
  return <div className="operation-panel scan-console">
    <div className="sample-list">{samples.map((sample) => <button className={selected.id === sample.id ? "active" : ""} key={sample.id} onClick={() => { setSelected(sample); setResult(false); }}><i><Image alt="" fill sizes="46px" src={sample.asset} /></i><span>{sample.label}</span></button>)}</div>
    <div className={`scan-viewport ${scanning ? "scanning" : ""}`}><div className="leaf-sample"><Image alt={`${selected.label}教学观察样本`} fill priority sizes="(max-width: 650px) 90vw, 520px" src={selected.asset} /></div>{scanning && <ScanLine />}{result && <div className="diagnosis"><span>预设图像仿真</span><b>{selected.label}</b><p>程度：中等 · 建议：复核田间分布，优先采用综合防治。</p></div>}</div>
    {!result ? <button className="primary-button" disabled={scanning} onClick={scan}>{scanning ? "AI 扫描 3 秒…" : "启动预设识别"}<ScanLine size={17} /></button> : <button className="primary-button" onClick={() => onComplete({ summary: { scanCompleted: true, sampleId: selected.id, scanDurationMs: 3000, planViewed: true } })}>查看识别讲解<ChevronRight size={17} /></button>}
  </div>;
}

function LivePitchOperation({ onComplete }: Props) {
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const started = useRef(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  async function toggleRecord() {
    if (recording && recorder.current) { recorder.current.stop(); recorder.current.stream.getTracks().forEach((track) => track.stop()); setVoiceDuration(Math.max(1, Math.round((Date.now() - started.current) / 1000))); setRecording(false); setRecorded(true); return; }
    try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); recorder.current = new MediaRecorder(stream); recorder.current.start(); started.current = Date.now(); setRecording(true); } catch { setRecorded(false); }
  }
  const keywords = ["番茄", "高山", "新鲜"].filter((word) => text.includes(word));
  const ready = mode === "text" ? text.trim().length >= 12 : recorded;
  return <div className="operation-panel job-console pitch-console">
    <CareerRoleVisual gender="female" label="助农电商主播" product roleId="anchor" />
    <div className="segmented"><button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>文字模式</button><button className={mode === "voice" ? "active" : ""} onClick={() => setMode("voice")}>语音模式</button></div>
    {mode === "text" ? <><textarea maxLength={120} onChange={(event) => setText(event.target.value)} placeholder="例：来自高山产区的新鲜番茄，酸甜饱满……" value={text} /><small>{text.length}/120 · 已识别关键词 {keywords.length}/3</small></> : <div className={`voice-recorder ${recording ? "recording" : ""}`}><div className="wave">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div><button onClick={toggleRecord}>{recording ? <CircleStop /> : <Mic />}{recording ? "停止录音" : recorded ? `重新录制（${voiceDuration}秒）` : "授权麦克风并录音"}</button><small>录音仅用于本次岗位体验，不写入学习事件。</small></div>}
    <button className="primary-button" disabled={!ready} onClick={() => onComplete({ summary: { contentSubmitted: true, contentLength: mode === "text" ? text.length : voiceDuration, contentRef: "attempt-private-content", mode, keywordCount: keywords.length, voiceDuration }, privateContent: mode === "text" ? { pitch: text } : { voiceStatus: `recorded:${voiceDuration}s` } })}>提交岗位表现<Send size={17} /></button>
  </div>;
}

function FarmOperatorOperation({ onComplete }: Props) {
  const [light, setLight] = useState(6500); const [temperature, setTemperature] = useState(20); const [changes, setChanges] = useState(0);
  const valid = light >= 8000 && light <= 12000 && temperature >= 22 && temperature <= 26;
  return <div className="operation-panel job-console farm-console"><CareerRoleVisual gender="male" label="智慧农场运营师" roleId="farm" /><div className={`digital-plant ${valid ? "healthy" : ""}`}><Sprout /><i /><i /></div><label><span><Gauge />光照<b>{light} lux</b></span><input max="15000" min="4000" step="500" type="range" value={light} onChange={(e) => { setLight(Number(e.target.value)); setChanges((v) => v + 1); }} /></label><label><span><ThermometerSun />温度<b>{temperature}℃</b></span><input max="32" min="16" type="range" value={temperature} onChange={(e) => { setTemperature(Number(e.target.value)); setChanges((v) => v + 1); }} /></label><p className={valid ? "valid" : ""}>{valid ? "参数正常，叶片恢复健康" : "目标：8000-12000 lux · 22-26℃"}</p><button className="primary-button" disabled={!valid} onClick={() => onComplete({ summary: { parametersInRange: true, light, temperature, adjustmentCount: changes } })}>保存运营方案<Check size={17} /></button></div>;
}

function BrandOperation({ onComplete, pending = false }: Props) {
  const [slogan, setSlogan] = useState("");
  const [referencesViewed, setReferencesViewed] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const normalizedSlogan = slogan.trim();
  const featureTerms = ["番茄", "西红柿", "高山", "山地", "产地", "原产", "新鲜", "鲜", "酸甜", "甜", "多汁", "自然", "生态", "绿色", "有机", "当季", "健康"];
  const hasFeature = featureTerms.some((word) => normalizedSlogan.includes(word));

  function generateCard() {
    if (!hasFeature) {
      setValidationMessage("还缺少产品或产地特点。可以加入“高山”“番茄”“鲜甜”“生态”等真实信息后再生成。");
      return;
    }
    setValidationMessage("");
    void onComplete({
      summary: { contentSubmitted: true, contentLength: normalizedSlogan.length, contentRef: "attempt-private-content", referencesViewed, mode: "text" },
      privateContent: { slogan: normalizedSlogan },
    });
  }

  return <div className="operation-panel job-console brand-console">
    <CareerRoleVisual gender="female" label="农产品品牌策划师" product roleId="brand" />
    <div className="slogan-card"><Leaf /><small>高山番茄品牌提案</small><strong>{normalizedSlogan || "你的广告语将在这里生成"}</strong></div>
    <label>广告语<input aria-describedby="brand-slogan-status" disabled={pending} maxLength={15} onChange={(event) => { setSlogan(event.target.value); setValidationMessage(""); }} placeholder="不超过 15 个汉字" value={slogan} /></label>
    <span id="brand-slogan-status">{normalizedSlogan.length}/15 · {hasFeature ? "已包含产品或产地特点" : "生成时将检查产品或产地特点"}</span>
    <button className="text-button" disabled={pending} onClick={() => setReferencesViewed(true)}>查看三条结构参考</button>
    {referencesViewed && <p>产地 + 产品；口感 + 场景；真实特点 + 行动邀请。</p>}
    {validationMessage && <p className="brand-validation" role="alert">{validationMessage}</p>}
    <button className="primary-button" disabled={pending || normalizedSlogan.length === 0} onClick={generateCard}>{pending ? <>正在生成品牌卡<LoaderCircle className="spin-icon" size={17} /></> : <>生成品牌卡<Send size={17} /></>}</button>
  </div>;
}

function CommerceOperation({ onComplete }: Props) {
  const [checked, setChecked] = useState<string[]>([]); const [tracking, setTracking] = useState("");
  const fields = ["收件人：陈禾", "地址：青禾路 18 号", "电话：138****2608"];
  function toggle(field: string) { setChecked((items) => items.includes(field) ? items.filter((item) => item !== field) : [...items, field]); }
  const ready = checked.length === 3 && tracking === "SF2026072601";
  return <div className="operation-panel job-console commerce-console"><CareerRoleVisual gender="male" label="乡村电商运营官" roleId="ops" /><div className="order-sheet"><header><Truck />待处理订单 <b>#U012608</b></header>{fields.map((field) => <label key={field}><input checked={checked.includes(field)} onChange={() => toggle(field)} type="checkbox" />{field}</label>)}<label>物流单号<input onChange={(e) => setTracking(e.target.value.toUpperCase())} placeholder="SF2026072601" value={tracking} /></label><div className="order-flow"><span className="done">待处理</span><i /><span className={checked.length === 3 ? "done" : ""}>已核对</span><i /><span className={ready ? "done" : ""}>可发货</span></div></div><button className="primary-button" disabled={!ready} onClick={() => onComplete({ summary: { orderShipped: true, verifiedFields: checked.length, trackingValid: true, trackingRef: "masked:2601" } })}>确认发货<Send size={17} /></button></div>;
}

function FounderOperation({ onComplete }: Props) {
  const projects = ["智慧果园托管", "社区生鲜订阅", "乡村研学营地", "农业无人机服务", "区域农产品品牌"];
  const [project, setProject] = useState(""); const [reason, setReason] = useState("");
  return <div className="operation-panel job-console founder-console"><CareerRoleVisual gender="female" label="新农人创业家" roleId="founder" /><div className="project-grid">{projects.map((item) => <button className={project === item ? "active" : ""} key={item} onClick={() => setProject(item)}><Sprout />{item}</button>)}</div><textarea maxLength={100} onChange={(e) => setReason(e.target.value)} placeholder="我选择它，因为……（需求、资源或个人能力）" value={reason} /><small>{reason.length}/100</small><button className="primary-button" disabled={!project || reason.trim().length < 10} onClick={() => onComplete({ summary: { projectSelected: true, project, contentLength: reason.length, contentRef: "attempt-private-content", mode: "text" }, privateContent: { reason } })}>生成创业意向卡<ChevronRight size={17} /></button></div>;
}

function AssessmentOperation({ onComplete }: Props) {
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState<number[]>(Array(12).fill(0)); const [modifications, setModifications] = useState(0);
  const labels = ["很不符合", "不太符合", "一般", "比较符合", "非常符合"];
  function choose(value: number) { if (answers[index]) setModifications((count) => count + 1); setAnswers((items) => items.map((item, itemIndex) => itemIndex === index ? value : item)); }
  const complete = answers.every(Boolean);
  return <div className="operation-panel assessment-console"><div className="assessment-progress"><span>第 {index + 1} / 12 题</span><i><b style={{ width: `${answers.filter(Boolean).length / 12 * 100}%` }} /></i><small>{["兴趣", "性格", "能力"][Math.floor(index / 4)]}维度</small></div><h2>{CAREER_QUESTIONS[index][0]}</h2><div className="scale-options">{labels.map((label, answerIndex) => <button className={answers[index] === answerIndex + 1 ? "active" : ""} key={label} onClick={() => choose(answerIndex + 1)}><b>{answerIndex + 1}</b>{label}</button>)}</div><div className="assessment-nav"><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ChevronLeft />上一题</button>{index < 11 ? <button disabled={!answers[index]} onClick={() => setIndex((value) => value + 1)}>下一题<ChevronRight /></button> : <button className="primary-button" disabled={!complete} onClick={() => onComplete({ summary: { assessmentCompleted: true, answerCount: 12, modifications, answerVector: answers.join(",") }, privateContent: { answers: answers.map(String) } })}>提交测评<Check /></button>}</div></div>;
}

function getAssessmentAnswers(evidence: Record<string, unknown>) {
  const values = evidence.assessmentAnswers;
  if (Array.isArray(values)) return values.map(Number);
  return Array(12).fill(3);
}

function ReportOperation({ evidence, onComplete }: Props) {
  const [generating, setGenerating] = useState(true); const [expanded, setExpanded] = useState("");
  const profile = useMemo(() => calculateCareerProfile(getAssessmentAnswers(evidence)), [evidence]);
  useEffect(() => { const timer = window.setTimeout(() => setGenerating(false), 3000); return () => window.clearTimeout(timer); }, []);
  if (generating) return <div className="operation-panel report-generating"><Activity /><h2>正在整理 12 项真实回答</h2><div><i /></div><p>计算兴趣、性格、能力和五岗位匹配，不使用随机数。</p></div>;
  return <div className="operation-panel report-console"><div className="dimension-chart"><CareerRadar dimensions={profile.dimensions} />{Object.entries(profile.dimensions).map(([key, value]) => <div key={key}><span>{key === "interest" ? "兴趣" : key === "personality" ? "性格" : "能力"}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>)}</div><div className="match-list">{profile.matches.map((match, index) => <button className={expanded === match.id ? "active" : ""} key={match.id} onClick={() => setExpanded(match.id)}><span>{index + 1}</span><Image alt="" className="match-role-thumb" height={72} src={getCareerRoleAsset(match.id, index % 2 ? "male" : "female")} width={48} /><b>{match.title}</b><strong>{match.score}%</strong>{expanded === match.id && <small>匹配度来自三维回答加权，可在后续体验中继续修正。</small>}</button>)}</div><button className="primary-button" disabled={!expanded} onClick={() => onComplete({ summary: { reportViewed: true, expandedRole: expanded, topRole: profile.matches[0].id, topScore: profile.matches[0].score } })}>确认查看报告<ChevronRight /></button></div>;
}

function RoleCardOperation({ evidence, onComplete }: Props) {
  const profile = useMemo(() => calculateCareerProfile(getAssessmentAnswers(evidence)), [evidence]); const [role, setRole] = useState(profile.matches[0].title); const [gender, setGender] = useState<CareerAvatarGender>("female"); const [nickname, setNickname] = useState("");
  const selectedRole = profile.matches.find((item) => item.title === role) ?? profile.matches[0];
  const avatarAsset = getCareerRoleAsset(selectedRole.id, gender);
  return <div className="operation-panel role-card-console"><div className="role-options">{profile.matches.map((item, index) => <button className={role === item.title ? "active" : ""} key={item.id} onClick={() => setRole(item.title)}>{item.title}<b>{item.score}%</b>{index === 0 && <small>匹配度最高</small>}</button>)}</div><div className="avatar-options">{(["female", "male"] as const).map((item) => <button className={gender === item ? "active" : ""} key={item} onClick={() => setGender(item)}><Image alt="" height={96} src={getCareerRoleAsset(selectedRole.id, item)} width={64} />{item === "female" ? "女角色" : "男角色"}</button>)}</div><label>职业昵称<input maxLength={10} onChange={(e) => setNickname(e.target.value)} placeholder="2-10 个字" value={nickname} /></label><div className="generated-role-card"><Image alt={`${role}${gender === "female" ? "女" : "男"}角色形象`} height={240} src={avatarAsset} width={160} /><small>第一单元职业角色卡</small><h2>{nickname || "职业探索者"}</h2><b>{role}</b><p>{gender === "female" ? "女角色" : "男角色"} · 初始四维成长值 50</p></div><button className="primary-button" disabled={nickname.trim().length < 2} onClick={() => onComplete({ summary: { roleCardCreated: true, role, avatar: `${selectedRole.id}-${gender}`, contentLength: nickname.length, contentRef: "attempt-private-content", mode: "text" }, privateContent: { nickname } })}>保存角色卡<Check /></button></div>;
}

const STORIES = ["返乡种粮的无人机飞手", "山地果园的数据管家", "为家乡直播的助农主播", "改造老茶园的品牌主理人", "守护种质资源的育种员", "做社区订阅的农场主", "让旧仓库变研学营地的创业者", "推广节水滴灌的技术员", "建立冷链网络的运营官", "记录乡土风味的内容创作者"];

function StorySelectionOperation({ onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  function toggle(item: string) { setSelected((items) => items.includes(item) ? items.filter((value) => value !== item) : items.length < 3 ? [...items, item] : items); }
  return <div className="operation-panel story-selection"><div className="story-cabinets">{STORIES.map((story, index) => <button className={selected.includes(story) ? "active" : ""} key={story} onClick={() => toggle(story)}><span>{String(index + 1).padStart(2, "0")}</span><Sprout /><b>{story}</b>{selected.includes(story) && <Check />}</button>)}</div><div className="selection-footer"><span>已选择 {selected.length} / 3</span><button className="primary-button" disabled={selected.length !== 3} onClick={() => onComplete({ summary: { storiesSelected: true, selectedCount: 3, contentRef: "attempt-private-content" }, privateContent: { selectedStories: selected } })}>进入故事时间轴<ChevronRight /></button></div></div>;
}

function StoryMediaOperation({ onComplete }: Props) {
  const nodes = ["返乡动机", "最初困难", "关键行动", "成长成果"]; const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(0); const [pauses, setPauses] = useState(0);
  const activePlayback = playing && progress < 100;
  useEffect(() => { if (!activePlayback) return; const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 25)), 1400); return () => window.clearInterval(timer); }, [activePlayback]);
  return <div className="operation-panel story-media"><div className="media-status"><span>正式视频素材待授权接入</span><b>当前：教学分镜预览</b></div><div className={`story-frame frame-${progress}`}><div className="story-landscape"><Sprout /><i /><i /><i /></div><strong>{progress === 0 ? "准备播放" : nodes[Math.min(3, progress / 25 - 1)]}</strong><p>{progress === 25 ? "从真实乡村需求出发，而不是追逐概念。" : progress === 50 ? "资金、技术和信任都需要逐步建立。" : progress === 75 ? "用小范围试验验证方案，再扩大服务。" : progress === 100 ? "让职业成长与社区价值共同发生。" : "四个知识节点将按时间出现。"}</p></div><div className="media-controls"><button onClick={() => { if (activePlayback) setPauses((value) => value + 1); setPlaying((value) => !value); }}>{activePlayback ? <Pause /> : <Play />}</button><i><b style={{ width: `${progress}%` }} /></i><span>{progress}%</span></div><div className="media-milestones">{nodes.map((node, index) => <span className={progress >= (index + 1) * 25 ? "done" : ""} key={node}>{node}</span>)}</div><button className="primary-button" disabled={progress < 100} onClick={() => onComplete({ summary: { mediaReviewed: true, mediaProgress: 100, mediaId: "u01-story-preview-v1", pauseCount: pauses, preview: true } })}>完成知识节点记录<Check /></button></div>;
}

function ReflectionOperation({ onComplete }: Props) {
  const [difficulty, setDifficulty] = useState(""); const [insight, setInsight] = useState("");
  return <div className="operation-panel reflection-console"><div className="reflection-card"><Sprout /><small>乡土情怀 · 学习感悟</small><label>新农人面对的具体困难<textarea onChange={(e) => setDifficulty(e.target.value)} value={difficulty} /></label><label>最启发我的行动<textarea onChange={(e) => setInsight(e.target.value)} value={insight} /></label></div><button className="primary-button" disabled={difficulty.trim().length < 8 || insight.trim().length < 8} onClick={() => onComplete({ summary: { contentSubmitted: true, contentLength: difficulty.length + insight.length, contentRef: "attempt-private-content", mode: "text", cardGenerated: true }, privateContent: { difficulty, insight } })}>生成感悟卡<Send /></button></div>;
}

function OriginalNotesOperation({ onComplete }: Props) {
  const [notes, setNotes] = useState(["", "", ""]); const [anonymous, setAnonymous] = useState(true);
  return <div className="operation-panel notes-console"><div className="sticky-board">{notes.map((note, index) => <label key={index}><span>印象 {index + 1}</span><textarea maxLength={40} onChange={(e) => setNotes((items) => items.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} value={note} /></label>)}</div><label className="check-line"><input checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} type="checkbox" />匿名展示到班级便签墙</label><button className="primary-button" disabled={notes.some((note) => note.trim().length < 3)} onClick={() => onComplete({ summary: { notesSubmitted: true, noteCount: 3, anonymous, contentLength: notes.join("").length, contentRef: "attempt-private-content", mode: "text" }, privateContent: { notes } })}>贴上初印象墙<Send /></button></div>;
}

function ImpressionWallOperation({ onComplete }: Props) {
  const notes = ["农业也需要数据分析", "直播表达需要真实了解产品", "农场运营要同时看环境和成本", "创业不是一个点子，还要验证需求", "设备提高效率，也需要人来判断", "品牌能让产地价值被看见"];
  const [viewed, setViewed] = useState<number[]>([]); const [liked, setLiked] = useState<number[]>([]);
  function view(index: number) { setViewed((items) => items.includes(index) ? items : [...items, index]); }
  return <div className="operation-panel wall-console"><div className="anonymous-wall">{notes.map((note, index) => <button className={viewed.includes(index) ? "opened" : ""} key={note} onClick={() => view(index)}><small>匿名便签 {index + 1}</small><p>{viewed.includes(index) ? note : "点击展开"}</p>{viewed.includes(index) && <span onClick={(event) => { event.stopPropagation(); setLiked((items) => items.includes(index) ? items : [...items, index]); }}><Heart className={liked.includes(index) ? "liked" : ""} />{liked.includes(index) ? "已点赞" : "有启发"}</span>}</button>)}</div><button className="primary-button" disabled={viewed.length < 3} onClick={() => onComplete({ summary: { notesViewed: true, viewedCount: viewed.length, likeCount: liked.length } })}>完成匿名墙浏览<Check /></button></div>;
}

function ImpressionCompareOperation({ evidence, onComplete }: Props) {
  const original = Array.isArray(evidence.originalNotes) ? evidence.originalNotes.map(String) : ["农业主要靠体力", "涉农岗位选择不多", "技术离生产很远"];
  const [notes, setNotes] = useState(["", "", ""]);
  return <div className="operation-panel compare-console"><div className="compare-columns"><div><span>体验前</span>{original.map((note, index) => <p key={index}>{note}</p>)}</div><div className="compare-arrows">{original.map((_, index) => <ChevronRight key={index} />)}</div><div><span>体验后</span>{notes.map((note, index) => <textarea key={index} maxLength={50} onChange={(e) => setNotes((items) => items.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} placeholder="用岗位、技术或能力证据改写" value={note} />)}</div></div><button className="primary-button" disabled={notes.some((note) => note.trim().length < 5)} onClick={() => onComplete({ summary: { comparisonCreated: true, comparisonCount: 3, contentLength: notes.join("").length, contentRef: "attempt-private-content", mode: "text", badgeId: "u01-cognition-upgrade" }, privateContent: { newNotes: notes } })}>生成认知升级报告<Send /></button></div>;
}
