import type { GithubElementType } from "./github-element-type.js";

export interface GithubIssue {
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
  type: GithubElementType;
}
