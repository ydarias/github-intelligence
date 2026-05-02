import type { GitHubClient, GithubIssue } from "@github-intelligence/github-client";

import type { PullRequestsRepository } from "../repositories/pull-requests-repository.js";
import type { FetchIssuesOptions } from "../types/fetchIssuesOptions.js";

export class PullRequestsCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: PullRequestsRepository,
  ) {}

  async collect(options: FetchIssuesOptions): Promise<GithubIssue[]> {
    const { owner, repo, from, to } = options;
    const prs = await this.client.listPRs(owner, repo, from, to);
    this.repository.saveAll(prs);
    return prs;
  }
}
