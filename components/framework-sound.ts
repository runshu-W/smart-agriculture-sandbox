"use client";
import { useEffect, useRef, useState } from "react";
export function useFrameworkSound() {
  const context = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false), [error, setError] = useState("");
  useEffect(() => () => { void context.current?.close(); }, []);
  async function toggle() {
    if (enabled) { setEnabled(false); return; }
    try { context.current ??= new AudioContext(); await context.current.resume(); setEnabled(true); setError(""); }
    catch { setError("反馈音暂不可用，文字与动效会正常反馈。"); }
  }
  function play(correct: boolean) {
    const audio = context.current;
    if (!enabled || audio?.state !== "running") return;
    const oscillator = audio.createOscillator(), gain = audio.createGain(), duration = correct ? .5 : .3;
    oscillator.type = "sine"; oscillator.frequency.setValueAtTime(correct ? 660 : 220, audio.currentTime); oscillator.frequency.linearRampToValueAtTime(correct ? 880 : 160, audio.currentTime + duration);
    gain.gain.setValueAtTime(.0001, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.06, audio.currentTime + .02); gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  return { enabled, error, toggle, play };
}
