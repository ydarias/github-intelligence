import type { GitHubClient } from "./github-client.js";
import type { MembersRepository } from "./members-repository.js";
import { SupportDataReader } from "./support-data-reader.js";
import type { OrgMember } from "./types.js";

export class MembersCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: MembersRepository
  ) {}

  async fetch(org: string): Promise<OrgMember[]> {
    // const cached = this.repository.load(org);
    // if (cached !== undefined) {
    //   return cached;
    // }

    const supportData = SupportDataReader.load();
    const members = await this.client.listOrgMembers(org);

    const enriched = members.map((member) => {
      const entry = member.email !== null ? supportData.get(member.email.trim().toLowerCase()) : undefined;
      return {
        ...member,
        talentId: entry?.talentId ?? null,
        jobRole: entry?.jobRole ?? null,
      };
    });

    this.repository.save(org, enriched);
    return enriched;
  }
}
