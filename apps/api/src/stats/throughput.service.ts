import type { ThroughputItem, ThroughputResponse } from "@github-intelligence/api-contracts";
import type { GithubIssue } from "@github-intelligence/issues";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ThroughputService {
  compute(items: GithubIssue[]): ThroughputResponse {
    const byWeekMap = new Map<string, ThroughputItem[]>();

    for (const item of items) {
      if (item.closedAt === null) continue;
      const week = this.toWeekStart(item.closedAt);
      const weekItems = byWeekMap.get(week) ?? [];
      weekItems.push({
        id: item.id,
        title: item.title,
        url: item.url,
        repository: item.repository,
        type: item.type,
      });
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

  private toWeekStart(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().slice(0, 10);
  }
}
