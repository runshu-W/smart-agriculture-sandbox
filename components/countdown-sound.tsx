"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
export function CountdownSound({ remaining, running }: { remaining: number; running: boolean }) {
  const context = useRef<AudioContext | null>(null), last = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false), [error, setError] = useState("");
  const second = Math.ceil(remaining / 1000);
  useEffect(() => () => { void context.current?.close(); }, []);
  useEffect(() => {
    if (!enabled || !running || second < 1 || second > 10 || last.current === second || context.current?.state !== "running") return;
    last.current = second;
    const audio = context.current, oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = "sine"; oscillator.frequency.value = 900;
    gain.gain.setValueAtTime(.0001, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.06, audio.currentTime + .005); gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .065);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .07);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }, [enabled, running, second]);
  async function toggle() {
    if (enabled) { setEnabled(false); return; }
    try { context.current ??= new AudioContext(); await context.current.resume(); setEnabled(true); setError(""); }
    catch { setError("提示音暂不可用，请参考屏幕倒计时。"); }
  }
  return <div className="countdown-sound"><button className="classroom-secondary" aria-pressed={enabled} onClick={() => void toggle()}>{enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}{enabled ? "关闭倒计时提示音" : "开启倒计时提示音"}</button><small>{error || "最后10秒，每秒轻提示；可随时静音。"}</small></div>;
}
