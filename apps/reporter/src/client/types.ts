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

export interface MonthlyTimeToClose {
  month: string;
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
  timeToCloseByMonth: MonthlyTimeToClose[];
  byDay: Array<{ date: string; issues: number; prs: number }>;
}

export interface IssuesResponse {
  issues: GitHubIssueDTO[];
  stats: IssueStats;
  total: number;
}

export interface RepositoryReport {
  repository: string;
  byDay: Array<{ date: string; issues: number; prs: number }>;
}

export interface ReportResponse {
  repositories: RepositoryReport[];
}

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

export interface WeeklyThroughput {
  week: string;
  issues: number;
  prs: number;
}

export interface ThroughputResponse {
  byWeek: WeeklyThroughput[];
}

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

export interface OrgMember {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  talentId: string | null;
  jobRole: string | null;
}
