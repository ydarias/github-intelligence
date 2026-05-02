import type { GithubIssue } from "@github-intelligence/issues-collector";

export interface WeeklyThroughput {
  week: string;
  issues: number;
  prs: number;
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
  const issuesByWeek = new Map<string, number>();
  const prsByWeek = new Map<string, number>();

  for (const item of items) {
    if (item.closedAt === null) continue;
    const week = toWeekStart(item.closedAt);
    if (item.type === "pr") {
      prsByWeek.set(week, (prsByWeek.get(week) ?? 0) + 1);
    } else {
      issuesByWeek.set(week, (issuesByWeek.get(week) ?? 0) + 1);
    }
  }

  const allWeeks = new Set([...issuesByWeek.keys(), ...prsByWeek.keys()]);
  const byWeek = Array.from(allWeeks)
    .map((week) => ({
      week,
      issues: issuesByWeek.get(week) ?? 0,
      prs: prsByWeek.get(week) ?? 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  return { byWeek };
}
