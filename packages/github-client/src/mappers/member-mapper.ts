import type { OctokitUserData } from "../types/octokit-user-data.js";
import type { OrgMember } from "../types/org-member.js";

export const memberMapper = {
  toOrgMember(data: OctokitUserData): OrgMember {
    return {
      id: data.id,
      login: data.login,
      name: data.name ?? null,
      email: data.email ?? null,
      createdAt: data.created_at,
      talentId: null,
      jobRole: null,
    };
  },
};
