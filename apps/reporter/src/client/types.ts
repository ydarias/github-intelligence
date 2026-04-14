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
}

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  byDay: Array<{ date: string; count: number }>;
}

export interface IssuesResponse {
  issues: GitHubIssueDTO[];
  stats: IssueStats;
  total: number;
}
