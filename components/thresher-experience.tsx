"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CircleHelp, Gauge, RotateCw, VolumeX, Wheat, X } from "lucide-react";
import { angularDelta } from "@/lib/game/thresher";
import { THRESHER_TARGET_MS } from "@/lib/constants";
import { InteractionCompletionDialog } from "@/components/interaction-completion-dialog";
import { RiceParticles } from "@/components/rice-particles";
import { useManagedQuestion, type ManagedQuestionResponse } from "@/components/managed-questions-provider";

type Stage = "intro" | "operating" | "narrating" | "question" | "feedback" | "submitting" | "completed";
type Result = { score: number; firstCorrect: boolean; finalCorrect: boolean };
const OPTIONS = [
  ["A", "4 小时"], ["B", "40 小时"], ["C", "400 小时"], ["D", "4000 小时"],
] as const;

export function ThresherExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [attemptId, setAttemptId] = useState<string>();
  const [effectiveMs, setEffectiveMs] = useState(0);
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [dragSegments, setDragSegments] = useState(0);
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState("");
  const handleHubRef = useRef<HTMLButtonElement>(null);
  const pointerRef = useRef<{ angle: number; at: number } | undefined>(undefined);
  const effectiveRef = useRef(0);
  const managedResponses = useRef<ManagedQuestionResponse[]>([]);
  const { question, check } = useManagedQuestion();

  useEffect(() => {
    if (stage !== "narrating") return;
    const timer = window.setInterval(() => setNarrationProgress((value) => Math.min(100, value + 2)), 100);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (speed <= 0) return;
    const timer = window.setTimeout(() => setSpeed((value) => Math.max(0, value - 0.12)), 90);
    return () => window.clearTimeout(timer);
  }, [speed]);

  async function start() {
    setError("");
    const response = await fetch("/api/attempts", { method: "POST" });
    if (!response.ok) return setError("暂时无法建立训练记录，请稍后重试。 ");
    const data = await response.json() as { attemptId: string };
    setAttemptId(data.attemptId);
    setStage("operating");
  }

  function pointerAngle(clientX: number, clientY: number) {
    const rect = handleHubRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * (180 / Math.PI);
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (stage !== "operating") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { angle: pointerAngle(event.clientX, event.clientY), at: performance.now() };
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !pointerRef.current || stage !== "operating") return;
    const now = performance.now();
    const nextAngle = pointerAngle(event.clientX, event.clientY);
    const delta = angularDelta(pointerRef.current.angle, nextAngle);
    const elapsed = Math.min(now - pointerRef.current.at, 120);
    const nextSpeed = Math.min(Math.abs(delta) / Math.max(elapsed, 16) * 3.4, 1);
    setAngle((value) => value + delta);
    setSpeed(nextSpeed);
    if (Math.abs(delta) > 1.5) {
      const nextEffective = Math.min(THRESHER_TARGET_MS, effectiveRef.current + elapsed);
      effectiveRef.current = nextEffective;
      setEffectiveMs(nextEffective);
      setDragSegments((value) => value + 1);
      if (nextEffective >= THRESHER_TARGET_MS) {
        event.currentTarget.releasePointerCapture(event.pointerId);
        setSpeed(0);
        setStage("narrating");
      }
    }
    pointerRef.current = { angle: nextAngle, at: now };
  }

  async function finish(nextAnswers: string[]) {
    if (!attemptId) return;
    setStage("submitting");
    const response = await fetch(`/api/attempts/${attemptId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ effectiveDurationMs: Math.round(effectiveRef.current), dragSegments, narrationCompleted: true, answers: nextAnswers, questionResponses: managedResponses.current }),
    });
    if (!response.ok) { setError("记录提交失败，请保留当前页面并重试。 "); setStage("question"); return; }
    setResult(await response.json());
    setStage("completed");
  }

  async function chooseAnswer(answer: string) {
    let correct = answer === "B";
    if (question && check) {
      const checked = await check(question, answer);
      correct = checked.correct;
      managedResponses.current.push({ key: question.key, answer, correct, version: question.version });
    }
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    if (correct || nextAnswers.length >= 2) void finish(nextAnswers);
    else setStage("feedback");
  }

  const operationPercent = Math.round(effectiveMs / THRESHER_TARGET_MS * 100);

  return (
    <main className="experience-shell">
      <header className="experience-header">
        <Link href="/student/unit-01" aria-label="返回第一单元"><ArrowLeft size={21} /></Link>
        <div><span>第一单元 · 传统农业馆</span><strong>手摇脱粒机</strong></div>
        <div className="experience-progress"><i style={{ width: `${stage === "intro" ? 8 : stage === "operating" ? 34 : stage === "narrating" ? 58 : stage === "question" || stage === "feedback" ? 78 : 100}%` }} /></div>
        <span className="step-label">任务 02 / 23</span>
      </header>
      <section className="simulation-stage" data-stage={stage}>
        <Image className="stage-background" src="/assets/unit-01/scenes/traditional-hall-v001.webp" alt="传统农业馆的稻田与农具作业区" fill priority sizes="100vw" />
        <div className={`machine-zone ${speed > .45 ? "is-running" : ""}`}>
          <Image src="/assets/unit-01/props/thresher-body-v001.png" alt="手摇脱粒机" fill priority sizes="(max-width: 700px) 78vw, 46vw" />
          <RiceParticles speed={speed} />
          <button
            className="crank-handle"
            ref={handleHubRef}
            style={{ transform: `rotate(${angle}deg)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); pointerRef.current = undefined; setSpeed(0); }}
            aria-label="拖动手摇脱粒机摇柄"
            disabled={stage !== "operating"}
          ><span className="crank-arm" /><span className="crank-grip" /></button>
        </div>
        {stage === "operating" && <div className="operation-hud">
          <span><Gauge size={18} />有效运转</span><strong>{(effectiveMs / 1000).toFixed(1)}<small> / 10.0 秒</small></strong>
          <div><i style={{ width: `${operationPercent}%` }} /></div><p><RotateCw size={15} />按住摇柄，围绕轴心持续转动</p>
        </div>}
        {stage === "intro" && <div className="guide-dialog intro-dialog">
          <Image className="nxz-portrait" src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={776} height={817} priority />
          <div><span>农小智</span><h1>让这台老式脱粒机转起来</h1><p>生产效率，是理解农业职业变迁的第一把钥匙。转动摇柄，观察机器与稻粒的变化。</p><button className="primary-button" onClick={start}>开始操作<ArrowRight size={18} /></button>{error && <p className="inline-error">{error}</p>}</div>
        </div>}
        {stage === "narrating" && <div className="overlay-panel narration-panel">
          <span className="panel-icon"><Wheat size={22} /></span><span className="subtitle-mode"><VolumeX size={15} />字幕模式</span>
          <h2>从手工到机械：效率开始被重新计算</h2>
          <p>手摇脱粒机依靠人力带动滚筒，使稻谷与秸秆分离。它比纯手工脱粒更稳定，但每小时产能仍然有限。</p>
          <div className="narration-track"><i style={{ width: `${narrationProgress}%` }} /></div>
          <button className="primary-button" disabled={narrationProgress < 100} onClick={() => setStage("question")}>进入产能测算<ArrowRight size={18} /></button>
        </div>}
        {(stage === "question" || stage === "submitting" || stage === "completed") && <div className="overlay-panel question-panel">
          <span className="panel-icon"><CircleHelp size={22} /></span><span className="question-step">产能测算 {answers.length ? "· 再试一次" : ""}</span>
          <h2>{question?.prompt ?? "5 亩稻田需要多少小时完成脱粒？"}</h2>
          <p>亩产 800 斤，手摇脱粒机每小时处理 100 斤。</p>
          <div className="option-grid">{(question?.options ?? OPTIONS.map(([, label]) => label)).map((label, index) => { const key = String.fromCharCode(65 + index); return <button disabled={stage !== "question"} key={`${key}-${label}`} onClick={() => void chooseAnswer(key)}><b>{key}</b><span>{label}</span></button>; })}</div>
          {stage === "submitting" && <span className="submitting">正在写入成长档案…</span>}
        </div>}
        {stage === "feedback" && <div className="overlay-panel feedback-panel">
          <span className="panel-icon warning"><X size={22} /></span><span className="question-step">先拆成两步，不着急</span>
          <h2>先算总产量，再除以每小时产能</h2>
          <div className="formula"><span>5 亩 × 800 斤/亩</span><b>= 4000 斤</b><span>4000 斤 ÷ 100 斤/小时</span><b>= 40 小时</b></div>
          <p>这次反馈不会降低你的能力值。带着计算过程再选一次。</p>
          <button className="primary-button" onClick={() => setStage("question")}>重新选择<ArrowRight size={18} /></button>
        </div>}
        {stage === "completed" && result && <InteractionCompletionDialog
          title="手摇脱粒机测算"
          nextRoute="/student/unit-01/traditional/seasons"
          mapRoute="/student/unit-01"
          description={result.firstCorrect ? "测算准确，效率差距很直观；操作与测算记录已保存。" : result.finalCorrect ? "修正成功，计算路径与操作记录已保存。" : "本次体验与反馈记录已保存，正确结果是 40 小时。"}
        />}
      </section>
    </main>
  );
}
