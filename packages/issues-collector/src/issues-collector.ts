import type { GitHubClient, GitHubIssue } from "@github-intelligence/github-client";
import type { IssuesRepository } from "./issues-repository.js";
import type { FetchIssuesOptions } from "./types.js";

export class IssuesCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: IssuesRepository
  ) {}

  async collect(options: FetchIssuesOptions): Promise<GitHubIssue[]> {
    const { owner, repo, from, to } = options;
    const key = `${owner}/${repo}/${from.toISOString()}/${to.toISOString()}`;

    const cached = this.repository.load(key);
    if (cached !== undefined) {
      return cached;
    }

    const issues = await this.client.listIssues(owner, repo, from, to);
    this.repository.save(key, issues);
    return issues;
  }
}
