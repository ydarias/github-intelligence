import type { AgingWipItem } from "@github-intelligence/api-contracts";
import type { GithubIssue } from "@github-intelligence/issues";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AgingWipService {
  compute(items: GithubIssue[], today?: string): AgingWipItem[] {
    const endDate = today ?? new Date().toISOString().slice(0, 10);
    const endMs = new Date(endDate).getTime();

    return items
      .filter((i) => i.state === "open")
      .map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        url: i.url,
        repository: i.repository,
        type: i.type as "issue" | "pr",
        ageDays: Math.floor((endMs - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        author: i.author,
        assignees: i.assignees,
        labels: i.labels,
      }))
      .sort((a, b) => b.ageDays - a.ageDays);
  }
}
