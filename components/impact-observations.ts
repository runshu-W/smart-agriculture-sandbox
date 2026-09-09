"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImpactObservation, ImpactRegion } from "@/lib/classroom-impact";
type Batch = { batchId: string; observations: ImpactObservation[] };
type Buffer = { batches: Batch[]; draft: ImpactObservation[] };
export function useImpactObservations(lessonId: string, sessionId: string | undefined, enabled: boolean, elapsed: number, closedAt: number | null, synced: boolean) {
  const buffer = useRef<Buffer>({ batches: [], draft: [] });
  const storeKey = useRef("");
  const hovered = useRef<{ region: ImpactRegion; at: number } | null>(null);
  const clock = useRef(0);
  const allowed = useRef(false);
  const closed = useRef(false);
  const acknowledged = useRef(synced);
  const flushNow = useRef<(() => Promise<void>) | null>(null);
  const [saveStatus, setSaveStatus] = useState("查看事件，留下你的观察记录");
  const persist = useCallback(() => {
    try { if (storeKey.current) localStorage.setItem(storeKey.current, JSON.stringify(buffer.current)); }
    catch { setSaveStatus("设备存储不可用，请保持页面开启等待上传"); }
  }, []);
  const append = useCallback((item: ImpactObservation) => {
    if (!storeKey.current) return;
    if (buffer.current.batches.length * 100 + buffer.current.draft.length >= 3000) { setSaveStatus("缓存已满，请恢复网络后继续观察"); return; }
    buffer.current.draft.push(item); persist(); setSaveStatus("观察记录待同步");
  }, [persist]);
  const leave = useCallback(() => {
    const active = hovered.current;
    if (active) {
      const durationMs = Math.max(0, Math.round(clock.current - active.at));
      if (durationMs >= 150) append({ region: active.region, kind: "dwell", atMs: Math.round(clock.current), durationMs });
    }
    hovered.current = null;
  }, [append]);
  useEffect(() => {
    clock.current = elapsed;
    allowed.current = enabled;
    if (!enabled) leave();
  }, [elapsed, enabled, leave]);
  useEffect(() => { closed.current = closedAt !== null; if (closed.current) void flushNow.current?.(); }, [closedAt]);
  useEffect(() => {
    if (!sessionId) return;
    let tabId: string;
    try { tabId = sessionStorage.getItem("impact-tab") || crypto.randomUUID(); sessionStorage.setItem("impact-tab", tabId); }
    catch { tabId = crypto.randomUUID(); }
    storeKey.current = `impact-v1:${sessionId}:${tabId}`;
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey.current) || "null");
      if (saved && Array.isArray(saved.batches) && Array.isArray(saved.draft)) buffer.current = saved;
    } catch { buffer.current = { batches: [], draft: [] }; }
    let sending = false, stopped = false;
    const pack = () => {
      while (buffer.current.draft.length) buffer.current.batches.push({ batchId: crypto.randomUUID(), observations: buffer.current.draft.splice(0, 100) });
      persist();
    };
    const flush = async () => {
      if (sending || stopped) return;
      pack();
      if (!buffer.current.batches.length && (!closed.current || acknowledged.current)) return;
      sending = true;
      try {
        while (buffer.current.batches.length && !stopped) {
          const batch = buffer.current.batches[0];
          const response = await fetch(`/api/classroom/${lessonId}/impact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(batch), signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error();
          buffer.current.batches.shift(); persist();
        }
        if (!stopped && closed.current && !acknowledged.current && !buffer.current.draft.length) {
          const response = await fetch(`/api/classroom/${lessonId}/impact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batchId: crypto.randomUUID(), observations: [], complete: true }), signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error();
          acknowledged.current = true;
        }
        if (!stopped) setSaveStatus("观察记录已同步");
      } catch { if (!stopped) setSaveStatus("记录保留在本机，恢复连接后自动同步"); }
      finally { sending = false; }
    };
    const hide = () => {
      if (document.visibilityState === "hidden") { leave(); pack(); for (const batch of buffer.current.batches.slice(0, 3)) navigator.sendBeacon(`/api/classroom/${lessonId}/impact`, new Blob([JSON.stringify(batch)], { type: "application/json" })); }
    };
    const blur = () => leave();
    const timer = setInterval(() => { const region = hovered.current?.region; leave(); if (region && allowed.current && !document.hidden) hovered.current = { region, at: clock.current }; void flush(); }, 4000);
    // Clear dwell on focus loss so hidden time is never counted as attention.
    window.addEventListener("blur", blur); window.addEventListener("online", flush); document.addEventListener("visibilitychange", hide);
    flushNow.current = flush;
    void flush();
    return () => { leave(); pack(); for (const batch of buffer.current.batches.slice(0, 3)) navigator.sendBeacon(`/api/classroom/${lessonId}/impact`, new Blob([JSON.stringify(batch)], { type: "application/json" })); stopped = true; clearInterval(timer); window.removeEventListener("blur", blur); window.removeEventListener("online", flush); document.removeEventListener("visibilitychange", hide); storeKey.current = ""; };
  }, [lessonId, sessionId, persist, leave]);
  return {
    saveStatus,
    enter: (region: ImpactRegion) => { if (!allowed.current || document.hidden) return; if (hovered.current?.region === region) return; leave(); hovered.current = { region, at: clock.current }; },
    leave,
    view: (region: ImpactRegion) => { if (allowed.current && !document.hidden) append({ region, kind: "view", atMs: Math.round(clock.current), durationMs: 0 }); },
  };
}
