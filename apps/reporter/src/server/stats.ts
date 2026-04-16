import type { GitHubIssue } from "@github-intelligence/issues-collector";

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  totalPRs: number;
  openPRs: number;
  closedPRs: number;
  avgTimeToCloseHours: number | null;
  medianTimeToCloseHours: number | null;
  byDay: Array<{ date: string; issues: number; prs: number }>;
}

export function computeStats(items: GitHubIssue[]): IssueStats {
  const issues = items.filter((i) => i.type === "issue");
  const prs = items.filter((i) => i.type === "pr");

  const open = issues.filter((i) => i.state === "open").length;
  const closed = issues.filter((i) => i.state === "closed").length;
  const openPRs = prs.filter((i) => i.state === "open").length;
  const closedPRs = prs.filter((i) => i.state === "closed").length;

  const closedItems = items.filter((i) => i.state === "closed" && i.closedAt !== null);
  const timeToCloseHours = closedItems.map((i) => {
    const ms = new Date(i.closedAt!).getTime() - new Date(i.createdAt).getTime();
    return ms / (1000 * 60 * 60);
  });

  let avgTimeToCloseHours: number | null = null;
  let medianTimeToCloseHours: number | null = null;

  if (timeToCloseHours.length > 0) {
    avgTimeToCloseHours = timeToCloseHours.reduce((sum, h) => sum + h, 0) / timeToCloseHours.length;
    const sorted = [...timeToCloseHours].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianTimeToCloseHours = sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);
  }

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

  return {
    total: issues.length,
    open,
    closed,
    totalPRs: prs.length,
    openPRs,
    closedPRs,
    avgTimeToCloseHours,
    medianTimeToCloseHours,
    byDay,
  };
}
