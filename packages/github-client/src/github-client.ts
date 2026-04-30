import { Octokit } from "@octokit/rest";
import type { GitHubIssue, OrgMember } from "./types.js";

export class GitHubClient {
  private readonly octokit: Octokit;

  constructor(token?: string, baseUrl = "https://api.github.com") {
    this.octokit = new Octokit({
      auth: token ?? process.env["GITHUB_TOKEN"],
      baseUrl,
    });
  }

  async listIssues(
    owner: string,
    repo: string,
    from: Date,
    to: Date
  ): Promise<GitHubIssue[]> {
    return this.searchItems(owner, repo, "issue", from, to);
  }

  async listPRs(
    owner: string,
    repo: string,
    from: Date,
    to: Date
  ): Promise<GitHubIssue[]> {
    return this.searchItems(owner, repo, "pr", from, to);
  }

  async listOrgMembers(org: string): Promise<OrgMember[]> {
    const members = await this.octokit.paginate(
      this.octokit.rest.orgs.listMembers,
      { org, per_page: 100 }
    );

    return Promise.all(
      members.map(async (member) => {
        const { data } = await this.octokit.rest.users.getByUsername({
          username: member.login,
        });
        return {
          id: data.id,
          login: data.login,
          name: data.name ?? null,
          email: data.email ?? null,
          createdAt: data.created_at,
          talentId: null,
          jobRole: null,
        };
      })
    );
  }

  private async searchItems(
    owner: string,
    repo: string,
    itemType: "issue" | "pr",
    from: Date,
    to: Date
  ): Promise<GitHubIssue[]> {
    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];
    const q = `repo:${owner}/${repo} is:${itemType} created:${fromStr}..${toStr}`;

    const items = await this.octokit.paginate(
      this.octokit.rest.search.issuesAndPullRequests,
      { q, per_page: 100 }
    );

    return items.map((item) => ({
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
      labels: item.labels.map((label) =>
        typeof label === "string" ? label : (label.name ?? "")
      ),
      author: item.user?.login ?? "",
      assignees: item.assignees?.map((a) => a.login) ?? [],
      type: itemType,
    }));
  }
}
