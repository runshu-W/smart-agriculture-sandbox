"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionCompletionDialog } from "@/components/interaction-completion-dialog";
import { UnitFourOperation } from "@/components/unit-four-operation";
import { ManagedQuestionsProvider, type ManagedQuestionResponse } from "@/components/managed-questions-provider";
import { beginSimpleInteraction, getClientTimestamp, submitSimpleInteraction } from "@/lib/client/simple-interaction";
import type { UnitFourInteraction } from "@/lib/curriculum";
import type { ActivityContent } from "@/lib/unit-one-content";

export type UnitFourEvidence = {
  completedInteractionIds?: string[];
  latestByInteraction?: Record<string, Record<string, unknown>>;
  privateByInteraction?: Record<string, Record<string, unknown>>;
};
export type UnitFourCompletion = {
  summary: Record<string, boolean | number | string>;
  privateContent?: Record<string, string | string[]>;
};

export function UnitFourActivity({ interaction, content, evidence, nextRoute }: { interaction: UnitFourInteraction; content: ActivityContent; evidence: UnitFourEvidence; nextRoute: string }) {
  const startedAt = useRef(getClientTimestamp());
  const attemptId = useRef<string | null>(null);
  const questionResponses = useRef<ManagedQuestionResponse[]>([]);
  const starting = useRef<Promise<string> | null>(null);
  const [phase, setPhase] = useState<"action" | "complete">("action");
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [retry, setRetry] = useState<UnitFourCompletion | null>(null);

  const ensureAttempt = useCallback(async () => {
    if (attemptId.current) return attemptId.current;
    if (!starting.current) {
      starting.current = beginSimpleInteraction(interaction.id, "unit-four-map").then((attempt) => {
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

  async function finish(result: UnitFourCompletion) {
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
    <main className="experience-shell full-activity-shell unit-four-activity-shell">
      <header className="experience-header">
        <Link aria-label="返回第四单元地图" href="/student/unit-04"><ArrowLeft /></Link>
        <div><small>第四单元 · {interaction.section}</small><strong>{interaction.title}</strong></div>
        <span className="step-label">{phase === "action" ? "学习操作" : "证据已保存"}</span>
      </header>
      <section className={`unit-activity-stage unit-four-stage phase-${phase}`}>
        <Image alt="" fill priority sizes="100vw" src={content.background} />
        <div className="activity-stage-shade u04-stage-shade" />
        <div className="activity-workspace u04-workspace">
          <div className="activity-brief u04-brief">
            <span>{content.eyebrow}</span><h1>{interaction.title}</h1><p>{content.description}</p><small>{content.instruction}</small>
            <div className="psych-safety"><ShieldCheck /><p><b>学习安全</b>能力画像来自本次行为证据，不作人格优劣判断；计划、笔记和讨论原文默认私密。</p></div>
          </div>
          <ManagedQuestionsProvider interactionId={interaction.id} onAnswer={recordQuestionResponse}><UnitFourOperation evidence={evidence} interaction={interaction} onComplete={finish} pending={pending} /></ManagedQuestionsProvider>
        </div>
        {phase === "complete" && <InteractionCompletionDialog description="过程操作、方法分支、用时与完成状态已保存；私密文字不会进入教师看板。" mapRoute="/student/unit-04" nextRoute={nextRoute} title={interaction.title} />}
        {pending && <div className="u02-saving">正在保存学习证据…</div>}
        {submitError && <div className="submission-error" role="alert"><AlertTriangle /><span>{submitError}</span><button onClick={() => retry ? void finish(retry) : void ensureAttempt()}>重试</button></div>}
      </section>
    </main>
  );
}
