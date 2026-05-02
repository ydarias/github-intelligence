import type { GithubIssue } from "@github-intelligence/issues-collector";

export interface AgingWipItem {
  id: number;
  number: number;
  title: string;
  url: string;
  repository: string;
  type: "issue" | "pr";
  ageDays: number;
  author: string;
  assignees: string[];
  labels: string[];
}

export function computeAgingWip(items: GithubIssue[], today?: string): AgingWipItem[] {
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
