import type { GithubIssue } from "@github-intelligence/issues";

export interface ThroughputItem {
  id: number;
  title: string;
  url: string;
  repository: string;
  type: "issue" | "pr";
}

export interface WeeklyThroughput {
  week: string;
  issues: number;
  prs: number;
  items: ThroughputItem[];
}

export interface ThroughputResponse {
  byWeek: WeeklyThroughput[];
}

function toWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function computeThroughput(items: GithubIssue[]): ThroughputResponse {
  const byWeekMap = new Map<string, ThroughputItem[]>();

  for (const item of items) {
    if (item.closedAt === null) continue;
    const week = toWeekStart(item.closedAt);
    const weekItems = byWeekMap.get(week) ?? [];
    weekItems.push({ id: item.id, title: item.title, url: item.url, repository: item.repository, type: item.type });
    byWeekMap.set(week, weekItems);
  }

  const byWeek = Array.from(byWeekMap.entries())
    .map(([week, weekItems]) => {
      const sortedItems = [...weekItems].sort((a, b) => a.type.localeCompare(b.type));
      return {
        week,
        issues: weekItems.filter((i) => i.type === "issue").length,
        prs: weekItems.filter((i) => i.type === "pr").length,
        items: sortedItems,
      };
    })
    .sort((a, b) => a.week.localeCompare(b.week));

  return { byWeek };
}
