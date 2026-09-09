export type SimpleInteractionResultInput = {
  isEntry: boolean;
  actionCompleted: boolean;
  narrationCompleted: boolean;
  requiresNarration: boolean;
  answers: string[];
  acceptedAnswers: readonly string[];
};

export function calculateSimpleInteractionResult(input: SimpleInteractionResultInput) {
  const hasQuestion = input.acceptedAnswers.length > 0;
  const firstCorrect = hasQuestion ? input.acceptedAnswers.includes(input.answers[0] ?? "") : true;
  const finalCorrect = hasQuestion ? input.answers.some((answer) => input.acceptedAnswers.includes(answer)) : true;
  const answerCompleted = !hasQuestion || finalCorrect || input.answers.length >= 2;
  const narrationCompleted = !input.requiresNarration || input.narrationCompleted;
  const completed = input.actionCompleted && narrationCompleted && answerCompleted;
  const score = input.isEntry
    ? input.actionCompleted ? 100 : 0
    : (input.actionCompleted ? 40 : 0)
      + (narrationCompleted ? 20 : 0)
      + (firstCorrect ? 40 : finalCorrect ? 30 : input.answers.length >= 2 ? 20 : 0);

  return { score, firstCorrect, finalCorrect, completed };
}
