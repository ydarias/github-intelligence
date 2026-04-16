export interface GitHubIssueDTO {
  id: number;
  number: number;
  repository: string;
  title: string;
  state: string;
  createdAt: string;
  closedAt: string | null;
  url: string;
  author: string;
  labels: string[];
  assignees: string[];
  type: "issue" | "pr";
}

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

export interface IssuesResponse {
  issues: GitHubIssueDTO[];
  stats: IssueStats;
  total: number;
}
