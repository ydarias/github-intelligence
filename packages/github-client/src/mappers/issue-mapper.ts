import type { GithubElementType } from "../types/github-element-type.js";
import type { GithubIssue } from "../types/github-issue.js";
import type { OctokitSearchItem } from "../types/octokit-search-item.js";

export const issueMapper = {
  toGitHubIssue(item: OctokitSearchItem, repo: string, type: GithubElementType): GithubIssue {
    return {
      id: item.id,
      number: item.number,
      repository: repo,
      title: item.title,
      body: item.body ?? null,
      state: item.state,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      closedAt: item.closed_at ?? null,
      url: item.html_url,
      labels: item.labels.map((label) => (typeof label === "string" ? label : (label.name ?? ""))),
      author: item.user?.login ?? "",
      assignees: item.assignees?.map((a) => a.login) ?? [],
      type,
    };
  },
};
