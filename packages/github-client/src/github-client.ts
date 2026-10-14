import { Octokit } from "@octokit/rest";

import { issueMapper } from "./mappers/issue-mapper.js";
import { memberMapper } from "./mappers/member-mapper.js";
import { DateWindow } from "./search/date-window.js";
import { OctokitSearchPort } from "./search/octokit-search-port.js";
import { SearchWindowFetcher } from "./search/search-window-fetcher.js";
import type { GithubElementType } from "./types/github-element-type.js";
import type { GithubIssue } from "./types/github-issue.js";
import type { OrgMember } from "./types/org-member.js";
import type { SearchProgressListener } from "./types/search-progress-listener.js";

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
    to: Date,
    listener?: SearchProgressListener,
  ): Promise<GithubIssue[]> {
    return this.searchItems(owner, repo, "issue", from, to, listener);
  }

  async listPRs(
    owner: string,
    repo: string,
    from: Date,
    to: Date,
    listener?: SearchProgressListener,
  ): Promise<GithubIssue[]> {
    return this.searchItems(owner, repo, "pr", from, to, listener);
  }

  async listOrgMembers(org: string): Promise<OrgMember[]> {
    const members = await this.octokit.paginate(this.octokit.rest.orgs.listMembers, {
      org,
      per_page: 100,
    });

    return Promise.all(
      members.map(async (member) => {
        const { data } = await this.octokit.rest.users.getByUsername({
          username: member.login,
        });
        return memberMapper.toOrgMember(data);
      }),
    );
  }

  private async searchItems(
    owner: string,
    repo: string,
    itemType: GithubElementType,
    from: Date,
    to: Date,
    listener?: SearchProgressListener,
  ): Promise<GithubIssue[]> {
    const port = new OctokitSearchPort(this.octokit, `repo:${owner}/${repo} is:${itemType}`);
    const fetcher = new SearchWindowFetcher(port, listener);
    const items = await fetcher.fetch(DateWindow.fromDates(from, to));

    return items.map((item) => issueMapper.toGitHubIssue(item, repo, itemType));
  }
}
