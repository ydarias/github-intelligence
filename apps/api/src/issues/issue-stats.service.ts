import type {
  GithubIssue,
  IssueStats,
  MonthlyTimeToClose,
  OrgMember,
  TimeToClosePercentiles,
} from "@github-intelligence/api-contracts";
import { Injectable } from "@nestjs/common";

import { IssueOriginsService } from "./issue-origins.service.js";

@Injectable()
export class IssueStatsService {
  constructor(private readonly issueOriginsService: IssueOriginsService) {}

  compute(items: GithubIssue[], members: OrgMember[]): IssueStats {
    const issues = items.filter((i) => i.type === "issue");
    const prs = items.filter((i) => i.type === "pr");

    const open = issues.filter((i) => i.state === "open").length;
    const closed = issues.filter((i) => i.state === "closed").length;
    const openPRs = prs.filter((i) => i.state === "open").length;
    const closedPRs = prs.filter((i) => i.state === "closed").length;

    const allDates = items.map((i) => i.createdAt.slice(0, 10));
    const totalDays = this.calendarDaysInRange(allDates);
    const avgIssuesPerDay = issues.length / totalDays;
    const avgPRsPerDay = prs.length / totalDays;

    const closedItems = items.filter((i) => i.state === "closed" && i.closedAt !== null);
    const timeToCloseHours = closedItems
      .map(
        (i) =>
          (new Date(i.closedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60),
      )
      .sort((a, b) => a - b);

    const timeToClosePercentiles: TimeToClosePercentiles | null =
      timeToCloseHours.length > 0
        ? {
            p50: this.nearestRankPercentile(timeToCloseHours, 50),
            p75: this.nearestRankPercentile(timeToCloseHours, 75),
            p90: this.nearestRankPercentile(timeToCloseHours, 90),
            p99: this.nearestRankPercentile(timeToCloseHours, 99),
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
      timeToCloseByMonth: this.computeTimeToCloseByMonth(items),
      byAuthor: this.issueOriginsService.compute(items, members),
      byDay,
    };
  }

  computeTimeToCloseByMonth(items: GithubIssue[]): MonthlyTimeToClose[] {
    const closedItems = items.filter((i) => i.state === "closed" && i.closedAt !== null);

    const byMonth = new Map<string, number[]>();
    for (const item of closedItems) {
      const month = item.closedAt!.slice(0, 7);
      const hours =
        (new Date(item.closedAt!).getTime() - new Date(item.createdAt).getTime()) /
        (1000 * 60 * 60);
      const bucket = byMonth.get(month) ?? [];
      bucket.push(hours);
      byMonth.set(month, bucket);
    }

    return Array.from(byMonth.entries())
      .map(([month, hours]) => {
        const sorted = [...hours].sort((a, b) => a - b);
        return {
          month,
          p50: this.nearestRankPercentile(sorted, 50),
          p75: this.nearestRankPercentile(sorted, 75),
          p90: this.nearestRankPercentile(sorted, 90),
          p99: this.nearestRankPercentile(sorted, 99),
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  private nearestRankPercentile(sorted: number[], p: number): number {
    const rank = Math.ceil((p / 100) * sorted.length);
    return sorted[rank - 1] ?? 0;
  }

  private calendarDaysInRange(dates: string[]): number {
    if (dates.length === 0) return 1;
    const min = dates.reduce((a, b) => (a < b ? a : b));
    const max = dates.reduce((a, b) => (a > b ? a : b));
    return (
      Math.round((new Date(max).getTime() - new Date(min).getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }
}
