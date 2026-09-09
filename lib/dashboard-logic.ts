export type SpeedRankItem = { completion: number; duration: number };

export function compareCompletionSpeed(a: SpeedRankItem, b: SpeedRankItem) {
  return b.completion - a.completion || a.duration - b.duration;
}

export function rankWindow<T extends { userId: string }>(items: T[], userId: string, compare: (a: T, b: T) => number) {
  const sorted = [...items].sort(compare).map((item, index) => ({ ...item, rank: index + 1 }));
  const ownIndex = sorted.findIndex((item) => item.userId === userId);
  if (ownIndex < 0) return [];
  return sorted.slice(Math.max(0, ownIndex - 2), Math.min(sorted.length, ownIndex + 3));
}
