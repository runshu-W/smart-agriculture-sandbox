"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ManagedQuestion = { id: string; key: string; prompt: string; options: string[]; version: number };
export type ManagedQuestionResponse = { key: string; answer: string; correct: boolean; version: number };
type ContextValue = { interactionId: string; loading: boolean; questions: ManagedQuestion[]; check: (question: ManagedQuestion, answer: string) => Promise<{ correct: boolean; feedback: string }> };
const ManagedQuestionsContext = createContext<ContextValue | null>(null);

export function ManagedQuestionsProvider({ interactionId, children, onAnswer }: { interactionId: string; children: React.ReactNode; onAnswer?: (response: ManagedQuestionResponse) => void }) {
  const [questions, setQuestions] = useState<ManagedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch(`/api/student/questions/${interactionId}`).then((response) => response.ok ? response.json() : null).then((data) => { if (active && Array.isArray(data?.questions)) setQuestions(data.questions); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [interactionId]);
  const value = useMemo<ContextValue>(() => ({
    interactionId,
    loading,
    questions,
    check: async (question, answer) => {
      const response = await fetch(`/api/student/questions/${interactionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: question.key, answer }) });
      if (!response.ok) return { correct: false, feedback: "答案已记录，请继续结合场景思考。" };
      const result = await response.json() as { correct: boolean; feedback: string };
      onAnswer?.({ key: question.key, answer, correct: result.correct, version: question.version });
      return result;
    },
  }), [interactionId, loading, onAnswer, questions]);
  return <ManagedQuestionsContext.Provider value={value}>{children}</ManagedQuestionsContext.Provider>;
}

export function useManagedQuestion(index = 0, key?: string) {
  const context = useContext(ManagedQuestionsContext);
  const question = key ? context?.questions.find((item) => item.key === key) : context?.questions[index];
  return { question, check: context?.check, loading: context?.loading ?? false };
}
