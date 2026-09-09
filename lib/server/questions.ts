import "server-only";
import { db } from "@/lib/db";

export async function getPublishedQuestions(interactionId: string) {
  const questions = await db.question.findMany({ where: { interactionId, isPublished: true }, orderBy: { order: "asc" } });
  return questions.map((item) => ({
    id: item.id,
    key: item.key,
    prompt: item.prompt,
    options: Array.isArray(item.options) ? item.options.map(String) : [],
    feedback: Array.isArray(item.feedback) ? item.feedback.map(String) : [],
    version: item.version,
  }));
}
