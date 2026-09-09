"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Gauge, Play, VolumeX } from "lucide-react";
import { beginSimpleInteraction, submitSimpleInteraction, type SimpleResult } from "@/lib/client/simple-interaction";
import { InteractionCompletionDialog } from "@/components/interaction-completion-dialog";
import { SoilParticles } from "@/components/soil-particles";
import { useManagedQuestion, type ManagedQuestionResponse } from "@/components/managed-questions-provider";

const ID = "u01-trad-01-plow";
const OPTIONS = [["A", "生产效率极低"], ["B", "劳动强度极大"], ["C", "完全依赖天气"], ["D", "产量不稳定"]] as const;

export function PlowExperience() {
  const [stage, setStage] = useState<"ready" | "demonstrating" | "narrating" | "question" | "submitting" | "completed">("ready");
  const [attemptId, setAttemptId] = useState("");
  const [progress, setProgress] = useState(0);
  const [narration, setNarration] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<SimpleResult>();
  const [error, setError] = useState("");
  const startedAt = useRef(0);
  const managedResponse = useRef<ManagedQuestionResponse | undefined>(undefined);
  const { question, check } = useManagedQuestion();

  useEffect(() => {
    if (stage !== "demonstrating") return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - started) / 15_000);
      setProgress(next);
      if (next >= 1) { window.clearInterval(timer); setStage("narrating"); }
    }, 80);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "narrating") return;
    const timer = window.setInterval(() => setNarration((value) => Math.min(100, value + 2)), 90);
    return () => window.clearInterval(timer);
  }, [stage]);

  async function start() {
    try {
      setError("");
      const attempt = await beginSimpleInteraction(ID);
      setAttemptId(attempt.attemptId); startedAt.current = performance.now(); setStage("demonstrating");
    } catch { setError("暂时无法开始演示，请稍后重试。 "); }
  }

  async function choose(option: string, submittedAt: number) {
    try {
      if (question && check) {
        const checked = await check(question, option);
        managedResponse.current = { key: question.key, answer: option, correct: checked.correct, version: question.version };
      }
      setAnswer(option); setStage("submitting");
      const response = await submitSimpleInteraction(ID, attemptId, {
        durationMs: Math.round(submittedAt - startedAt.current), narrationCompleted: true, answers: [option],
        questionResponses: managedResponse.current ? [managedResponse.current] : undefined,
        actionSummary: { animationCompleted: true, animationCompletionRate: 100, cultivatedMu: 3 },
      });
      setResult(response); setStage("completed");
    } catch { setError("进度保存失败，请重新提交。 "); setStage("question"); }
  }

  const plowLeft = 8 + progress * 52;
  return (
    <main className="experience-shell">
      <header className="experience-header"><Link href="/student/unit-01" aria-label="返回第一单元"><ArrowLeft size={21} /></Link><div><span>第一单元 · 传统农业馆</span><strong>木犁与牛耕</strong></div><div className="experience-progress"><i style={{ width: stage === "ready" ? "8%" : stage === "demonstrating" ? `${15 + progress * 42}%` : stage === "completed" ? "100%" : "72%" }} /></div><span className="step-label">互动 01 / 03</span></header>
      <section className="simulation-stage plow-stage">
        <Image className="stage-background" src="/assets/unit-01/scenes/traditional-hall-v001.webp" alt="传统农业馆田间场景" fill priority sizes="100vw" />
        <div className="plow-furrow" style={{ width: `${progress * 62}%` }} />
        <div className={`plow-subject ${stage === "demonstrating" ? "walking" : ""}`} style={{ left: `${plowLeft}%`, transform: `translate(-20%, -50%) translateY(${Math.sin(progress * 36) * 3}px)` }}><Image src="/assets/unit-01/props/ox-plow-v001.png" alt="黄牛拉木犁，农民扶犁耕地" fill priority sizes="70vw" /></div>
        <SoilParticles active={stage === "demonstrating"} progress={progress} />
        {stage === "demonstrating" && <div className="operation-hud"><span><Gauge size={18} />牛耕演示</span><strong>{(progress * 15).toFixed(1)}<small> / 15.0 秒</small></strong><div><i style={{ width: `${progress * 100}%` }} /></div><p><Clock3 size={15} />今日耕作 {(progress * 3).toFixed(1)} / 3.0 亩</p></div>}
        {stage === "ready" && <div className="overlay-panel scene-intro-panel"><span className="panel-icon"><Play size={22} /></span><span className="question-step">互动 01 · 人力驱动</span><h1>一头牛、一把犁，一天能耕多少地？</h1><p>启动牛耕模型，完整观察劳动力、速度与耕作面积的变化。</p><button className="primary-button" onClick={start}>启动 15 秒演示<ArrowRight size={18} /></button>{error && <p className="inline-error">{error}</p>}</div>}
        {stage === "narrating" && <div className="overlay-panel narration-panel"><span className="panel-icon"><VolumeX size={22} /></span><span className="subtitle-mode">字幕模式</span><h2>传统耕作依靠人力与畜力</h2><p>上世纪 80 年代，一头牛、一把犁、一个壮劳力，一天最多只能耕 3 亩地。播种、插秧和收割同样依赖人力。</p><div className="narration-track"><i style={{ width: `${narration}%` }} /></div><button className="primary-button" disabled={narration < 100} onClick={() => setStage("question")}>回答观察问题<ArrowRight size={18} /></button></div>}
        {(stage === "question" || stage === "submitting" || stage === "completed") && <div className="overlay-panel question-panel"><span className="panel-icon"><Gauge size={22} /></span><span className="question-step">观察判断</span><h2>{question?.prompt ?? "传统生产方式的局限体现在哪些方面？"}</h2><p>选择你最关注的一项。四项都是真实存在的局限，农小智会按你的视角点评。</p><div className="option-grid">{(question?.options ?? OPTIONS.map(([, label]) => label)).map((label, index) => { const key = String.fromCharCode(65 + index); return <button disabled={stage !== "question"} key={`${key}-${label}`} onClick={(event) => void choose(key, event.timeStamp)}><b>{key}</b><span>{label}</span></button>; })}</div></div>}
        {stage === "completed" && result && <InteractionCompletionDialog
          title="木犁牛耕观察"
          nextRoute="/student/unit-01/thresher"
          mapRoute="/student/unit-01"
          description={answer === "A" || answer === "B" ? "你抓住了人力生产的核心压力，操作与观察记录已保存。" : "你注意到了经验农业的不确定性，操作与观察记录已保存。"}
        />}
      </section>
    </main>
  );
}
