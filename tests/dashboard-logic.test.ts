import { describe, expect, it } from "vitest";
import { compareCompletionSpeed, rankWindow } from "@/lib/dashboard-logic";

describe("privacy-safe leaderboard", () => {
  const items = Array.from({ length: 9 }, (_, index) => ({ userId: `s-${index + 1}`, completion: 80, duration: (index + 1) * 100, literacy: 90 - index }));

  it("returns only the student and the two neighbors on each side", () => {
    const window = rankWindow(items, "s-5", (a, b) => b.literacy - a.literacy);
    expect(window.map((item) => item.userId)).toEqual(["s-3", "s-4", "s-5", "s-6", "s-7"]);
    expect(window).toHaveLength(5);
  });

  it("does not leak a leaderboard when the student is absent", () => {
    expect(rankWindow(items, "unknown", compareCompletionSpeed)).toEqual([]);
  });

  it("sorts completion before effective duration", () => {
    const sorted = [{ completion: 50, duration: 10 }, { completion: 100, duration: 300 }, { completion: 100, duration: 200 }].sort(compareCompletionSpeed);
    expect(sorted).toEqual([{ completion: 100, duration: 200 }, { completion: 100, duration: 300 }, { completion: 50, duration: 10 }]);
  });
});
