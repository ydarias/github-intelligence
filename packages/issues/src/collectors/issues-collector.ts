import type { GitHubClient, GithubIssue } from "@github-intelligence/github-client";

import type { IssuesRepository } from "../repositories/issues-repository.js";
import type { FetchIssuesOptions } from "../types/fetchIssuesOptions.js";

export class IssuesCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: IssuesRepository,
  ) {}

  async collect(options: FetchIssuesOptions): Promise<GithubIssue[]> {
    const { owner, repo, from, to, listener } = options;
    const issues = await this.client.listIssues(owner, repo, from, to, listener);
    this.repository.saveAll(issues);
    return issues;
  }
}
