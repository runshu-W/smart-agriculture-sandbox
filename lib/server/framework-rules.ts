import type { FrameworkEvent, FrameworkLayer, FrameworkProgress } from "@/lib/classroom-framework";
// Answer key stays in the server graph. Public teaching content contains no answer mapping.
const ANSWERS: Record<FrameworkEvent, FrameworkLayer> = { ai: "macro", farmer: "micro", hesitation: "self" };
export function mapFramework(progress: FrameworkProgress, event: FrameworkEvent, layer: FrameworkLayer) {
  const previous = progress[event];
  if (previous?.solved) return progress;
  const correct = ANSWERS[event] === layer;
  return { ...progress, [event]: { attempts: (previous?.attempts ?? 0) + 1, firstCorrect: previous?.firstCorrect ?? correct, solved: correct, lastLayer: layer } } satisfies FrameworkProgress;
}
