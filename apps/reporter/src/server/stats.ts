import type { GitHubIssue } from "@github-intelligence/issues-collector";

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  byDay: Array<{ date: string; issues: number; prs: number }>;
}

export function computeStats(items: GitHubIssue[]): IssueStats {
  const open = items.filter((i) => i.state === "open").length;
  const closed = items.filter((i) => i.state === "closed").length;

  const issuesByDay = new Map<string, number>();
  const prsByDay = new Map<string, number>();

  for (const item of items) {
    const day = item.createdAt.slice(0, 10);
    if (item.type === "pr") {
      prsByDay.set(day, (prsByDay.get(day) ?? 0) + 1);
    } else {
      issuesByDay.set(day, (issuesByDay.get(day) ?? 0) + 1);
    }
  }

  const allDays = new Set([...issuesByDay.keys(), ...prsByDay.keys()]);
  const byDay = Array.from(allDays)
    .map((date) => ({ date, issues: issuesByDay.get(date) ?? 0, prs: prsByDay.get(date) ?? 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { total: items.length, open, closed, byDay };
}
