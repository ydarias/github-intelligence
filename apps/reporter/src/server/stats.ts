import type { GitHubIssue } from "@github-intelligence/issues-collector";

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  byDay: Array<{ date: string; count: number }>;
}

export function computeStats(issues: GitHubIssue[]): IssueStats {
  const open = issues.filter((i) => i.state === "open").length;
  const closed = issues.filter((i) => i.state === "closed").length;

  const dayMap = new Map<string, number>();
  for (const issue of issues) {
    const day = issue.createdAt.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  const byDay = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { total: issues.length, open, closed, byDay };
}
