import type { GitHubIssue } from "@github-intelligence/issues-collector";

export interface TimeToClosePercentiles {
  p50: number;
  p75: number;
  p90: number;
  p99: number;
}

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  totalPRs: number;
  openPRs: number;
  closedPRs: number;
  avgIssuesPerDay: number;
  avgPRsPerDay: number;
  timeToClosePercentiles: TimeToClosePercentiles | null;
  byDay: Array<{ date: string; issues: number; prs: number }>;
}

function nearestRankPercentile(sorted: number[], p: number): number {
  const rank = Math.ceil(p / 100 * sorted.length);
  return sorted[rank - 1] ?? 0;
}

function calendarDaysInRange(dates: string[]): number {
  if (dates.length === 0) return 1;
  const min = dates.reduce((a, b) => (a < b ? a : b));
  const max = dates.reduce((a, b) => (a > b ? a : b));
  return Math.round((new Date(max).getTime() - new Date(min).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function computeStats(items: GitHubIssue[]): IssueStats {
  const issues = items.filter((i) => i.type === "issue");
  const prs = items.filter((i) => i.type === "pr");

  const open = issues.filter((i) => i.state === "open").length;
  const closed = issues.filter((i) => i.state === "closed").length;
  const openPRs = prs.filter((i) => i.state === "open").length;
  const closedPRs = prs.filter((i) => i.state === "closed").length;

  const allDates = items.map((i) => i.createdAt.slice(0, 10));
  const totalDays = calendarDaysInRange(allDates);
  const avgIssuesPerDay = issues.length / totalDays;
  const avgPRsPerDay = prs.length / totalDays;

  const closedItems = items.filter((i) => i.state === "closed" && i.closedAt !== null);
  const timeToCloseHours = closedItems
    .map((i) => (new Date(i.closedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60))
    .sort((a, b) => a - b);

  const timeToClosePercentiles: TimeToClosePercentiles | null = timeToCloseHours.length > 0
    ? {
        p50: nearestRankPercentile(timeToCloseHours, 50),
        p75: nearestRankPercentile(timeToCloseHours, 75),
        p90: nearestRankPercentile(timeToCloseHours, 90),
        p99: nearestRankPercentile(timeToCloseHours, 99),
      }
    : null;

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
    avgIssuesPerDay,
    avgPRsPerDay,
    timeToClosePercentiles,
    byDay,
  };
}
