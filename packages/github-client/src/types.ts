export interface GitHubIssue {
  id: number;
  number: number;
  repository: string;
  title: string;
  body: string | null;
  state: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  url: string;
  labels: string[];
  author: string;
  assignees: string[];
  type: "issue" | "pr";
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
