import type { GithubIssue } from "@github-intelligence/issues-collector";

export interface CycleTimeItem {
  id: number;
  title: string;
  url: string;
  repository: string;
  type: "issue" | "pr";
  closeDate: string;
  cycleDays: number;
}

export interface CycleTimeResponse {
  items: CycleTimeItem[];
}

export function computeCycleTime(items: GithubIssue[]): CycleTimeResponse {
  const result = items
    .filter((i) => i.closedAt !== null)
    .map((i) => ({
      id: i.id,
      title: i.title,
      url: i.url,
      repository: i.repository,
      type: i.type as "issue" | "pr",
      closeDate: i.closedAt!.slice(0, 10),
      cycleDays: Math.floor(
        (new Date(i.closedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
    }))
    .sort((a, b) => a.closeDate.localeCompare(b.closeDate));

  return { items: result };
}
