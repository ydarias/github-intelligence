import { Octokit } from "@octokit/rest";
import type { OrgMember } from "./types.js";

export class GitHubClient {
  private readonly octokit: Octokit;

  constructor(token?: string, baseUrl = "https://api.github.com") {
    this.octokit = new Octokit({
      auth: token ?? process.env["GITHUB_TOKEN"],
      baseUrl,
    });
  }

  async listOrgMembers(org: string): Promise<OrgMember[]> {
    const members = await this.octokit.paginate(
      this.octokit.rest.orgs.listMembers,
      { org, per_page: 100 }
    );

    const detailed = await Promise.all(
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
        };
      })
    );

    return detailed;
  }
}
