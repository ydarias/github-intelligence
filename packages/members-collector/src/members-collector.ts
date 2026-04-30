import type { GitHubClient, OrgMember } from "@github-intelligence/github-client";
import type { MembersRepository } from "./members-repository.js";
import { SupportDataReader } from "./support-data-reader.js";

export class MembersCollector {
  constructor(
    private readonly client: GitHubClient,
    private readonly repository: MembersRepository
  ) {}

  async fetch(org: string): Promise<OrgMember[]> {
    // TODO there should be a way to force the reload
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
