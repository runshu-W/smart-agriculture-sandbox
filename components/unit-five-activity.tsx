"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionCompletionDialog } from "@/components/interaction-completion-dialog";
import { UnitFiveOperation } from "@/components/unit-five-operation";
import { ManagedQuestionsProvider, type ManagedQuestionResponse } from "@/components/managed-questions-provider";
import { beginSimpleInteraction, getClientTimestamp, submitSimpleInteraction } from "@/lib/client/simple-interaction";
import type { UnitFiveInteraction } from "@/lib/curriculum";
import type { ActivityContent } from "@/lib/unit-one-content";

export type UnitFiveEvidence = {
  completedInteractionIds?: string[];
  latestByInteraction?: Record<string, Record<string, unknown>>;
  privateByInteraction?: Record<string, Record<string, unknown>>;
  abilities?: { baseline: number[]; current: number[] };
  allCompletedCount?: number;
};
export type UnitFiveCompletion = {
  summary: Record<string, boolean | number | string>;
  privateContent?: Record<string, string | string[]>;
};

export function UnitFiveActivity({ interaction, content, evidence, nextRoute }: { interaction: UnitFiveInteraction; content: ActivityContent; evidence: UnitFiveEvidence; nextRoute: string }) {
  const startedAt = useRef(getClientTimestamp());
  const attemptId = useRef<string | null>(null);
  const questionResponses = useRef<ManagedQuestionResponse[]>([]);
  const starting = useRef<Promise<string> | null>(null);
  const [phase, setPhase] = useState<"action" | "complete">("action");
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [retry, setRetry] = useState<UnitFiveCompletion | null>(null);

  const ensureAttempt = useCallback(async () => {
    if (attemptId.current) return attemptId.current;
    if (!starting.current) {
      starting.current = beginSimpleInteraction(interaction.id, "unit-five-map").then((attempt) => {
        attemptId.current = attempt.attemptId;
        return attempt.attemptId;
      }).finally(() => { starting.current = null; });
    }
    return starting.current;
  }, [interaction.id]);
  const recordQuestionResponse = useCallback((response: ManagedQuestionResponse) => {
    const index = questionResponses.current.findIndex((item) => item.key === response.key);
    if (index >= 0) questionResponses.current[index] = response;
    else questionResponses.current.push(response);
  }, []);

  useEffect(() => { void ensureAttempt().catch(() => setSubmitError("无法建立学习记录，请检查数据库服务后重试")); }, [ensureAttempt]);

  async function finish(result: UnitFiveCompletion) {
    if (pending) return;
    setPending(true);
    setSubmitError("");
    setRetry(result);
    try {
      const id = await ensureAttempt();
      await submitSimpleInteraction(interaction.id, id, {
        durationMs: getClientTimestamp() - startedAt.current,
        narrationCompleted: false,
        answers: questionResponses.current.map((item) => item.answer),
        questionResponses: questionResponses.current,
        actionSummary: result.summary,
        privateContent: result.privateContent,
      });
      setPhase("complete");
      setRetry(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "学习记录保存失败，请重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="experience-shell full-activity-shell unit-five-activity-shell">
      <header className="experience-header">
        <Link aria-label="返回第五单元地图" href="/student/unit-05"><ArrowLeft /></Link>
        <div><small>第五单元 · {interaction.section}</small><strong>{interaction.title}</strong></div>
        <span className="step-label">{phase === "action" ? "规划操作" : "证据已保存"}</span>
      </header>
      <section className={`unit-activity-stage unit-five-stage phase-${phase}`}>
        <Image alt="" fill priority sizes="100vw" src={content.background} />
        <div className="activity-stage-shade u05-stage-shade" />
        <div className="activity-workspace u05-workspace">
          <div className="activity-brief u05-brief">
            <span>{content.eyebrow}</span><h1>{interaction.title}</h1><p>{content.description}</p><small>{content.instruction}</small>
            <div className="psych-safety"><ShieldCheck /><p><b>生涯安全</b>岗位分数和结局只是基于当前证据的可调整参考；规划、信件与自由文字默认私密。</p></div>
          </div>
          <ManagedQuestionsProvider interactionId={interaction.id} onAnswer={recordQuestionResponse}><UnitFiveOperation evidence={evidence} interaction={interaction} onComplete={finish} pending={pending} /></ManagedQuestionsProvider>
        </div>
        {phase === "complete" && <InteractionCompletionDialog description="选择、过程、用时与完成状态已保存；私密正文不会进入教师看板。" eyebrow="生涯证据已写入" mapRoute="/student/unit-05" nextRoute={nextRoute} title={interaction.title} />}
        {pending && <div className="u02-saving">正在保存生涯证据…</div>}
        {submitError && <div className="submission-error" role="alert"><AlertTriangle /><span>{submitError}</span><button onClick={() => retry ? void finish(retry) : void ensureAttempt()}>重试</button></div>}
      </section>
    </main>
  );
}
