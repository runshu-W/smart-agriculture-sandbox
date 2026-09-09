export type SimpleResult = { score: number; firstCorrect: boolean; finalCorrect: boolean; completed: boolean };
export type QuestionResponse = { key: string; answer: string; correct: boolean; version: number };

export function getClientTimestamp() {
  return Date.now();
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("保存超时，请检查服务后重试");
    }
    throw new Error("网络或数据服务暂不可用，请重试", { cause: error });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function beginSimpleInteraction(interactionId: string, entry = "unit-map") {
  const response = await fetchWithTimeout(`/api/interactions/${interactionId}/attempts?entry=${encodeURIComponent(entry)}`, { method: "POST" });
  if (!response.ok) throw new Error("无法建立互动记录");
  return response.json() as Promise<{ attemptId: string; sessionId: string }>;
}

export async function submitSimpleInteraction(interactionId: string, attemptId: string, body: {
  durationMs: number;
  narrationCompleted: boolean;
  answers: string[];
  questionResponses?: QuestionResponse[];
  actionSummary: Record<string, boolean | number | string>;
  privateContent?: Record<string, string | string[]>;
}) {
  const response = await fetchWithTimeout(`/api/interactions/${interactionId}/attempts/${attemptId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("互动记录提交失败");
  return response.json() as Promise<SimpleResult>;
}
