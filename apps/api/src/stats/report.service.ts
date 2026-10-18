import type {
  ReportDay,
  ReportResponse,
  RepositoryReport,
} from "@github-intelligence/api-contracts";
import type { GithubIssue } from "@github-intelligence/issues";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ReportService {
  compute(items: GithubIssue[], today?: string): ReportResponse {
    const endDate = today ?? this.toDateStr(new Date());

    const byRepo = new Map<string, { issues: GithubIssue[]; prs: GithubIssue[] }>();

    for (const item of items) {
      if (!byRepo.has(item.repository)) {
        byRepo.set(item.repository, { issues: [], prs: [] });
      }
      const group = byRepo.get(item.repository)!;
      if (item.type === "issue") {
        group.issues.push(item);
      } else {
        group.prs.push(item);
      }
    }

    const repositories: RepositoryReport[] = Array.from(byRepo.entries()).map(
      ([repository, { issues, prs }]) => ({
        repository,
        byDay: this.openCountsByDay(issues, prs, endDate),
      }),
    );

    return { repositories };
  }

  private toDateStr(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr);
    d.setUTCDate(d.getUTCDate() + n);
    return this.toDateStr(d);
  }

  private enumerateDays(from: string, to: string): string[] {
    const days: string[] = [];
    let current = from;
    while (current <= to) {
      days.push(current);
      current = this.addDays(current, 1);
    }
    return days;
  }

  private openCountsByDay(issues: GithubIssue[], prs: GithubIssue[], today: string): ReportDay[] {
    const allItems = [...issues, ...prs];
    if (allItems.length === 0) return [];

    const issueDelta = new Map<string, number>();
    const prDelta = new Map<string, number>();

    for (const item of issues) {
      const open = item.createdAt.slice(0, 10);
      issueDelta.set(open, (issueDelta.get(open) ?? 0) + 1);
      if (item.closedAt !== null) {
        const close = item.closedAt.slice(0, 10);
        issueDelta.set(close, (issueDelta.get(close) ?? 0) - 1);
      }
    }

    for (const item of prs) {
      const open = item.createdAt.slice(0, 10);
      prDelta.set(open, (prDelta.get(open) ?? 0) + 1);
      if (item.closedAt !== null) {
        const close = item.closedAt.slice(0, 10);
        prDelta.set(close, (prDelta.get(close) ?? 0) - 1);
      }
    }

    const minDay = allItems.map((i) => i.createdAt.slice(0, 10)).reduce((a, b) => (a < b ? a : b));

    let runningIssues = 0;
    let runningPrs = 0;

    return this.enumerateDays(minDay, today).map((date) => {
      runningIssues += issueDelta.get(date) ?? 0;
      runningPrs += prDelta.get(date) ?? 0;
      return { date, issues: runningIssues, prs: runningPrs };
    });
  }
}
