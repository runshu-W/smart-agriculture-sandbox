"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { MapCard, MapSignal } from "@/lib/classroom-completion";
type Draft = { signals: MapSignal[]; version: number; operationId: string; dirty: boolean; complete: boolean };
const subscribe = (notify: () => void) => { window.addEventListener("map-draft", notify); window.addEventListener("storage", notify); return () => { window.removeEventListener("map-draft", notify); window.removeEventListener("storage", notify); }; };
function read(key: string | null) { try { return key ? localStorage.getItem(key) : null; } catch { return null; } }
function parse(value: string | null): Draft | null { try { const result = JSON.parse(value || "null"); return result && Array.isArray(result.signals) && Number.isInteger(result.version) ? result : null; } catch { return null; } }
export function useChangeMapDraft(lessonId: string, sessionId: string | undefined, own: MapCard | undefined, connected: boolean, canShare: boolean) {
  const key = sessionId ? `change-map:v1:${sessionId}` : null;
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const stored = useMemo(() => parse(raw), [raw]), canonicalVersion = own?.version ?? 0;
  const draft = stored && (stored.dirty || stored.version >= canonicalVersion) ? stored : null;
  const [fallback, setFallback] = useState<Draft | null>(null);
  const current = fallback ?? draft;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<{ version: number; signals: MapSignal[] } | null>(null);
  const latest = useRef(current);
  useEffect(() => { latest.current = current; }, [current]);
  const write = useCallback((value: Draft) => {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(value)); setFallback(null); window.dispatchEvent(new Event("map-draft")); }
    catch { setFallback(value); setError("浏览器无法保存本地草稿，请保持页面打开直到云端保存完成。"); }
  }, [key]);
  const writeRef = useRef(write);
  useEffect(() => { writeRef.current = write; }, [write]);
  useEffect(() => {
    if (!current?.dirty || !connected || pending || conflict || !key) return;
    const queued = current;
    const timer = setTimeout(async () => {
      const sent = queued.complete && !canShare ? { ...queued, complete: false, operationId: crypto.randomUUID() } : queued;
      setPending(true);
      if (sent !== queued) writeRef.current(sent);
      try {
        const response = await fetch(`/api/classroom/${lessonId}/map`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", operationId: sent.operationId, version: sent.version, signals: sent.signals, complete: sent.complete }), signal: AbortSignal.timeout(10000) });
        const result = await response.json();
        if (result.conflict) { setConflict(result); setError("另一处修改已保存。请比较后选择保留哪个版本。"); return; }
        if (!response.ok) throw new Error(result.error);
        const newest = parse(read(key)) ?? latest.current ?? sent;
        if (newest.operationId === sent.operationId) writeRef.current({ ...sent, version: result.version, signals: result.signals, dirty: false, complete: false });
        else writeRef.current({ ...newest, version: result.version });
        setError("");
      } catch (reason) { setError(reason instanceof Error ? reason.message : "保存暂未确认，草稿已保留，会自动重试。"); }
      finally { setPending(false); }
    }, error ? 2500 : current.complete ? 100 : 600);
    return () => clearTimeout(timer);
  }, [raw, fallback, connected, pending, conflict, key, lessonId, error, canonicalVersion, current, canShare]);
  function change(signals: MapSignal[], complete = false) { write({ signals, version: current?.version ?? canonicalVersion, operationId: crypto.randomUUID(), dirty: true, complete }); }
  return { signals: current?.signals ?? own?.signals ?? [], pending, dirty: !!current?.dirty, error, conflict,
    change, resolve: (keepMine: boolean) => { if (!conflict) return; write({ signals: keepMine ? current?.signals ?? [] : conflict.signals, version: conflict.version, operationId: crypto.randomUUID(), dirty: keepMine, complete: false }); setConflict(null); setError(""); } };
}
