"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MailOpen, Sparkles } from "lucide-react";
import { beginSimpleInteraction, submitSimpleInteraction } from "@/lib/client/simple-interaction";

const ID = "u01-entry-invitation";

export function UnitEntryExperience() {
  const router = useRouter();
  const [stage, setStage] = useState<"ready" | "opening" | "opened" | "submitting">("ready");
  const [attemptId, setAttemptId] = useState("");
  const [error, setError] = useState("");
  const startedAt = useRef(0);

  async function openInvitation() {
    try {
      setError("");
      setStage("opening");
      const attempt = await beginSimpleInteraction(ID, "project-home");
      setAttemptId(attempt.attemptId);
      startedAt.current = performance.now();
      window.setTimeout(() => setStage("opened"), 850);
    } catch {
      setStage("ready");
      setError("暂时无法打开邀请函，请稍后重试。 ");
    }
  }

  async function enterHall() {
    if (!attemptId) return;
    try {
      setStage("submitting");
      await submitSimpleInteraction(ID, attemptId, {
        durationMs: Math.round(performance.now() - startedAt.current),
        narrationCompleted: false,
        answers: [],
        actionSummary: { invitationOpened: true },
      });
      router.push("/student/unit-01/traditional/plow");
      router.refresh();
    } catch {
      setStage("opened");
      setError("进度保存失败，请再次进入。 ");
    }
  }

  return (
    <main className="experience-shell entry-experience">
      <header className="experience-header">
        <Link href="/student/unit-01" aria-label="返回第一单元"><ArrowLeft size={21} /></Link>
        <div><span>第一单元 · 时代之门</span><strong>智慧农业元宇宙邀请函</strong></div>
        <div className="experience-progress"><i style={{ width: stage === "ready" ? "5%" : stage === "opened" ? "100%" : "55%" }} /></div>
        <span className="step-label">入口</span>
      </header>
      <section className={`entry-stage invitation-${stage}`}>
        <Image src="/assets/unit-01/scenes/entry-hall-v001.webp" alt="连接传统、现代与智慧农业的时代展厅入口" fill priority sizes="100vw" />
        <div className="entry-stage-shade" />
        <Image className="entry-nxz nxz-portrait" src="/assets/global/characters/nongxiaozhi/portrait-v002.png" alt="农小智" width={776} height={817} priority />
        <div className="invitation-wrap">
          <div className="invitation-envelope" aria-hidden="true"><i /><b><Sparkles size={23} /></b></div>
          <div className="invitation-letter">
            <span>来自农小智的邀请</span>
            <h1>欢迎进入时代之门</h1>
            <p>你将穿越传统、现代与智慧农业三个时代，亲手体验工具、数据与职业如何一起改变乡村。</p>
            <div className="invitation-route"><span>1980s</span><i /><span>2010s</span><i /><span>2025s</span></div>
          </div>
          {stage === "ready" && <button className="primary-button" onClick={openInvitation}><MailOpen size={18} />拆开邀请函</button>}
          {(stage === "opened" || stage === "submitting") && <button className="primary-button" disabled={stage === "submitting"} onClick={enterHall}>进入传统农业馆<ArrowRight size={18} /></button>}
          {error && <p className="inline-error">{error}</p>}
        </div>
        <div className="entry-guide-line"><span>农小智</span><p>{stage === "ready" ? "你的智慧农业职业旅程，从认识时代开始。" : "先去看看一头牛、一把犁怎样完成一天的耕作。"}</p></div>
      </section>
    </main>
  );
}
