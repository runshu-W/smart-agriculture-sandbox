import { THRESHER_CORRECT_ANSWER, THRESHER_TARGET_MS } from "@/lib/constants";

export type ThresherResultInput = {
  effectiveDurationMs: number;
  narrationCompleted: boolean;
  answers: string[];
};

export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

export function angularDelta(previous: number, next: number) {
  const delta = normalizeAngle(next) - normalizeAngle(previous);
  return delta > 180 ? delta - 360 : delta < -180 ? delta + 360 : delta;
}

export function calculateThresherScore(input: ThresherResultInput) {
  const operationScore = input.effectiveDurationMs >= THRESHER_TARGET_MS ? 40 : 0;
  const narrationScore = input.narrationCompleted ? 20 : 0;
  const firstCorrect = input.answers[0] === THRESHER_CORRECT_ANSWER;
  const finalCorrect = input.answers.some((answer) => answer === THRESHER_CORRECT_ANSWER);
  const answerScore = firstCorrect ? 40 : finalCorrect ? 30 : input.answers.length >= 2 ? 20 : 0;

  return {
    score: operationScore + narrationScore + answerScore,
    firstCorrect,
    finalCorrect,
    completed: operationScore === 40 && narrationScore === 20 && input.answers.length > 0,
  };
}
