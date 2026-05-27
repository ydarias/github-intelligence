import type { GithubIssue } from "@github-intelligence/issues-collector";

export interface QuickCloseByDay {
  date: string;
  count: number;
}

export interface QuickCloseResponse {
  byDay: QuickCloseByDay[];
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function computeQuickClose(items: GithubIssue[]): QuickCloseResponse {
  const countByDay = new Map<string, number>();

  for (const item of items) {
    if (item.type !== "issue" || item.closedAt === null) continue;
    const cycleMs = new Date(item.closedAt).getTime() - new Date(item.createdAt).getTime();
    if (cycleMs < TWO_HOURS_MS) {
      const day = item.createdAt.slice(0, 10);
      countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
    }
  }

  const byDay = Array.from(countByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { byDay };
}
