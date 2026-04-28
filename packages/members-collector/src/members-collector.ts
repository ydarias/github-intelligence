import type { GitHubClient } from "./github-client.js";
import type { MembersRepository } from "./members-repository.js";
import type { OrgMember } from "./types.js";

export class MembersCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: MembersRepository
  ) {}

  async fetch(org: string): Promise<OrgMember[]> {
    const cached = this.repository.load(org);
    if (cached !== undefined) {
      return cached;
    }

    const members = await this.client.listOrgMembers(org);
    this.repository.save(org, members);
    return members;
  }
}
