import type { GitHubClient, GitHubIssue } from "@github-intelligence/github-client";
import type { PullRequestsRepository } from "./pull-requests-repository.js";
import type { FetchIssuesOptions } from "./types.js";

export class PullRequestsCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: PullRequestsRepository
  ) {}

  async collect(options: FetchIssuesOptions): Promise<GitHubIssue[]> {
    const { owner, repo, from, to } = options;
    const key = `${owner}/${repo}/${from.toISOString()}/${to.toISOString()}`;

    const cached = this.repository.load(key);
    if (cached !== undefined) {
      return cached;
    }

    const prs = await this.client.listPRs(owner, repo, from, to);
    this.repository.save(key, prs);
    return prs;
  }
}
