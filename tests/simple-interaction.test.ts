import { describe, expect, it } from "vitest";
import { calculateSimpleInteractionResult } from "@/lib/game/simple-interaction";

describe("M2-A simple interaction scoring", () => {
  it("requires the scene action and narration before completing", () => {
    expect(calculateSimpleInteractionResult({
      isEntry: false,
      actionCompleted: true,
      narrationCompleted: false,
      requiresNarration: true,
      answers: ["A"],
      acceptedAnswers: ["A"],
    })).toMatchObject({ completed: false, score: 80 });
  });

  it("awards a psychologically safe corrected retry", () => {
    expect(calculateSimpleInteractionResult({
      isEntry: false,
      actionCompleted: true,
      narrationCompleted: true,
      requiresNarration: true,
      answers: ["B", "A"],
      acceptedAnswers: ["A"],
    })).toEqual({ completed: true, score: 90, firstCorrect: false, finalCorrect: true });
  });

  it("completes the invitation from its required action alone", () => {
    expect(calculateSimpleInteractionResult({
      isEntry: true,
      actionCompleted: true,
      narrationCompleted: false,
      requiresNarration: false,
      answers: [],
      acceptedAnswers: [],
    })).toEqual({ completed: true, score: 100, firstCorrect: true, finalCorrect: true });
  });
});
