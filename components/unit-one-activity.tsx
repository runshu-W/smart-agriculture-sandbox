"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, RotateCcw, Sparkles, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UnitOneInteraction } from "@/lib/curriculum";
import { SIMPLE_INTERACTION_RULES } from "@/lib/curriculum";
import type { ActivityContent } from "@/lib/unit-one-content";
import { beginSimpleInteraction, getClientTimestamp, submitSimpleInteraction } from "@/lib/client/simple-interaction";
import { UnitOneOperation } from "@/components/unit-one-operation";
import { InteractionCompletionDialog } from "@/components/interaction-completion-dialog";

type Phase = "action" | "narration" | "question" | "complete";
type SubmissionArgs = [
  Record<string, boolean | number | string>,
  string[],
  boolean,
  Record<string, string | string[]> | undefined,
];

export function UnitOneActivity({
  interaction,
  content,
  evidence,
  nextRoute,
}: {
  interaction: UnitOneInteraction;
  content: ActivityContent;
  evidence: Record<string, unknown>;
  nextRoute: string;
}) {
  const startedAt = useRef(0);
  const attemptId = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("action");
  const [completedFrom, setCompletedFrom] = useState<Exclude<Phase, "complete">>("action");
  const [actionSummary, setActionSummary] = useState<Record<string, boolean | number | string>>({});
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [retrySubmission, setRetrySubmission] = useState<SubmissionArgs | null>(null);
  const [managedQuestion, setManagedQuestion] = useState<{ key: string; prompt: string; options: string[]; version: number } | null>(null);
  const rule = SIMPLE_INTERACTION_RULES[interaction.id];

  useEffect(() => {
    let active = true;
    fetch(`/api/student/questions/${interaction.id}`).then((response) => response.ok ? response.json() : null).then((data) => {
      if (active && data?.questions?.[0]) setManagedQuestion(data.questions[0]);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [interaction.id]);

  async function ensureAttempt() {
    if (!startedAt.current) startedAt.current = getClientTimestamp();
    if (attemptId.current) return attemptId.current;
    const attempt = await beginSimpleInteraction(interaction.id, "unit-one-map");
    attemptId.current = attempt.attemptId;
    return attempt.attemptId;
  }

  async function finish(summary: Record<string, boolean | number | string>, submittedAnswers = answers, narrationCompleted = Boolean(content.narration), privateContent?: Record<string, string | string[]>) {
    setPending(true);
    setSubmitError("");
    setRetrySubmission([summary, submittedAnswers, narrationCompleted, privateContent]);
    try {
      const id = await ensureAttempt();
      await submitSimpleInteraction(interaction.id, id, {
        durationMs: getClientTimestamp() - startedAt.current,
        narrationCompleted,
        answers: submittedAnswers,
        actionSummary: summary,
        privateContent,
      });
      setCompletedFrom(phase === "complete" ? "action" : phase);
      setPhase("complete");
      setRetrySubmission(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "学习记录保存失败，请重试");
    } finally {
      setPending(false);
    }
  }

  async function handleAction(result: { summary: Record<string, boolean | number | string>; privateContent?: Record<string, string | string[]> }) {
    if (pending) return;
    setPending(true);
    setSubmitError("");
    try {
      await ensureAttempt();
      setActionSummary(result.summary);
      if (content.narration) setPhase("narration");
      else await finish(result.summary, [], false, result.privateContent);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "无法建立学习记录，请重试");
    } finally {
      setPending(false);
    }
  }

  function finishNarration() {
    if (content.question) setPhase("question");
    else void finish(actionSummary, [], true);
  }

  async function submitAnswer(answer: string) {
    if (pending) return;
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    let correct = rule.acceptedAnswers.includes(answer);
    let managedFeedback = "";
    if (managedQuestion) {
      const response = await fetch(`/api/student/questions/${interaction.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: managedQuestion.key, answer }) });
      if (response.ok) { const result = await response.json(); correct = Boolean(result.correct); managedFeedback = String(result.feedback ?? ""); }
    }
    if (correct || nextAnswers.length >= 2) {
      setFeedback(managedFeedback || (correct ? content.correctFeedback ?? "回答准确。" : "你已完成思考，农小智会保留这次学习证据。下一次可以继续调整判断。"));
      window.setTimeout(() => void finish(actionSummary, nextAnswers, true), 650);
    } else {
      setFeedback(managedFeedback || content.retryFeedback || "再观察一次场景线索，你还有一次调整机会。");
    }
  }

  const visiblePhase = phase === "complete" ? completedFrom : phase;

  return (
    <main className="experience-shell full-activity-shell">
      <header className="experience-header">
        <Link aria-label="返回第一单元地图" href="/student/unit-01"><ArrowLeft /></Link>
        <div><small>第一单元 · {interaction.section}</small><strong>{interaction.title}</strong></div>
        <span className="step-label">{phase === "complete" ? "证据已保存" : phase === "action" ? "操作" : phase === "narration" ? "讲解" : "判断"}</span>
      </header>
      <section className={`unit-activity-stage phase-${visiblePhase}`}>
        <Image alt="" fill priority sizes="100vw" src={content.background} />
        <div className="activity-stage-shade" />
        {visiblePhase === "action" && (
          <div className="activity-workspace">
            <div className="activity-brief">
              <span>{content.eyebrow}</span>
              <h1>{interaction.title}</h1>
              <p>{content.description}</p>
              <small>{content.instruction}</small>
            </div>
            <UnitOneOperation evidence={evidence} interaction={interaction} onComplete={handleAction} pending={pending} />
          </div>
        )}
        {visiblePhase === "narration" && (
          <div className="activity-dialog">
            <Image className="nxz-portrait" alt="农小智" height={245} src="/assets/global/characters/nongxiaozhi/portrait-v002.png" width={233} />
            <div><span><VolumeX size={17} />字幕讲解 · 音频暂不可用</span><h2>{interaction.title}背后的职业变化</h2><p>{content.narration}</p><button className="primary-button" onClick={finishNarration}>理解了，继续判断<ArrowRight size={17} /></button></div>
          </div>
        )}
        {visiblePhase === "question" && (
          <div className="activity-question overlay-panel">
            <span className="eyebrow">场景判断</span><h2>{managedQuestion?.prompt ?? content.question}</h2>
            <div className="option-grid">{(managedQuestion ? managedQuestion.options.map((label, index) => ({ id: String.fromCharCode(65 + index), label })) : content.choices)?.map((choice) => <button disabled={pending || answers.includes(choice.id)} key={choice.id} onClick={() => void submitAnswer(choice.id)}><b>{choice.id}</b>{choice.label}</button>)}</div>
            {feedback && <p className="safe-feedback"><Sparkles size={17} />{feedback}</p>}
            {answers.length === 1 && <small className="retry-note"><RotateCcw size={15} />可以根据提示调整一次，不记录负向标签。</small>}
          </div>
        )}
        {phase === "complete" && <InteractionCompletionDialog description="本次操作、停留、分支、完成状态和用时已同步到成长档案与教师汇总。" mapRoute="/student/unit-01" nextRoute={nextRoute} title={interaction.title} />}
        {submitError && (
          <div className="submission-error" role="alert">
            <AlertTriangle size={18} />
            <span>{submitError}</span>
            {retrySubmission
              ? <button onClick={() => void finish(...retrySubmission)}>重试保存</button>
              : <button onClick={() => setSubmitError("")}>返回操作</button>}
          </div>
        )}
      </section>
    </main>
  );
}
