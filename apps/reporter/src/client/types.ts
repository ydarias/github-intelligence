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

export interface IssuesResponse {
  issues: GitHubIssueDTO[];
  stats: IssueStats;
  total: number;
}
