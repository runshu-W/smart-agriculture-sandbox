"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CloudRain, RotateCw, VolumeX } from "lucide-react";
import { beginSimpleInteraction, submitSimpleInteraction, type SimpleResult } from "@/lib/client/simple-interaction";
import { InteractionCompletionDialog } from "@/components/interaction-completion-dialog";
import { useManagedQuestion, type ManagedQuestionResponse } from "@/components/managed-questions-provider";

const ID = "u01-trad-03-seasons";
const PROVERBS = ["清明前后，种瓜点豆", "瑞雪兆丰年", "白露早，寒露迟，秋分种麦正当时"];
const OPTIONS = [["A", "无法应对极端天气"], ["B", "节气与实际气候不符"], ["C", "不同地区经验不通用"], ["D", "年轻人不会传承"]] as const;

export function SeasonsExperience() {
  const [stage, setStage] = useState<"ready" | "exploring" | "narrating" | "question" | "feedback" | "submitting" | "completed">("ready");
  const [attemptId, setAttemptId] = useState("");
  const [gearRevealed, setGearRevealed] = useState(false);
  const [proverbIndex, setProverbIndex] = useState(-1);
  const [views, setViews] = useState(0);
  const [narration, setNarration] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<SimpleResult>();
  const [error, setError] = useState("");
  const startedAt = useRef(0);
  const managedResponse = useRef<ManagedQuestionResponse | undefined>(undefined);
  const { question, check } = useManagedQuestion();

  useEffect(() => {
    if (stage !== "narrating") return;
    const timer = window.setInterval(() => setNarration((value) => Math.min(100, value + 2)), 90);
    return () => window.clearInterval(timer);
  }, [stage]);

  async function start() {
    try {
      const attempt = await beginSimpleInteraction(ID);
      setAttemptId(attempt.attemptId); startedAt.current = performance.now(); setStage("exploring");
    } catch { setError("暂时无法开始探索，请稍后重试。 "); }
  }

  function flipProverb() {
    setProverbIndex((value) => (value + 1) % PROVERBS.length);
    setViews((value) => value + 1);
  }

  async function choose(option: string, submittedAt: number) {
    let checked: { correct: boolean; feedback: string } | undefined;
    if (question && check) {
      checked = await check(question, option);
      managedResponse.current = { key: question.key, answer: option, correct: checked.correct, version: question.version };
    }
    const next = [...answers, option];
    setAnswers(next);
    if (!(checked?.correct ?? option === "A") && next.length < 2) { setStage("feedback"); return; }
    try {
      setStage("submitting");
      const response = await submitSimpleInteraction(ID, attemptId, {
        durationMs: Math.round(submittedAt - startedAt.current), narrationCompleted: true, answers: next,
        questionResponses: managedResponse.current ? [managedResponse.current] : undefined,
        actionSummary: { proverbViewed: views >= 1, proverbViews: views, rainGearRevealed: gearRevealed },
      });
      setResult(response); setStage("completed");
    } catch { setError("进度保存失败，请重新提交。 "); setStage("question"); }
  }

  return (
    <main className="experience-shell">
      <header className="experience-header"><Link href="/student/unit-01" aria-label="返回第一单元"><ArrowLeft size={21} /></Link><div><span>第一单元 · 传统农业馆</span><strong>蓑衣斗笠与节气牌</strong></div><div className="experience-progress"><i style={{ width: stage === "ready" ? "8%" : stage === "exploring" ? "35%" : stage === "completed" ? "100%" : "72%" }} /></div><span className="step-label">互动 03 / 03</span></header>
      <section className="simulation-stage seasons-stage">
        <Image className="stage-background" src="/assets/unit-01/scenes/traditional-hall-v001.webp" alt="传统农业馆农具墙" fill priority sizes="100vw" />
        <div className={`rain-gear ${gearRevealed ? "revealed" : ""}`}><button aria-label="查看蓑衣斗笠细节" onClick={() => setGearRevealed(true)} disabled={stage !== "exploring"}><Image src="/assets/unit-01/props/rain-gear-v001.png" alt="蓑衣和斗笠" fill priority sizes="36vw" /></button></div>
        <button className={`season-board ${proverbIndex >= 0 ? "flipped" : ""}`} onClick={flipProverb} disabled={stage !== "exploring"} aria-label="翻转节气牌查看农谚"><span className="season-front"><small>二十四节气</small><b>春 · 夏 · 秋 · 冬</b><i><RotateCw size={18} />点击翻牌</i></span><span className="season-back"><small>农事经验</small><b>{proverbIndex >= 0 ? PROVERBS[proverbIndex] : PROVERBS[0]}</b><i>已查看 {views} 条</i></span></button>
        {stage === "exploring" && <div className="operation-hud seasons-hud"><span><CloudRain size={18} />经验农事</span><strong>{views}<small> 条农谚</small></strong><div><i style={{ width: `${Math.min(100, views * 34)}%` }} /></div><p>{gearRevealed ? "蓑衣斗笠已查看" : "点击蓑衣斗笠查看细节"}</p><button className="primary-button compact" disabled={views < 1} onClick={() => setStage("narrating")}>完成观察<ArrowRight size={16} /></button></div>}
        {stage === "ready" && <div className="overlay-panel scene-intro-panel"><span className="panel-icon"><CloudRain size={22} /></span><span className="question-step">互动 03 · 靠天吃饭</span><h1>没有天气预报，农事如何安排？</h1><p>取下蓑衣斗笠查看细节，并翻转节气牌，至少阅读一条传承下来的农谚。</p><button className="primary-button" onClick={start}>开始探索<ArrowRight size={18} /></button>{error && <p className="inline-error">{error}</p>}</div>}
        {stage === "narrating" && <div className="overlay-panel narration-panel"><span className="panel-icon"><VolumeX size={22} /></span><span className="subtitle-mode">字幕模式</span><h2>经验可以传承，却无法替代实时预报</h2><p>过去没有现代天气预报，农民依靠二十四节气和祖辈农谚安排农事。遇到突发台风、暴雨或干旱时，应对手段十分有限。</p><div className="narration-track"><i style={{ width: `${narration}%` }} /></div><button className="primary-button" disabled={narration < 100} onClick={() => setStage("question")}>回答风险问题<ArrowRight size={18} /></button></div>}
        {(stage === "question" || stage === "submitting" || stage === "completed") && <div className="overlay-panel question-panel"><span className="panel-icon"><CloudRain size={22} /></span><span className="question-step">风险判断 {answers.length ? "· 再试一次" : ""}</span><h2>{question?.prompt ?? "依靠经验安排农事，最大的风险是什么？"}</h2><div className="option-grid">{(question?.options ?? OPTIONS.map(([, label]) => label)).map((label, index) => { const key = String.fromCharCode(65 + index); return <button disabled={stage !== "question"} key={`${key}-${label}`} onClick={(event) => void choose(key, event.timeStamp)}><b>{key}</b><span>{label}</span></button>; })}</div>{error && <p className="inline-error">{error}</p>}</div>}
        {stage === "feedback" && <div className="overlay-panel feedback-panel"><span className="panel-icon warning"><CloudRain size={22} /></span><span className="question-step">再聚焦最严重的后果</span><h2>哪些风险会直接毁掉整年收成？</h2><p>地区差异和经验传承都会影响判断，但突发台风、暴雨或干旱往往来得更快、损失也更直接。</p><button className="primary-button" onClick={() => setStage("question")}>重新选择<ArrowRight size={18} /></button></div>}
        {stage === "completed" && result && <InteractionCompletionDialog
          title="节气经验观察"
          nextRoute="/student/unit-01/activity/u01-mod-01-harvester"
          mapRoute="/student/unit-01"
          description={result.finalCorrect ? "你已经理解“靠天吃饭”的核心风险，本次观察记录已保存。" : "反馈与修正过程已经保存，极端天气是经验农事的核心风险。"}
        />}
      </section>
    </main>
  );
}
