import type { QuickCloseItem, QuickCloseResponse } from "@github-intelligence/api-contracts";
import type { GithubIssue } from "@github-intelligence/issues";
import { Injectable } from "@nestjs/common";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

@Injectable()
export class QuickCloseService {
  compute(items: GithubIssue[]): QuickCloseResponse {
    const countByDay = new Map<string, number>();
    const matchingItems: QuickCloseItem[] = [];

    for (const item of items) {
      if (item.type !== "issue" || item.closedAt === null) continue;
      const cycleMs = new Date(item.closedAt).getTime() - new Date(item.createdAt).getTime();
      if (cycleMs < TWO_HOURS_MS) {
        const day = item.createdAt.slice(0, 10);
        countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
        matchingItems.push({
          id: item.id,
          number: item.number,
          repository: item.repository,
          title: item.title,
          url: item.url,
        });
      }
    }

    const byDay = Array.from(countByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { byDay, items: matchingItems };
  }
}
